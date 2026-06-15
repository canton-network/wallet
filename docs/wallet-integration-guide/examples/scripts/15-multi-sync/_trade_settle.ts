// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import { localNetStaticConfig } from '@canton-network/wallet-sdk'
import {
    settleOtcTrade as settleOtcTradeCore,
    withdrawAllocations,
} from '@canton-network/core-trading-app'
import type { LedgerCommonSchemas } from '@canton-network/core-ledger-client-types'
import type { MultiSyncSetup } from './_setup.js'

type DisclosedContract = LedgerCommonSchemas['DisclosedContract']

export interface SettleParams {
    otcTradeCid: string
    legIdAlice: string
    legIdBob: string
    testTokenAllocationCid: string
    testTokenAllocationDisclosed: DisclosedContract
}

/** Adapts the example's {@link MultiSyncSetup} to the trading-app OTC settlement flow. */
export async function settleOtcTrade(
    setup: MultiSyncSetup,
    params: SettleParams,
    logger: Logger
): Promise<void> {
    const {
        appUserSdk,
        appProviderSdk,
        svSdk,
        tokenNamespaceAppUser,
        alice,
        bob,
        tradingApp,
        tokenAdmin,
        globalSynchronizerId,
        amuletAdmin,
        testTokenRegistryUrl,
    } = setup
    const {
        otcTradeCid,
        legIdAlice,
        legIdBob,
        testTokenAllocationCid,
        testTokenAllocationDisclosed,
    } = params

    await settleOtcTradeCore({
        venueSdk: svSdk,
        venue: {
            partyId: tradingApp.partyId,
            privateKey: tradingApp.keyPair.privateKey,
        },
        otcTradeCid,
        contextLeg: {
            tokenNamespace: tokenNamespaceAppUser,
            ownerPartyId: alice.partyId,
            legId: legIdAlice,
            registryUrl: localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
        },
        disclosedLeg: {
            legId: legIdBob,
            allocationCid: testTokenAllocationCid,
            disclosedContract: testTokenAllocationDisclosed,
        },
        globalSynchronizerId,
        onSettlementFailure: (amuletAllocationCid) =>
            withdrawAllocations({
                globalSynchronizerId,
                logger,
                withdrawals: [
                    {
                        sdk: appUserSdk,
                        owner: {
                            partyId: alice.partyId,
                            privateKey: alice.keyPair.privateKey,
                        },
                        withdrawParams: {
                            allocationCid: amuletAllocationCid,
                            asset: {
                                id: 'Amulet',
                                displayName: 'Amulet',
                                symbol: 'CC',
                                registryUrl:
                                    localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
                                admin: amuletAdmin,
                            },
                        },
                        logMessage:
                            'Alice: Amulet allocation withdrawn — funds returned',
                    },
                    {
                        sdk: appProviderSdk,
                        owner: {
                            partyId: bob.partyId,
                            privateKey: bob.keyPair.privateKey,
                        },
                        withdrawParams: {
                            allocationCid: testTokenAllocationCid,
                            asset: {
                                id: 'TestToken',
                                displayName: 'TestToken',
                                symbol: 'TT',
                                registryUrl: new URL('http://unused.invalid'),
                                admin: tokenAdmin.partyId,
                            },
                            prefetchedRegistryChoiceContext: {
                                choiceContextData: { values: {} as never },
                                disclosedContracts: [],
                            },
                        },
                        logMessage:
                            'Bob: TestToken allocation withdrawn — funds returned',
                    },
                ],
            }),
        logger,
    })
}
