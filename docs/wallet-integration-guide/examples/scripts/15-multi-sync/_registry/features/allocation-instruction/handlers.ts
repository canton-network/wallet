// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TestToken implementation of the allocation-instruction-v1 API
 * (api-specs/splice/0.6.1/allocation-instruction-v1.yaml).
 *
 * The allocation factory is the live `TokenRules` contract on the
 * *global synchronizer*: Bob reassigns his holding to global and then exercises
 * `AllocationFactory_Allocate` there so the resulting allocation can be consumed
 * atomically by `OTCTrade_Settle` (which also runs on global). The disclosed
 * factory must therefore target the global synchronizer to avoid a
 * PRESCRIBED_SYNCHRONIZER_ID_MISMATCH.
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
