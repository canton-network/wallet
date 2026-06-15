// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import type { SDKInterface } from '@canton-network/wallet-sdk'
import {
    OTC_TRADE_PROPOSAL_TEMPLATE_ID,
    OTC_TRADE_TEMPLATE_ID,
    buildOtcTradeProposalCommand,
    buildAcceptOtcTradeCommand,
    buildInitiateSettlementCommand,
    type SigningParty,
} from './commands.js'

const MS_30_MIN = 30 * 60 * 1000
const MS_1_HOUR = 60 * 60 * 1000

const PROPOSAL_POLL_TIMEOUT_MS = 30_000
const PROPOSAL_POLL_INTERVAL_MS = 500

export interface CreateAndInitiateOtcTradeParams {
    proposerSdk: SDKInterface<'token'>
    proposer: SigningParty
    acceptorSdk: SDKInterface<'token'>
    acceptor: SigningParty
    venueSdk: SDKInterface<'token'>
    venue: SigningParty
    transferLegs: Record<string, unknown>
    globalSynchronizerId: string
    logger?: Logger
}

/**
 * Runs the full OTC trade initiation flow on the trading-app:
 *   1. The proposer creates an `OTCTradeProposal` (itself as the sole initial approver).
 *   2. The acceptor exercises `OTCTradeProposal_Accept`.
 *   3. The venue exercises `OTCTradeProposal_InitiateSettlement`, producing an `OTCTrade`.
 *
 * @returns The contract id of the created `OTCTrade`.
 */
export async function createAndInitiateOtcTrade(
    params: CreateAndInitiateOtcTradeParams
): Promise<string> {
    const {
        proposerSdk,
        proposer,
        acceptorSdk,
        acceptor,
        venueSdk,
        venue,
        transferLegs,
        globalSynchronizerId,
        logger,
    } = params

    const readProposalCid = async (
        sdk: SDKInterface<'token'>,
        party: string,
        predicate: (approvers: string[]) => boolean = () => true
    ): Promise<string> => {
        const deadline = Date.now() + PROPOSAL_POLL_TIMEOUT_MS
        for (;;) {
            const proposals = await sdk.ledger.acsReader.readJsContracts({
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

    await proposerSdk.ledger
        .prepare({
            partyId: proposer.partyId,
            commands: buildOtcTradeProposalCommand({
                venue: venue.partyId,
                transferLegs,
                approvers: [proposer.partyId],
            }),
            disclosedContracts: [],
            synchronizerId: globalSynchronizerId,
        })
        .sign(proposer.privateKey)
        .execute({ partyId: proposer.partyId })
    logger?.info('Proposer: OTCTradeProposal created')

    await acceptorSdk.ledger
        .prepare({
            partyId: acceptor.partyId,
            commands: [
                buildAcceptOtcTradeCommand({
                    proposalCid: await readProposalCid(
                        acceptorSdk,
                        acceptor.partyId
                    ),
                    approver: acceptor.partyId,
                }),
            ],
            disclosedContracts: [],
            synchronizerId: globalSynchronizerId,
        })
        .sign(acceptor.privateKey)
        .execute({ partyId: acceptor.partyId })
    logger?.info('Acceptor: OTCTradeProposal_Accept executed')

    const prepareUntil = new Date(Date.now() + MS_30_MIN).toISOString()
    const settleBefore = new Date(Date.now() + MS_1_HOUR).toISOString()

    await venueSdk.ledger
        .prepare({
            partyId: venue.partyId,
            commands: [
                buildInitiateSettlementCommand({
                    proposalCid: await readProposalCid(
                        venueSdk,
                        venue.partyId,
                        (approvers) => approvers.includes(acceptor.partyId)
                    ),
                    prepareUntil,
                    settleBefore,
                }),
            ],
            disclosedContracts: [],
            synchronizerId: globalSynchronizerId,
        })
        .sign(venue.privateKey)
        .execute({ partyId: venue.partyId })
    logger?.info(
        'Venue: OTCTradeProposal_InitiateSettlement executed → OTCTrade created'
    )

    const otcTradeContracts = await venueSdk.ledger.acsReader.readJsContracts({
        templateIds: [OTC_TRADE_TEMPLATE_ID],
        parties: [venue.partyId],
        filterByParty: true,
    })
    const otcTradeCid = otcTradeContracts[0]?.contractId
    if (!otcTradeCid)
        throw new Error('OTCTrade contract not found after initiation')
    return otcTradeCid
}
