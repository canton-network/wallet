// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TestToken implementation of TransferHandlers.
 *
 * Resolves the TransferFactory by looking up the live CompositionRules contract from the
 * ledger ACS, then exposes it as a disclosed contract in the choice context.
 * CompositionRules is used instead of TokenRules so that splice-test-token-v1 stays
 * on the app-synchronizer only (never on global).
 */

import type {
    TransferFactoryWithChoiceContext,
    ChoiceContext,
    TransferHandlers,
    GetFactoryRequest,
} from '../../types.js'
import type { TokenRulesContract } from '../../ledger.js'

export interface TransferHandlerContext {
    getTokenRules: (
        synchronizerId?: string
    ) => Promise<TokenRulesContract | null>
    appSynchronizerId: string
}

export function createTransferHandlers(
    ctx: TransferHandlerContext
): TransferHandlers {
    return {
        getTransferFactory: async (
            req: GetFactoryRequest
        ): Promise<TransferFactoryWithChoiceContext | null> => {
            const args = req.choiceArguments as unknown as Record<
                string,
                unknown
            >
            const transfer = args?.transfer as
                | Record<string, unknown>
                | undefined
            const isSelf =
                transfer !== undefined &&
                transfer.sender !== undefined &&
                transfer.sender === transfer.receiver
            const transferKind: 'self' | 'offer' = isSelf ? 'self' : 'offer'

            const synchronizerId = ctx.appSynchronizerId
            const tokenRules = await ctx.getTokenRules(synchronizerId)
            if (!tokenRules) return null
            return {
                factoryId: tokenRules.contractId,
                transferKind,
                choiceContext: {
                    choiceContextData: { values: {} },
                    disclosedContracts: [
                        {
                            templateId: tokenRules.templateId,
                            contractId: tokenRules.contractId,
                            createdEventBlob: tokenRules.createdEventBlob,
                            synchronizerId: tokenRules.synchronizerId,
                        },
                    ],
                },
            }
        },

        getTransferInstructionAcceptContext:
            async (): Promise<ChoiceContext> => ({
                choiceContextData: { values: {} },
                disclosedContracts: [],
            }),

        getTransferInstructionRejectContext:
            async (): Promise<ChoiceContext> => ({
                choiceContextData: { values: {} },
                disclosedContracts: [],
            }),

        getTransferInstructionWithdrawContext:
            async (): Promise<ChoiceContext> => ({
                choiceContextData: { values: {} },
                disclosedContracts: [],
            }),
    }
}
