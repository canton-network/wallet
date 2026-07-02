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

import express, { type ErrorRequestHandler } from 'express'
import type { Server } from 'node:http'
import type { Logger } from 'pino'
import type { LedgerClient } from '@canton-network/core-ledger-client'
import { buildLedgerClient, invalidateCache, readTokenRules } from './ledger.js'
import type { TokenRulesContract } from './ledger.js'
import { createOpenApiRouter } from './http/openapi-router.js'
import {
    REGISTRY_ROUTES,
    type RegistryHandlers,
} from './generated-server/registry-server.js'
import { createMetadataHandlers } from './features/metadata/handlers.js'
import { createTransferHandlers } from './features/transfer/handlers.js'
import { createAllocationInstructionHandlers } from './features/allocation-instruction/handlers.js'
import { createAllocationHandlers } from './features/allocation/handlers.js'

// ── static instrument metadata ─────────────────────────────────────────────
const TEST_TOKEN_INSTRUMENT_ID = 'TestToken'

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

    // Every OpenAPI operationId maps to its feature handler. TypeScript checks —
    // via the generated `RegistryHandlers` type — that every operation is
    // implemented and that params/body/response types match the spec.
    const handlers: RegistryHandlers = {
        ...metadata,
        ...transfer,
        ...allocInstr,
        ...alloc,
    }

    // Routing (method + path per operationId) is generated from the OpenAPI
    // specs; here we only mount the router and cross-cutting middleware.
    const app = express()
    app.use(express.json())
    app.use((req, _res, next) => {
        logger.debug(
            { method: req.method, path: req.path },
            'incoming registry request'
        )
        next()
    })
    app.use(createOpenApiRouter(REGISTRY_ROUTES, handlers))

    // Unmatched routes → 404
    app.use((req, res) => {
        res.status(404).json({ error: `${req.method} ${req.path} not found` })
    })

    // Uncaught handler errors → 500
    const onError: ErrorRequestHandler = (err, _req, res, next) => {
        logger.error(err, 'registry request handler error')
        if (res.headersSent) {
            next(err)
            return
        }
        res.status(500).json({
            error: err instanceof Error ? err.message : String(err),
        })
    }
    app.use(onError)

    const server = await new Promise<Server>((resolve) => {
        const httpServer = app.listen(port, () => resolve(httpServer))
    })

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
