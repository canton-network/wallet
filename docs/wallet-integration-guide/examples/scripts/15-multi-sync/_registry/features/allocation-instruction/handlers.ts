// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TestToken implementation of the allocation-instruction-v1 API
 * (api-specs/splice/0.6.1/allocation-instruction-v1.yaml).
 *
 * The allocation factory return live `TokenRules` contract on the
 * *global synchronizer*
 */

import type {
    FactoryWithChoiceContext,
    AllocationInstructionHandlers,
    GetFactoryRequest,
} from '../../types.js'
import type { TokenRulesContract } from '../../ledger.js'

export interface AllocationInstructionHandlerContext {
    getTokenRules: (
        synchronizerId?: string
    ) => Promise<TokenRulesContract | null>
    globalSynchronizerId: string
}

export function createAllocationInstructionHandlers(
    ctx: AllocationInstructionHandlerContext
): AllocationInstructionHandlers {
    return {
        getAllocationFactory: async (
            _req: GetFactoryRequest
        ): Promise<FactoryWithChoiceContext | null> => {
            const tokenRules = await ctx.getTokenRules(ctx.globalSynchronizerId)
            if (!tokenRules) return null
            return {
                factoryId: tokenRules.contractId,
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
    }
}
