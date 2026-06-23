// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import type { SDKInterface } from '@canton-network/wallet-sdk'
import type { MultiSyncSetup } from './_setup.js'
import { TRADE_AMULET_AMOUNT, TRADE_TOKEN_AMOUNT } from './_constants.js'

const OTC_TRADE_PROPOSAL_TEMPLATE_ID =
    '#splice-token-test-trading-app:Splice.Testing.Apps.TradingApp:OTCTradeProposal'
const OTC_TRADE_TEMPLATE_ID =
    '#splice-token-test-trading-app:Splice.Testing.Apps.TradingApp:OTCTrade'

function buildOtcTradeProposalCommand(params: {
    venue: string
    transferLegs: Record<string, unknown>
    approvers: string[]
    tradeCid?: string | null
}) {
    return {
        CreateCommand: {
            templateId: OTC_TRADE_PROPOSAL_TEMPLATE_ID,
            createArguments: {
                venue: params.venue,
                tradeCid: params.tradeCid ?? null,
                transferLegs: params.transferLegs,
                approvers: params.approvers,
            },
        },
    }
}

function buildAcceptOtcTradeCommand(params: {
    proposalCid: string
    approver: string
}) {
    return {
        ExerciseCommand: {
            templateId: OTC_TRADE_PROPOSAL_TEMPLATE_ID,
            contractId: params.proposalCid,
            choice: 'OTCTradeProposal_Accept',
            choiceArgument: { approver: params.approver },
        },
    }
}

function buildInitiateSettlementCommand(params: {
    proposalCid: string
    prepareUntil: string
    settleBefore: string
}) {
    return {
        ExerciseCommand: {
            templateId: OTC_TRADE_PROPOSAL_TEMPLATE_ID,
            contractId: params.proposalCid,
            choice: 'OTCTradeProposal_InitiateSettlement',
            choiceArgument: {
                prepareUntil: params.prepareUntil,
                settleBefore: params.settleBefore,
            },
        },
    }
}

const MS_30_MIN = 30 * 60 * 1000
const MS_1_HOUR = 60 * 60 * 1000

const PROPOSAL_POLL_TIMEOUT_MS = 30_000
const PROPOSAL_POLL_INTERVAL_MS = 500

export async function createAndInitiateOtcTrade(
    setup: MultiSyncSetup,
    transferLegs: Record<string, unknown>,
    logger: Logger
): Promise<string> {
    const {
        appUserSdk,
        appProviderSdk,
        alice,
        bob,
        tradingApp,
        globalSynchronizerId,
    } = setup

    // The proposal is created on Alice's participant but read from other
    // participants (Bob, TradingApp)
    const readProposalCid = async (
        sdk: SDKInterface<'token'>,
        party: string,
        predicate: (approvers: string[]) => boolean = () => true
    ): Promise<string> => {
        const deadline = Date.now() + PROPOSAL_POLL_TIMEOUT_MS
        for (;;) {
            const proposals = await sdk.ledger.acs.read({
                templateIds: [OTC_TRADE_PROPOSAL_TEMPLATE_ID],
                parties: [party],
                filterByParty: true,
            })
            const match = proposals.find((proposal) =>
                predicate(
                    ((
                        proposal as unknown as {
                            createArgument?: { approvers?: string[] }
                        }
                    ).createArgument?.approvers ?? []) as string[]
                )
            )
            if (match) return match.contractId
            if (Date.now() >= deadline) {
                throw new Error(
                    `OTCTradeProposal not visible to ${party} within ${PROPOSAL_POLL_TIMEOUT_MS}ms`
                )
            }
            await new Promise((resolve) =>
                setTimeout(resolve, PROPOSAL_POLL_INTERVAL_MS)
            )
        }
    }

    await appUserSdk.ledger
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

    await appProviderSdk.ledger
        .prepare({
            partyId: bob.partyId,
            commands: [
                buildAcceptOtcTradeCommand({
                    proposalCid: await readProposalCid(
                        appProviderSdk,
                        bob.partyId
                    ),
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

    await appUserSdk.ledger
        .prepare({
            partyId: tradingApp.partyId,
            commands: [
                buildInitiateSettlementCommand({
                    proposalCid: await readProposalCid(
                        appUserSdk,
                        tradingApp.partyId,
                        (approvers) => approvers.includes(bob.partyId)
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

    const otcTradeContracts = await appUserSdk.ledger.acs.read({
        templateIds: [OTC_TRADE_TEMPLATE_ID],
        parties: [tradingApp.partyId],
        filterByParty: true,
    })
    const otcTradeCid = otcTradeContracts[0]?.contractId
    if (!otcTradeCid)
        throw new Error('OTCTrade contract not found after initiation')
    return otcTradeCid
}
