// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import type { SDKInterface } from '@canton-network/wallet-sdk'
import { localNetStaticConfig } from '@canton-network/wallet-sdk'
import {
    buildOtcTradeProposalCommand,
    buildAcceptOtcTradeCommand,
    buildInitiateSettlementCommand,
    buildSettleOtcTradeCommand,
} from '@canton-network/core-trading-app'
import * as SpliceTokenTestTradingApp from '@canton-network/core-trading-app'
import type { MultiSyncSetup } from './_setup.js'
import { TRADE_AMULET_AMOUNT, TRADE_TOKEN_AMOUNT } from './_constants.js'

const TradingApp = SpliceTokenTestTradingApp.Splice.Testing.Apps.TradingApp

const MS_30_MIN = 30 * 60 * 1000
const MS_1_HOUR = 60 * 60 * 1000

export async function createAndInitiateOtcTrade(
    setup: MultiSyncSetup,
    transferLegs: Record<string, unknown>,
    logger: Logger
): Promise<string> {
    const {
        p1Sdk,
        p2Sdk,
        p3Sdk,
        alice,
        bob,
        tradingApp,
        globalSynchronizerId,
    } = setup

    const readProposalCid = async (
        sdk: SDKInterface<'token'>,
        party: string
    ): Promise<string> =>
        (
            await sdk.ledger.acs.requireOne({
                templateIds: [TradingApp.OTCTradeProposal.templateId],
                parties: [party],
                filterByParty: true,
            })
        ).contractId

    await p1Sdk.ledger
        .prepare({
            partyId: alice.partyId,
            commands: buildOtcTradeProposalCommand({
                venue: tradingApp.partyId,
                transferLegs,
                approvers: [alice.partyId],
            }),
            disclosedContracts: [],
            synchronizerId: globalSynchronizerId,
        })
        .sign(alice.keyPair.privateKey)
        .execute({ partyId: alice.partyId })
    logger.info(
        `Alice: OTCTradeProposal created (leg-0: ${TRADE_AMULET_AMOUNT} Amulet → Bob, leg-1: ${TRADE_TOKEN_AMOUNT} TestToken → Alice)`
    )

    await p2Sdk.ledger
        .prepare({
            partyId: bob.partyId,
            commands: [
                buildAcceptOtcTradeCommand({
                    proposalCid: await readProposalCid(p2Sdk, bob.partyId),
                    approver: bob.partyId,
                }),
            ],
            disclosedContracts: [],
            synchronizerId: globalSynchronizerId,
        })
        .sign(bob.keyPair.privateKey)
        .execute({ partyId: bob.partyId })
    logger.info('Bob: OTCTradeProposal_Accept executed')

    const prepareUntil = new Date(Date.now() + MS_30_MIN).toISOString()
    const settleBefore = new Date(Date.now() + MS_1_HOUR).toISOString()

    await p3Sdk.ledger
        .prepare({
            partyId: tradingApp.partyId,
            commands: [
                buildInitiateSettlementCommand({
                    proposalCid: await readProposalCid(
                        p3Sdk,
                        tradingApp.partyId
                    ),
                    prepareUntil,
                    settleBefore,
                }),
            ],
            disclosedContracts: [],
            synchronizerId: globalSynchronizerId,
        })
        .sign(tradingApp.keyPair.privateKey)
        .execute({ partyId: tradingApp.partyId })
    logger.info(
        'TradingApp: OTCTradeProposal_InitiateSettlement executed → OTCTrade created'
    )

    const otcTradeContracts = await p3Sdk.ledger.acs.read({
        templateIds: [TradingApp.OTCTrade.templateId],
        parties: [tradingApp.partyId],
        filterByParty: true,
    })
    const otcTradeCid = otcTradeContracts[0]?.contractId
    if (!otcTradeCid)
        throw new Error('OTCTrade contract not found after initiation')
    return otcTradeCid
}

export interface SettleParams {
    otcTradeCid: string
    legIdAlice: string
    legIdBob: string
    testTokenAllocationCid: string
}

export async function settleOtcTrade(
    setup: MultiSyncSetup,
    params: SettleParams,
    logger: Logger
): Promise<void> {
    const {
        p1Sdk,
        p2Sdk,
        p3Sdk,
        tokenNamespaceP1,
        tokenNamespaceP2,
        alice,
        bob,
        tradingApp,
        tokenAdmin,
        globalSynchronizerId,
        amuletAdmin,
    } = setup
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
            await Promise.all([
                (async () => {
                    const [cmd, disclosed] =
                        await tokenNamespaceP1.allocation.withdraw({
                            allocationCid: amuletAllocation.contractId,
                            asset: {
                                id: 'Amulet',
                                displayName: 'Amulet',
                                symbol: 'CC',
                                registryUrl:
                                    localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
                                admin: amuletAdmin,
                            },
                        })
                    await p1Sdk.ledger
                        .prepare({
                            partyId: alice.partyId,
                            commands: [cmd],
                            disclosedContracts: disclosed,
                            synchronizerId: globalSynchronizerId,
                        })
                        .sign(alice.keyPair.privateKey)
                        .execute({ partyId: alice.partyId })
                    logger.info(
                        'Alice: Amulet allocation withdrawn — funds returned'
                    )
                })(),
                (async () => {
                    const [cmd, disclosed] =
                        await tokenNamespaceP2.allocation.withdraw({
                            allocationCid: testTokenAllocationCid,
                            asset: {
                                id: 'TestToken',
                                displayName: 'TestToken',
                                symbol: 'TT',
                                registryUrl: new URL('http://unused.invalid'),
                                admin: tokenAdmin.partyId,
                            },
                            prefetchedRegistryChoiceContext: {
                                choiceContextData: {},
                                disclosedContracts: [],
                            },
                        })
                    await p2Sdk.ledger
                        .prepare({
                            partyId: bob.partyId,
                            commands: [cmd],
                            disclosedContracts: disclosed,
                            synchronizerId: globalSynchronizerId,
                        })
                        .sign(bob.keyPair.privateKey)
                        .execute({ partyId: bob.partyId })
                    logger.info(
                        'Bob: TestToken allocation withdrawn — funds returned'
                    )
                })(),
            ])
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
