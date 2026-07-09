// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TestToken implementation of the allocation-v1 API
 * (api-specs/splice/0.6.1/allocation-v1.yaml).
 *
 * The execute-transfer choice context mirrors the Amulet registry's shape
 *
 */

import type { ChoiceContext } from '../../types.js'
import type { allocationApiOperations } from '@canton-network/core-token-standard'
import type { OperationHandlers } from '../../http/openapi-router.js'
import type { TokenRulesContract } from '../../ledger.js'

export interface AllocationHandlerContext {
    getTokenRules: (
        synchronizerId?: string
    ) => Promise<TokenRulesContract | null>
    allocationSynchronizerId: string
}

export function createAllocationHandlers(
    ctx: AllocationHandlerContext
): OperationHandlers<allocationApiOperations> {
    const emptyContext: ChoiceContext = {
        choiceContextData: { values: {} },
        disclosedContracts: [],
    }

    return {
        getAllocationTransferContext: async (): Promise<ChoiceContext> => {
            const tokenRules = await ctx.getTokenRules(
                ctx.allocationSynchronizerId
            )
            if (!tokenRules) return emptyContext
            return {
                choiceContextData: {
                    values: {
                        'token-rules': {
                            tag: 'AV_ContractId',
                            value: tokenRules.contractId,
                        },
                    },
                },
                disclosedContracts: [
                    {
                        templateId: tokenRules.templateId,
                        contractId: tokenRules.contractId,
                        createdEventBlob: tokenRules.createdEventBlob,
                        synchronizerId: tokenRules.synchronizerId,
                    },
                ],
            }
        },
        getAllocationWithdrawContext: async (): Promise<ChoiceContext> =>
            emptyContext,
        getAllocationCancelContext: async (): Promise<ChoiceContext> =>
            emptyContext,
    }
}
