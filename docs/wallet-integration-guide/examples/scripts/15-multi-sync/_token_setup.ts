// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import {
    createTokenRules,
    mintTestToken,
} from '@canton-network/core-test-token'
import type { MultiSyncSetup } from './_setup.js'
import { BOB_TOKEN_MINT_AMOUNT } from './_constants.js'

export async function createTokenRulesAndMintForBob(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const {
        appProviderSdk,
        tokenNamespaceAppProvider,
        bob,
        tokenAdmin,
        globalSynchronizerId,
        appSynchronizerId,
        testTokenRegistryUrl,
    } = setup

    const admin = {
        partyId: tokenAdmin.partyId,
        privateKey: tokenAdmin.keyPair.privateKey,
    }

    await createTokenRules({
        sdk: appProviderSdk,
        admin,
        synchronizerIds: [globalSynchronizerId, appSynchronizerId],
    })

    await mintTestToken({
        sdk: appProviderSdk,
        admin,
        receiver: {
            partyId: bob.partyId,
            privateKey: bob.keyPair.privateKey,
        },
        amount: BOB_TOKEN_MINT_AMOUNT,
        synchronizerId: appSynchronizerId,
    })

    logger.info(
        `TokenAdmin: TokenRules created on global + app synchronizers; Bob: ${BOB_TOKEN_MINT_AMOUNT} TestToken minted on app-synchronizer via registry transfer-factory`
    )
}
