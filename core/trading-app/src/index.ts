// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export {
    OTC_TRADE_PROPOSAL_TEMPLATE_ID,
    OTC_TRADE_TEMPLATE_ID,
    buildOtcTradeProposalCommand,
    buildAcceptOtcTradeCommand,
    buildInitiateSettlementCommand,
    buildSettleOtcTradeCommand,
} from './commands.js'
export type { SigningParty } from './commands.js'

export { createAndInitiateOtcTrade } from './propose.js'
export type { CreateAndInitiateOtcTradeParams } from './propose.js'

export { settleOtcTrade } from './settle.js'
export type {
    SettleOtcTradeParams,
    ContextLeg,
    DisclosedLeg,
} from './settle.js'

export { withdrawAllocations } from './withdrawal.js'
export type {
    WithdrawAllocationsParams,
    AllocationWithdrawal,
    AllocationWithdrawParams,
} from './withdrawal.js'
