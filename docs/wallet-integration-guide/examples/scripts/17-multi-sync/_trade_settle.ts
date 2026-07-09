// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import { localNetStaticConfig } from '@canton-network/wallet-sdk'
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

export interface SettleParams {
    otcTradeCid: string
    legIdAlice: string
    legIdBob: string
    amuletAllocationCid: string
    testTokenAllocationCid: string
}

interface CancelParams {
    otcTradeCid: string
    legIdAlice: string
    legIdBob: string
    amuletAllocationCid: string
    testTokenAllocationCid: string
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
    } = params

    const tokenNamespace = tradingAppSdk.token
    // Fetch each allocation's cancel choice context from its registry's
    // allocation-v1 API (Amulet from the scan-proxy registry, TestToken from the
    // local TestToken registry).
    const [amuletCancelCtx, testTokenCancelCtx] = await Promise.all([
        tokenNamespace.allocation.context.cancel({
            allocationCid: amuletAllocationCid,
            registryUrl: localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
        }),
        tokenNamespace.allocation.context.cancel({
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
    } = params

    const tokenNamespace = tradingAppSdk.token
    const amuletExecCtx = await tokenNamespace.allocation.context.execute({
        allocationCid: amuletAllocationCid,
        registryUrl: localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
    })

    // Fetch Bob's TestToken execute-transfer choice context from the registry's
    // allocation-v1 API (instead of hard-coding an empty context).
    const testTokenExecCtx = await tokenNamespace.allocation.context.execute({
        allocationCid: testTokenAllocationCid,
        registryUrl: testTokenRegistryUrl,
    })

    const allocationsWithContext = {
        [legIdAlice]: {
            _1: amuletAllocationCid,
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
                        amuletAllocationCid,
                        testTokenAllocationCid,
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
