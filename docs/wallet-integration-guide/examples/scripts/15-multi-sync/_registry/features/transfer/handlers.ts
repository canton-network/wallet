// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TestToken implementation of the transfer-instruction-v1 API
 * (api-specs/splice/0.6.1/transfer-instruction-v1.yaml).
 *
 * The transfer factory is the live `TokenRules` contract on the app-synchronizer
 * — TestToken transfers (mint → Bob, and the self-transfers) are submitted there.
 * The factory contract is disclosed in the choice context so the submitting party
 * can exercise `TransferFactory_Transfer` on it.
 *
 * For TestToken, the on-ledger choices read no additional contracts, so the
 * accept/reject/withdraw choice contexts are empty.
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
        ): Promise<TransferFactoryWithChoiceContext> => {
            const transfer = req.choiceArguments?.['transfer'] as
                | Record<string, unknown>
                | undefined
            if (transfer === undefined)
                throw new Error(
                    'getTransferFactory: missing "transfer" choice argument'
                )
            if (
                transfer['sender'] === undefined ||
                transfer['receiver'] === undefined
            )
                throw new Error(
                    'getTransferFactory: "transfer" argument must include sender and receiver'
                )
            const transferKind: 'self' | 'offer' =
                transfer['sender'] === transfer['receiver'] ? 'self' : 'offer'

            const tokenRules = await ctx.getTokenRules(ctx.appSynchronizerId)
            if (!tokenRules)
                throw new Error(
                    `getTransferFactory: TokenRules not found on app synchronizer ${ctx.appSynchronizerId}`
                )
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
