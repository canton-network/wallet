// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateCommand } from 'src/common'
import { OTCTrade, OTCTradeProposal, TradingApp } from './dar'

const commands = {
    create: {
        otcTrade: generateCommand.create<OTCTrade>(
            TradingApp.OTCTrade.templateId
        ),
        otcTradeProposal: generateCommand.create<OTCTradeProposal>(
            TradingApp.OTCTradeProposal.templateId
        ),
    },

    exercise: {
        otcTrade: {
            settle: generateCommand.exercise(
                TradingApp.OTCTrade.templateId,
                TradingApp.OTCTrade.OTCTrade_Settle.choiceName
            ),
            cancel: generateCommand.exercise(
                TradingApp.OTCTrade.templateId,
                TradingApp.OTCTrade.OTCTrade_Cancel.choiceName
            ),
        },
        otcTradeProposal: {
            accept: generateCommand.exercise(
                TradingApp.OTCTradeProposal.templateId,
                TradingApp.OTCTradeProposal.OTCTradeProposal_Accept.choiceName
            ),
            reject: generateCommand.exercise(
                TradingApp.OTCTradeProposal.templateId,
                TradingApp.OTCTradeProposal.OTCTradeProposal_Reject.choiceName
            ),
            initiateSettlement: generateCommand.exercise(
                TradingApp.OTCTradeProposal.templateId,
                TradingApp.OTCTradeProposal.OTCTradeProposal_InitiateSettlement
                    .choiceName
            ),
        },
    },
}

export default commands
