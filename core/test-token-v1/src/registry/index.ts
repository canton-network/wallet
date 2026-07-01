// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TestToken registry — HTTP server entry point.
 *
 * Wires the HTTP router, all feature-slice route handlers, and the ledger client
 * into a single `startTestTokenRegistry()` factory. Given a deployment config
 * (admin party, the synchronizers on which `TokenRules` contracts must exist,
 * and a callback that performs the signed `TokenRules` creation), the server
 * creates the `TokenRules` contracts as part of initialization and then serves
 * the Token Standard off-ledger registry APIs for them. Once started, the token
 * looks like any other CIP-56 token: it has an admin party and a registry URL
 * that serves the choice contexts.
 *
 * Implements all four Token Standard off-ledger registry APIs:
 *   api-specs/splice/0.6.1/token-metadata-v1.yaml
 *   api-specs/splice/0.6.1/transfer-instruction-v1.yaml
 *   api-specs/splice/0.6.1/allocation-instruction-v1.yaml
 *   api-specs/splice/0.6.1/allocation-v1.yaml
 */

import {
    createServer,
    type IncomingMessage,
    type Server,
    type ServerResponse,
} from 'node:http'
import type { Logger } from 'pino'
import type { LedgerClient } from '@canton-network/core-ledger-client'
import { buildLedgerClient, invalidateCache, readTokenRules } from './ledger.js'
import type { TokenRulesContract } from './ledger.js'
import { createRouter, respond, readBody } from './http/router.js'
import type { GetFactoryRequest, GetChoiceContextRequest } from './types.js'
import { createMetadataHandlers } from './features/metadata/handlers.js'
import { createTransferHandlers } from './features/transfer/handlers.js'
import { createAllocationInstructionHandlers } from './features/allocation-instruction/handlers.js'
import { createAllocationHandlers } from './features/allocation/handlers.js'

// ── static instrument metadata ─────────────────────────────────────────────
const TEST_TOKEN_INSTRUMENT_ID = 'TestToken'

// ── Route table (source of truth: api-specs/splice/0.6.1/) ────────────────
interface RouteEntry {
    method: string
    pattern: string
    operationId: string
    nullable?: boolean
}

const ROUTES: RouteEntry[] = [
    // token-metadata-v1
    {
        method: 'GET',
        pattern: '/registry/metadata/v1/info',
        operationId: 'getRegistryInfo',
    },
    {
        method: 'GET',
        pattern: '/registry/metadata/v1/instruments',
        operationId: 'listInstruments',
    },
    {
        method: 'GET',
        pattern: '/registry/metadata/v1/instruments/:instrumentId',
        operationId: 'getInstrument',
        nullable: true,
    },
    // transfer-instruction-v1
    {
        method: 'POST',
        pattern: '/registry/transfer-instruction/v1/transfer-factory',
        operationId: 'getTransferFactory',
        nullable: true,
    },
    {
        method: 'POST',
        pattern:
            '/registry/transfer-instruction/v1/:transferInstructionId/choice-contexts/accept',
        operationId: 'getTransferInstructionAcceptContext',
    },
    {
        method: 'POST',
        pattern:
            '/registry/transfer-instruction/v1/:transferInstructionId/choice-contexts/reject',
        operationId: 'getTransferInstructionRejectContext',
    },
    {
        method: 'POST',
        pattern:
            '/registry/transfer-instruction/v1/:transferInstructionId/choice-contexts/withdraw',
        operationId: 'getTransferInstructionWithdrawContext',
    },
    // allocation-instruction-v1
    {
        method: 'POST',
        pattern: '/registry/allocation-instruction/v1/allocation-factory',
        operationId: 'getAllocationFactory',
        nullable: true,
    },
    // allocation-v1
    {
        method: 'POST',
        pattern:
            '/registry/allocations/v1/:allocationId/choice-contexts/execute-transfer',
        operationId: 'getAllocationTransferContext',
    },
    {
        method: 'POST',
        pattern:
            '/registry/allocations/v1/:allocationId/choice-contexts/withdraw',
        operationId: 'getAllocationWithdrawContext',
    },
    {
        method: 'POST',
        pattern:
            '/registry/allocations/v1/:allocationId/choice-contexts/cancel',
        operationId: 'getAllocationCancelContext',
    },
]

/**
 * Deployment configuration for a single TestToken instance.
 *
 * Describes how an instance of the test token should be deployed: which admin
 * party owns it, on which synchronizers its `TokenRules` contracts must be
 * created during initialization, and how to perform that (signed) creation.
 */
export interface TestTokenRegistryConfig {
    /** Admin party that owns the TestToken instrument and its `TokenRules`. */
    admin: string
    /** Port the registry HTTP server listens on. */
    port: number
    /** Base URL of the participant's JSON Ledger API used to read `TokenRules`. */
    ledgerUrl: URL
    logger: Logger
    /**
     * Synchronizers on which a `TokenRules` contract must be created as part of
     * initialization. `createTokenRules` is invoked once per entry.
     */
    synchronizerIds: string[]
    /**
     * Creates a `TokenRules` contract for `admin` on `synchronizerId`. This
     * encapsulates the (deployment-specific) signed ledger submission and is
     * called once per entry in `synchronizerIds` before the server starts
     * serving.
     */
    createTokenRules: (synchronizerId: string) => Promise<void>
    /**
     * Synchronizer whose `TokenRules` backs the transfer-instruction factory.
     * Defaults to `synchronizerIds[0]`.
     */
    transferSynchronizerId?: string
    /**
     * Synchronizer whose `TokenRules` backs the allocation-instruction factory.
     * Defaults to `synchronizerIds[0]`.
     */
    allocationSynchronizerId?: string
}

export interface TestTokenRegistry {
    /** Base URL at which the registry serves the Token Standard APIs. */
    registryUrl: URL
    /** Gracefully shuts the HTTP server down. */
    stop(): Promise<void>
}

/**
 * Deploys a TestToken instance and starts its registry HTTP server.
 *
 * Creates the `TokenRules` contracts described by `config` and then serves the
 * four Token Standard off-ledger registry APIs for them.
 *
 * @param config - Deployment configuration for the token instance.
 * @returns A handle with the registry URL and a `stop()` method.
 */
export async function startTestTokenRegistry(
    config: TestTokenRegistryConfig
): Promise<TestTokenRegistry> {
    const { admin, port, ledgerUrl, logger, synchronizerIds } = config

    if (synchronizerIds.length === 0)
        throw new Error(
            'startTestTokenRegistry: at least one synchronizer id is required'
        )

    const transferSynchronizerId =
        config.transferSynchronizerId ?? synchronizerIds[0]!
    const allocationSynchronizerId =
        config.allocationSynchronizerId ?? synchronizerIds[0]!

    // ── Initialization: create the TokenRules contracts the token needs ─────
    await Promise.all(
        synchronizerIds.map((synchronizerId) =>
            config.createTokenRules(synchronizerId)
        )
    )
    // TokenRules may already have been cached (as empty) by an earlier run.
    invalidateCache()
    logger.info(
        { admin, synchronizerIds },
        'TestToken TokenRules created on configured synchronizers'
    )

    const ledgerClient: LedgerClient = buildLedgerClient(ledgerUrl, logger)

    async function getTokenRules(
        synchronizerId?: string
    ): Promise<TokenRulesContract | null> {
        const all = await readTokenRules(ledgerClient, admin, logger)
        if (all.length === 0) return null
        if (!synchronizerId) return all[0]!
        return all.find((c) => c.synchronizerId === synchronizerId) ?? all[0]!
    }

    const metadata = createMetadataHandlers({
        adminPartyId: admin,
        instrumentId: TEST_TOKEN_INSTRUMENT_ID,
    })
    const transfer = createTransferHandlers({
        getTokenRules,
        transferSynchronizerId,
    })
    const allocInstr = createAllocationInstructionHandlers({
        getTokenRules,
        allocationSynchronizerId,
    })
    const alloc = createAllocationHandlers()

    // Dispatch map: operationId → (params, body) → Promise<result | null>
    type DispatchFn = (
        params: Record<string, string>,
        body: unknown
    ) => Promise<unknown>
    const dispatch = new Map<string, DispatchFn>([
        // Metadata
        ['getRegistryInfo', async () => metadata.getRegistryInfo()],
        ['listInstruments', async () => metadata.listInstruments()],
        [
            'getInstrument',
            async (p) =>
                metadata.getInstrument({ instrumentId: p['instrumentId']! }),
        ],
        // Transfer
        [
            'getTransferFactory',
            async (_, b) => transfer.getTransferFactory(b as GetFactoryRequest),
        ],
        [
            'getTransferInstructionAcceptContext',
            async (p, b) =>
                transfer.getTransferInstructionAcceptContext(
                    { transferInstructionId: p['transferInstructionId']! },
                    b as GetChoiceContextRequest
                ),
        ],
        [
            'getTransferInstructionRejectContext',
            async (p, b) =>
                transfer.getTransferInstructionRejectContext(
                    { transferInstructionId: p['transferInstructionId']! },
                    b as GetChoiceContextRequest
                ),
        ],
        [
            'getTransferInstructionWithdrawContext',
            async (p, b) =>
                transfer.getTransferInstructionWithdrawContext(
                    { transferInstructionId: p['transferInstructionId']! },
                    b as GetChoiceContextRequest
                ),
        ],
        // Allocation Instruction
        [
            'getAllocationFactory',
            async (_, b) =>
                allocInstr.getAllocationFactory(b as GetFactoryRequest),
        ],
        // Allocation
        [
            'getAllocationTransferContext',
            async (p, b) =>
                alloc.getAllocationTransferContext(
                    { allocationId: p['allocationId']! },
                    b as GetChoiceContextRequest
                ),
        ],
        [
            'getAllocationWithdrawContext',
            async (p, b) =>
                alloc.getAllocationWithdrawContext(
                    { allocationId: p['allocationId']! },
                    b as GetChoiceContextRequest
                ),
        ],
        [
            'getAllocationCancelContext',
            async (p, b) =>
                alloc.getAllocationCancelContext(
                    { allocationId: p['allocationId']! },
                    b as GetChoiceContextRequest
                ),
        ],
    ])

    const { route, matchRoute } = createRouter()
    for (const { method, pattern, operationId, nullable = false } of ROUTES) {
        route(method, pattern, async (_req, res, body, params) => {
            const fn = dispatch.get(operationId)!
            const result = await fn(params, body)
            if (nullable && result === null) {
                respond(res, 404, { error: `${operationId}: not found` })
            } else {
                respond(res, 200, result)
            }
        })
    }

    const server: Server = createServer(
        async (req: IncomingMessage, res: ServerResponse) => {
            const url = new URL(req.url ?? '/', 'http://localhost')
            const method = req.method?.toUpperCase() ?? 'GET'
            const pathname = url.pathname

            logger.debug({ method, pathname }, 'incoming registry request')

            try {
                const match = matchRoute(method, pathname)
                if (!match) {
                    respond(res, 404, {
                        error: `${method} ${pathname} not found`,
                    })
                    return
                }
                const body =
                    method === 'POST' || method === 'PUT'
                        ? await readBody(req)
                        : {}
                await match.handler(req, res, body, match.params)
            } catch (err) {
                logger.error(err, 'registry request handler error')
                if (!res.headersSent) {
                    respond(res, 500, {
                        error: err instanceof Error ? err.message : String(err),
                    })
                }
            }
        }
    )

    await new Promise<void>((resolve) => server.listen(port, resolve))

    const registryUrl = new URL(`http://localhost:${port}`)
    logger.info(
        { port, admin, ledgerUrl: ledgerUrl.href },
        'TestToken registry server started'
    )

    return {
        registryUrl,
        stop: () =>
            new Promise<void>((resolve, reject) =>
                server.close((err) => (err ? reject(err) : resolve()))
            ),
    }
}
