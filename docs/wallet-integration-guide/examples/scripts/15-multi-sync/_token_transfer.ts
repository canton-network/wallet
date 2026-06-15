// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import {
    selfTransferTestToken,
    selfTransferAllTestTokens,
} from '@canton-network/core-test-token'
import type { MultiSyncSetup } from './_setup.js'
import { TRADE_TOKEN_AMOUNT } from './_constants.js'

export async function aliceSelfTransferToApp(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const { appUserSdk, appProviderSdk, alice, tokenAdmin, appSynchronizerId } =
        setup

    await selfTransferTestToken({
        sdk: appUserSdk,
        owner: {
            partyId: alice.partyId,
            privateKey: alice.keyPair.privateKey,
        },
        adminPartyId: tokenAdmin.partyId,
        adminSdk: appProviderSdk,
        synchronizerId: appSynchronizerId,
        amount: TRADE_TOKEN_AMOUNT,
        logger,
    })
}

export async function bobSelfTransferToApp(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const { appProviderSdk, bob, tokenAdmin, appSynchronizerId } = setup

    await selfTransferAllTestTokens({
        sdk: appProviderSdk,
        owner: { partyId: bob.partyId, privateKey: bob.keyPair.privateKey },
        adminPartyId: tokenAdmin.partyId,
        synchronizerId: appSynchronizerId,
        logger,
    })
}
