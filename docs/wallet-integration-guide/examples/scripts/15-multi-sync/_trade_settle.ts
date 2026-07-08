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

function buildCancelOtcTradeCommand(params: {
    tradeCid: string
    allocationsWithContext: Record<string, unknown>
}) {
    return {
        ExerciseCommand: {
            templateId: OTC_TRADE_TEMPLATE_ID,
            contractId: params.tradeCid,
            choice: 'OTCTrade_Cancel',
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

interface CancelParams {
    otcTradeCid: string
    legIdAlice: string
    legIdBob: string
    amuletAllocationCid: string
    testTokenAllocationCid: string
    testTokenAllocationDisclosed: DisclosedContract
}

/**
 * Cancels both allocations in a single venue-authorized `OTCTrade_Cancel` after
 * settlement has definitively failed, releasing the locked holdings back to each
 * party. Unlike a per-party withdraw, cancellation requires sender, receiver, and
 * executor authorization, which the OTCTrade contract delegates to the venue.
 */
async function cancelAllocationsOnFailure(
    setup: MultiSyncSetup,
    params: CancelParams,
    logger: Logger
): Promise<void> {
    const {
        tradingAppSdk,
        aliceTokenNamespace,
        bobTokenNamespace,
        tradingApp,
        globalSynchronizerId,
        testTokenRegistryUrl,
    } = setup
    const {
        otcTradeCid,
        legIdAlice,
        legIdBob,
        amuletAllocationCid,
        testTokenAllocationCid,
        testTokenAllocationDisclosed,
    } = params

    // Fetch each allocation's cancel choice context from its registry's
    // allocation-v1 API (Amulet from the scan-proxy registry, TestToken from the
    // local TestToken registry).
    const [amuletCancelCtx, testTokenCancelCtx] = await Promise.all([
        aliceTokenNamespace.allocation.context.cancel({
            allocationCid: amuletAllocationCid,
            registryUrl: localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
        }),
        bobTokenNamespace.allocation.context.cancel({
            allocationCid: testTokenAllocationCid,
            registryUrl: testTokenRegistryUrl,
        }),
    ])

    const allocationsWithContext = {
        [legIdAlice]: {
            _1: amuletAllocationCid,
            _2: {
                context: {
                    ...(amuletCancelCtx.choiceContextData ?? {}),
                    values:
                        (amuletCancelCtx.choiceContextData?.values as Record<
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
                    ...(testTokenCancelCtx.choiceContextData ?? {}),
                    values:
                        (testTokenCancelCtx.choiceContextData?.values as Record<
                            string,
                            unknown
                        >) ?? {},
                },
                meta: { values: {} },
            },
        },
    }

    const disclosedContracts = [
        ...(amuletCancelCtx.disclosedContracts ?? []).map((c) => ({
            ...c,
            synchronizerId: '',
        })),
        ...(testTokenCancelCtx.disclosedContracts ?? []).map((c) => ({
            ...c,
            synchronizerId: '',
        })),
        // Disclose Bob's TestToken allocation so the TradingApp's participant can
        // fetch it when validating the cancel, mirroring the settle path.
        testTokenAllocationDisclosed,
    ]

    await tradingAppSdk.ledger
        .prepare({
            partyId: tradingApp.partyId,
            commands: [
                buildCancelOtcTradeCommand({
                    tradeCid: otcTradeCid,
                    allocationsWithContext,
                }),
            ],
            disclosedContracts,
            synchronizerId: globalSynchronizerId,
        })
        .sign(tradingApp.keyPair.privateKey)
        .execute({ partyId: tradingApp.partyId })

    logger.info(
        'TradingApp: OTCTrade cancelled — allocations released, funds returned to Alice and Bob'
    )
}

export async function settleOtcTrade(
    setup: MultiSyncSetup,
    params: SettleParams,
    logger: Logger
): Promise<void> {
    const {
        tradingAppSdk,
        aliceTokenNamespace,
        bobTokenNamespace,
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

    const allocationsAlice = await aliceTokenNamespace.allocation.pending(
        alice.partyId
    )
    const amuletAllocation = allocationsAlice.find(
        (a) => a.interfaceViewValue.allocation.transferLegId === legIdAlice
    )
    if (!amuletAllocation) throw new Error('Amulet allocation not found')

    const amuletExecCtx = await aliceTokenNamespace.allocation.context.execute({
        allocationCid: amuletAllocation.contractId,
        registryUrl: localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
    })

    // Fetch Bob's TestToken execute-transfer choice context from the registry's
    // allocation-v1 API (instead of hard-coding an empty context).
    const testTokenExecCtx = await bobTokenNamespace.allocation.context.execute(
        {
            allocationCid: testTokenAllocationCid,
            registryUrl: testTokenRegistryUrl,
        }
    )

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

    const submitSettlement = () =>
        tradingAppSdk.ledger
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

    try {
        await submitSettlement()
    } catch (firstError) {
        logger.warn(
            { err: firstError },
            'Settlement failed — retrying once before cancelling allocations'
        )
        try {
            await submitSettlement()
        } catch (retryError) {
            logger.error(
                { err: retryError },
                'Settlement retry failed — cancelling allocations to return funds'
            )
            try {
                await cancelAllocationsOnFailure(
                    setup,
                    {
                        otcTradeCid,
                        legIdAlice,
                        legIdBob,
                        amuletAllocationCid: amuletAllocation.contractId,
                        testTokenAllocationCid,
                        testTokenAllocationDisclosed,
                    },
                    logger
                )
            } catch (compensationError) {
                logger.error(
                    { err: compensationError },
                    'Compensation failed — manual intervention required to cancel allocations'
                )
            }
            throw retryError
        }
    }

    logger.info(
        `TradingApp: OTCTrade settled — ${TRADE_AMULET_AMOUNT} Amulet transferred to Bob, ${TRADE_TOKEN_AMOUNT} TestToken transferred to Alice`
    )
}
