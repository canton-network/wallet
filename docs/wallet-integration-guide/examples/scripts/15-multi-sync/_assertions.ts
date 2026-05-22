// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Step-by-step assertions for the multi-synchronizer DvP example.
//
// These turn the example's expected topology into hard checks: a DAR-vetting
// assertion for the initial state, and per-step contract-location assertions
// that fail fast if any contract lands on the wrong synchronizer.

import type { Logger } from 'pino'
import type { MultiSyncSetup } from './_setup.js'
import type { SynchronizerMap } from '../utils/index.js'
import { listVettedPackages } from '../utils/index.js'
import {
    AMULET_TEMPLATE_ID,
    TEST_TOKEN_PREFIX,
    TRADING_APP_PREFIX,
} from './_trade_ops.js'

// Package names (not template ids) — used for the vetting query.
const TEST_TOKEN_PACKAGE = 'splice-test-token-v1'
const TRADING_APP_PACKAGE = 'splice-token-test-trading-app-v2'

/** Resolve a synchronizer id to its role alias, falling back to a short id. */
function safeAlias(syncId: string, s: SynchronizerMap): string {
    if (syncId === s.globalSynchronizerId) return 'global'
    if (syncId === s.appSynchronizerId) return 'app-synchronizer'
    return `${syncId.substring(0, 16)}…`
}

/**
 * Step 1 — vetting placement.
 *
 * Asserts that, before the trade runs:
 *   - the TestToken DAR (`splice-test-token-v1`) is vetted on BOTH the
 *     app-synchronizer (its home for Token holdings) and the global synchronizer
 *     (required so that `TokenAllocation` can be reassigned onto global for
 *     settlement), and
 *   - the trading-app DAR (`splice-token-test-trading-app-v2`) is vetted on the
 *     global synchronizer ONLY — vetted there and NOT on the app-synchronizer.
 *
 * Uses `POST /v2/package-vetting/list`, which reports the synchronizer-wide
 * vetting topology, queried here via P3 (connected to both synchronizers).
 */
export async function assertDarVetting(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const { p3SdkCtx, globalSynchronizerId, appSynchronizerId } = setup

    /** Participants that have vetted `packageName` on `synchronizerId`. */
    const vettingParticipants = async (
        packageName: string,
        synchronizerId: string
    ): Promise<string[]> => {
        const vetted = await listVettedPackages(
            p3SdkCtx.ledgerProvider,
            packageName,
            synchronizerId
        )
        return vetted.map((v) => v.participantId)
    }

    const tokenOnApp = await vettingParticipants(
        TEST_TOKEN_PACKAGE,
        appSynchronizerId
    )
    if (tokenOnApp.length === 0)
        throw new Error(
            `Vetting assertion failed: ${TEST_TOKEN_PACKAGE} is not vetted on the app-synchronizer`
        )

    // … and must ALSO be vetted on the global synchronizer (TokenAllocation reassignment).
    const tokenOnGlobal = await vettingParticipants(
        TEST_TOKEN_PACKAGE,
        globalSynchronizerId
    )
    if (tokenOnGlobal.length === 0)
        throw new Error(
            `Vetting assertion failed: ${TEST_TOKEN_PACKAGE} must be vetted on the ` +
                `global synchronizer (for TokenAllocation reassignment) but no participant has it vetted there`
        )

    const tradingOnGlobal = await vettingParticipants(
        TRADING_APP_PACKAGE,
        globalSynchronizerId
    )
    if (tradingOnGlobal.length === 0)
        throw new Error(
            `Vetting assertion failed: ${TRADING_APP_PACKAGE} is not vetted on the global synchronizer`
        )

    const tradingOnApp = await vettingParticipants(
        TRADING_APP_PACKAGE,
        appSynchronizerId
    )
    if (tradingOnApp.length > 0)
        throw new Error(
            `Vetting assertion failed: ${TRADING_APP_PACKAGE} must NOT be vetted on the ` +
                `app-synchronizer, but ${tradingOnApp.length} participant(s) have it vetted there`
        )

    logger.info(
        `Step 1 vetting OK — ${TEST_TOKEN_PACKAGE}: app-synchronizer (${tokenOnApp.length}) + global (${tokenOnGlobal.length}) participant(s); ` +
            `${TRADING_APP_PACKAGE}: global only (${tradingOnGlobal.length} participant(s))`
    )
}

/**
 * Asserts every contract of `templateIds` visible to `parties` (via `sdk`) is
 * hosted on `expectedSynchronizerId`. Throws — listing the offenders — if not.
 */
export async function assertContractsOnSynchronizer(
    sdk: MultiSyncSetup['p1Sdk'],
    templateIds: string[],
    parties: string[],
    expectedSynchronizerId: string,
    label: string,
    synchronizers: SynchronizerMap,
    options?: { requireNonEmpty?: boolean }
): Promise<void> {
    const contracts = await sdk.ledger.acs.read({
        templateIds,
        parties,
        filterByParty: true,
    })

    if (contracts.length === 0) {
        if (options?.requireNonEmpty)
            throw new Error(
                `${label}: expected at least one contract of [${templateIds
                    .map((t) => t.split(':').pop())
                    .join(', ')}], found none`
            )
        return
    }

    const offenders = contracts.filter(
        (c) => c.synchronizerId !== expectedSynchronizerId
    )
    if (offenders.length > 0)
        throw new Error(
            `${label}: ${offenders.length} contract(s) not on ` +
                `${safeAlias(expectedSynchronizerId, synchronizers)} — ` +
                offenders
                    .map(
                        (c) =>
                            `${(c.templateId ?? '').split(':').pop()}` +
                            `@${safeAlias(c.synchronizerId, synchronizers)}`
                    )
                    .join(', ')
        )
}

/**
 * Convenience wrapper: runs {@link assertContractsOnSynchronizer} and logs a
 * one-line confirmation on success.
 */
export async function assertStepContracts(
    sdk: MultiSyncSetup['p1Sdk'],
    templateIds: string[],
    parties: string[],
    expectedSynchronizerId: string,
    label: string,
    synchronizers: SynchronizerMap,
    logger: Logger,
    options?: { requireNonEmpty?: boolean }
): Promise<void> {
    await assertContractsOnSynchronizer(
        sdk,
        templateIds,
        parties,
        expectedSynchronizerId,
        label,
        synchronizers,
        options
    )
    logger.info(
        `${label}: contract(s) on ${safeAlias(expectedSynchronizerId, synchronizers)} ✓`
    )
}

export const TEMPLATES = {
    amulet: AMULET_TEMPLATE_ID,
    token: `${TEST_TOKEN_PREFIX}:Token`,
    tokenRules: `${TEST_TOKEN_PREFIX}:TokenRules`,
    tokenAllocation: `${TEST_TOKEN_PREFIX}:TokenAllocation`,
    otcTrade: `${TRADING_APP_PREFIX}:OTCTrade`,
    otcTradeAllocationRequest: `${TRADING_APP_PREFIX}:OTCTradeAllocationRequest`,
    tradeSettlementAgreement: `${TRADING_APP_PREFIX}:TradeSettlementAgreement`,
} as const
