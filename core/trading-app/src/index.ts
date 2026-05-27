// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Splice, packageId } from '@daml.js/splice-token-test-trading-app-1.0.2'
export { Splice, packageId }

const App = Splice.Testing.Apps.TradingApp

/** Build a CreateCommand that creates an OTCTradeProposal contract. */
export function buildOtcTradeProposalCommand(params: {
    venue: string
    transferLegs: Record<string, unknown>
    approvers: string[]
    tradeCid?: string | null
}) {
    return {
        CreateCommand: {
            templateId: App.OTCTradeProposal.templateId,
            createArguments: {
                venue: params.venue,
                tradeCid: params.tradeCid ?? null,
                transferLegs: params.transferLegs,
                approvers: params.approvers,
            },
        },
    }
}

/** Build an ExerciseCommand for OTCTradeProposal_Accept. */
export function buildAcceptOtcTradeCommand(params: {
    proposalCid: string
    approver: string
}) {
    return {
        ExerciseCommand: {
            templateId: App.OTCTradeProposal.templateId,
            contractId: params.proposalCid,
            choice: 'OTCTradeProposal_Accept',
            choiceArgument: { approver: params.approver },
        },
    }
}

/** Build an ExerciseCommand for OTCTradeProposal_InitiateSettlement. */
export function buildInitiateSettlementCommand(params: {
    proposalCid: string
    prepareUntil: string
    settleBefore: string
}) {
    return {
        ExerciseCommand: {
            templateId: App.OTCTradeProposal.templateId,
            contractId: params.proposalCid,
            choice: 'OTCTradeProposal_InitiateSettlement',
            choiceArgument: {
                prepareUntil: params.prepareUntil,
                settleBefore: params.settleBefore,
            },
        },
    }
}

/** Build an ExerciseCommand for OTCTrade_Settle. */
export function buildSettleOtcTradeCommand(params: {
    tradeCid: string
    allocationsWithContext: Record<string, unknown>
}) {
    return {
        ExerciseCommand: {
            templateId: App.OTCTrade.templateId,
            contractId: params.tradeCid,
            choice: 'OTCTrade_Settle',
            choiceArgument: {
                allocationsWithContext: params.allocationsWithContext,
            },
        },
    }
}
