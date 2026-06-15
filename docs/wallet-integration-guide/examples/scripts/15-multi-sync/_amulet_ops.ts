// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import { mintAmulet, allocateAmulet } from '@canton-network/core-amulet-ops'
import { localNetStaticConfig } from '@canton-network/wallet-sdk'
import type { MultiSyncSetup } from './_setup.js'
import { ALICE_AMULET_TAP_AMOUNT } from './_constants.js'

export async function mintAmuletForAlice(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const { appUserSdk, alice, globalSynchronizerId } = setup

    await mintAmulet({
        sdk: appUserSdk,
        receiver: {
            partyId: alice.partyId,
            privateKey: alice.keyPair.privateKey,
        },
        amount: ALICE_AMULET_TAP_AMOUNT,
        synchronizerId: globalSynchronizerId,
        logger,
    })
}

export async function allocateAmuletForAlice(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<string> {
    const { appUserSdk, alice, globalSynchronizerId, amuletAdmin } = setup

    return allocateAmulet({
        sdk: appUserSdk,
        sender: {
            partyId: alice.partyId,
            privateKey: alice.keyPair.privateKey,
        },
        adminPartyId: amuletAdmin,
        registryUrl: localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
        globalSynchronizerId,
        logger,
    })
}
