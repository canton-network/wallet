// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PrivateKey } from '@canton-network/core-signing-lib'

export interface SigningParty {
    partyId: string
    privateKey: PrivateKey
}

export const OTC_TRADE_PROPOSAL_TEMPLATE_ID =
    '#splice-token-test-trading-app:Splice.Testing.Apps.TradingApp:OTCTradeProposal'
export const OTC_TRADE_TEMPLATE_ID =
    '#splice-token-test-trading-app:Splice.Testing.Apps.TradingApp:OTCTrade'

export function buildOtcTradeProposalCommand(params: {
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

export function buildAcceptOtcTradeCommand(params: {
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

export function buildInitiateSettlementCommand(params: {
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

export function buildSettleOtcTradeCommand(params: {
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
