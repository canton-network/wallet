// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import { localNetStaticConfig } from '@canton-network/wallet-sdk'
import type { LedgerCommonSchemas } from '@canton-network/core-ledger-client-types'
import type { MultiSyncSetup } from './_setup.js'
import { TRADE_AMULET_AMOUNT, TRADE_TOKEN_AMOUNT } from './_constants.js'

const OTC_TRADE_TEMPLATE_ID =
    '#splice-token-test-trading-app:Splice.Testing.Apps.TradingApp:OTCTrade'

function buildSettleOtcTradeCommand(params: {
    tradeCid: string
    allocationsWithContext: Record<string, unknown>
}) {
    return {
        ExerciseCommand: {
            templateId: OTC_TRADE_TEMPLATE_ID,
            contractId: params.tradeCid,
            choice: 'OTCTrade_Settle',
            choiceArgument: {
                allocationsWithContext: params.allocationsWithContext,
            },
        },
    }
}

type DisclosedContract = LedgerCommonSchemas['DisclosedContract']

export interface SettleParams {
    otcTradeCid: string
    legIdAlice: string
    legIdBob: string
    testTokenAllocationCid: string
    testTokenAllocationDisclosed: DisclosedContract
}

/** Withdraws both allocations in parallel after a settlement failure, returning funds to each party. */
async function withdrawAllocationsOnFailure(
    setup: MultiSyncSetup,
    amuletAllocationCid: string,
    testTokenAllocationCid: string,
    logger: Logger
): Promise<void> {
    const {
        appUserSdk,
        appProviderSdk,
        appUserTokenNamespace,
        appProviderTokenNamespace,
        alice,
        bob,
        tokenAdmin,
        globalSynchronizerId,
        amuletAdmin,
        testTokenRegistryUrl,
    } = setup

    await Promise.all([
        (async () => {
            const [cmd, disclosed] =
                await appUserTokenNamespace.allocation.withdraw({
                    allocationCid: amuletAllocationCid,
                    asset: {
                        id: 'Amulet',
                        displayName: 'Amulet',
                        symbol: 'CC',
                        registryUrl:
                            localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
                        admin: amuletAdmin,
                    },
                })
            await appUserSdk.ledger
                .prepare({
                    partyId: alice.partyId,
                    commands: [cmd],
                    disclosedContracts: disclosed,
                    synchronizerId: globalSynchronizerId,
                })
                .sign(alice.keyPair.privateKey)
                .execute({ partyId: alice.partyId })
            logger.info('Alice: Amulet allocation withdrawn — funds returned')
        })(),
        (async () => {
            const [cmd, disclosed] =
                await appProviderTokenNamespace.allocation.withdraw({
                    allocationCid: testTokenAllocationCid,
                    asset: {
                        id: 'TestToken',
                        displayName: 'TestToken',
                        symbol: 'TT',
                        registryUrl: testTokenRegistryUrl,
                        admin: tokenAdmin.partyId,
                    },
                })
            await appProviderSdk.ledger
                .prepare({
                    partyId: bob.partyId,
                    commands: [cmd],
                    disclosedContracts: disclosed,
                    synchronizerId: globalSynchronizerId,
                })
                .sign(bob.keyPair.privateKey)
                .execute({ partyId: bob.partyId })
            logger.info('Bob: TestToken allocation withdrawn — funds returned')
        })(),
    ])
}

export async function settleOtcTrade(
    setup: MultiSyncSetup,
    params: SettleParams,
    logger: Logger
): Promise<void> {
    const {
        appUserSdk,
        appUserTokenNamespace,
        appProviderTokenNamespace,
        alice,
        tradingApp,
        globalSynchronizerId,
        testTokenRegistryUrl,
    } = setup
    const {
        otcTradeCid,
        legIdAlice,
        legIdBob,
        testTokenAllocationCid,
        testTokenAllocationDisclosed,
    } = params

    const allocationsAlice = await appUserTokenNamespace.allocation.pending(
        alice.partyId
    )
    const amuletAllocation = allocationsAlice.find(
        (a) => a.interfaceViewValue.allocation.transferLegId === legIdAlice
    )
    if (!amuletAllocation) throw new Error('Amulet allocation not found')

    const amuletExecCtx =
        await appUserTokenNamespace.allocation.context.execute({
            allocationCid: amuletAllocation.contractId,
            registryUrl: localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
        })

    // Fetch Bob's TestToken execute-transfer choice context from the registry's
    // allocation-v1 API (instead of hard-coding an empty context).
    const testTokenExecCtx =
        await appProviderTokenNamespace.allocation.context.execute({
            allocationCid: testTokenAllocationCid,
            registryUrl: testTokenRegistryUrl,
        })

    const allocationsWithContext = {
        [legIdAlice]: {
            _1: amuletAllocation.contractId,
            _2: {
                context: {
                    ...(amuletExecCtx.choiceContextData ?? {}),
                    values:
                        (amuletExecCtx.choiceContextData?.values as Record<
                            string,
                            unknown
                        >) ?? {},
                },
                meta: { values: {} },
            },
        },
        [legIdBob]: {
            _1: testTokenAllocationCid,
            _2: {
                context: {
                    ...(testTokenExecCtx.choiceContextData ?? {}),
                    values:
                        (testTokenExecCtx.choiceContextData?.values as Record<
                            string,
                            unknown
                        >) ?? {},
                },
                meta: { values: {} },
            },
        },
    }

    const disclosedContracts = [
        ...(amuletExecCtx.disclosedContracts ?? []).map((c) => ({
            ...c,
            synchronizerId: '',
        })),
        ...(testTokenExecCtx.disclosedContracts ?? []).map((c) => ({
            ...c,
            synchronizerId: '',
        })),
        // Disclose Bob's TestToken allocation so the TradingApp's participant can
        // resolve it without waiting for cross-participant ACS propagation.
        testTokenAllocationDisclosed,
    ]

    try {
        await appUserSdk.ledger
            .prepare({
                partyId: tradingApp.partyId,
                commands: [
                    buildSettleOtcTradeCommand({
                        tradeCid: otcTradeCid,
                        allocationsWithContext,
                    }),
                ],
                disclosedContracts,
                synchronizerId: globalSynchronizerId,
            })
            .sign(tradingApp.keyPair.privateKey)
            .execute({ partyId: tradingApp.partyId })
    } catch (settleError) {
        logger.error(
            { err: settleError },
            'Settlement failed — withdrawing allocations to return funds'
        )
        try {
            await withdrawAllocationsOnFailure(
                setup,
                amuletAllocation.contractId,
                testTokenAllocationCid,
                logger
            )
        } catch (compensationError) {
            logger.error(
                { err: compensationError },
                'Compensation failed — manual intervention required to withdraw allocations'
            )
        }
        throw settleError
    }

    logger.info(
        `TradingApp: OTCTrade settled — ${TRADE_AMULET_AMOUNT} Amulet transferred to Bob, ${TRADE_TOKEN_AMOUNT} TestToken transferred to Alice`
    )
}
