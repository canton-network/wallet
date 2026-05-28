// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import { localNetStaticConfig } from '@canton-network/wallet-sdk'
import { buildSettleOtcTradeCommand } from '@canton-network/core-trading-app'
import type { MultiSyncSetup } from './_setup.js'
import { TRADE_AMULET_AMOUNT, TRADE_TOKEN_AMOUNT } from './_constants.js'

export interface SettleParams {
    otcTradeCid: string
    legIdAlice: string
    legIdBob: string
    testTokenAllocationCid: string
}

/** Withdraws both allocations in parallel after a settlement failure, returning funds to each party. */
async function withdrawAllocationsOnFailure(
    setup: MultiSyncSetup,
    amuletAllocationCid: string,
    testTokenAllocationCid: string,
    logger: Logger
): Promise<void> {
    const {
        p1Sdk,
        p2Sdk,
        tokenNamespaceP1,
        tokenNamespaceP2,
        alice,
        bob,
        tokenAdmin,
        globalSynchronizerId,
        amuletAdmin,
    } = setup

    await Promise.all([
        (async () => {
            const [cmd, disclosed] = await tokenNamespaceP1.allocation.withdraw(
                {
                    allocationCid: amuletAllocationCid,
                    asset: {
                        id: 'Amulet',
                        displayName: 'Amulet',
                        symbol: 'CC',
                        registryUrl:
                            localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
                        admin: amuletAdmin,
                    },
                }
            )
            await p1Sdk.ledger
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
            const [cmd, disclosed] = await tokenNamespaceP2.allocation.withdraw(
                {
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
                }
            )
            await p2Sdk.ledger
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
    const { p3Sdk, tokenNamespaceP1, alice, tradingApp, globalSynchronizerId } =
        setup
    const { otcTradeCid, legIdAlice, legIdBob, testTokenAllocationCid } = params

    const allocationsAlice = await tokenNamespaceP1.allocation.pending(
        alice.partyId
    )
    const amuletAllocation = allocationsAlice.find(
        (a) => a.interfaceViewValue.allocation.transferLegId === legIdAlice
    )
    if (!amuletAllocation) throw new Error('Amulet allocation not found')

    const amuletExecCtx = await tokenNamespaceP1.allocation.context.execute({
        allocationCid: amuletAllocation.contractId,
        registryUrl: localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
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
            _2: { context: { values: {} }, meta: { values: {} } },
        },
    }

    const disclosedContracts = (amuletExecCtx.disclosedContracts ?? []).map(
        (c) => ({ ...c, synchronizerId: '' })
    )

    try {
        await p3Sdk.ledger
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
