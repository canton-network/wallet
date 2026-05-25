// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TestToken implementation of AllocationInstructionHandlers.
 *
 * Resolves the AllocationFactory by looking up the live CompositionRules contract on the
 * *app-synchronizer*. The allocation transaction is submitted to app-sync (where the
 * CompositionToken holding lives), so the disclosed factory must target the same sync to
 * avoid PRESCRIBED_SYNCHRONIZER_ID_MISMATCH.
 *
 * After allocation, the CompositionAllocation is explicitly reassigned to global-sync
 * (by `reassignTokenAllocationToGlobal`) so that `OTCTrade_Settle` on global can
 * consume it atomically.
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

    appSynchronizerId: string
}

export function createAllocationInstructionHandlers(
    ctx: AllocationInstructionHandlerContext
): AllocationInstructionHandlers {
    return {
        getAllocationFactory: async (
            _req: GetFactoryRequest
        ): Promise<FactoryWithChoiceContext | null> => {
            const tokenRules = await ctx.getTokenRules(ctx.appSynchronizerId)
            if (!tokenRules) return null
            return {
                factoryId: tokenRules.contractId,
                choiceContext: {
                    choiceContextData: {},
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
