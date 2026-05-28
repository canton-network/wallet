// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import type { SDKInterface } from '@canton-network/wallet-sdk'
import {
    buildOtcTradeProposalCommand,
    buildAcceptOtcTradeCommand,
    buildInitiateSettlementCommand,
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
