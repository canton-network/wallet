// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import { createAndInitiateOtcTrade as createAndInitiateOtcTradeCore } from '@canton-network/core-trading-app'
import type { MultiSyncSetup } from './_setup.js'

/** Adapts the example's {@link MultiSyncSetup} to the trading-app OTC trade flow. */
export async function createAndInitiateOtcTrade(
    setup: MultiSyncSetup,
    transferLegs: Record<string, unknown>,
    logger: Logger
): Promise<string> {
    const {
        appUserSdk,
        appProviderSdk,
        svSdk,
        alice,
        bob,
        tradingApp,
        globalSynchronizerId,
    } = setup

    return createAndInitiateOtcTradeCore({
        proposerSdk: appUserSdk,
        proposer: {
            partyId: alice.partyId,
            privateKey: alice.keyPair.privateKey,
        },
        acceptorSdk: appProviderSdk,
        acceptor: { partyId: bob.partyId, privateKey: bob.keyPair.privateKey },
        venueSdk: svSdk,
        venue: {
            partyId: tradingApp.partyId,
            privateKey: tradingApp.keyPair.privateKey,
        },
        transferLegs,
        globalSynchronizerId,
        logger,
    })
}
