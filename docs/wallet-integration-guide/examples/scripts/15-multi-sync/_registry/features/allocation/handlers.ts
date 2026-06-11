// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TestToken implementation of the allocation-v1 API
 * (api-specs/splice/0.6.1/allocation-v1.yaml).
 *
 * All allocation choice-context endpoints return an empty context — the
 * TestToken `Allocation_ExecuteTransfer`, `Allocation_Withdraw` and
 * `Allocation_Cancel` choices read no additional contracts.
 */

import type { ChoiceContext, AllocationHandlers } from '../../types.js'

export function createAllocationHandlers(): AllocationHandlers {
    const emptyContext: ChoiceContext = {
        choiceContextData: { values: {} },
        disclosedContracts: [],
    }

    return {
        getAllocationTransferContext: async (): Promise<ChoiceContext> =>
            emptyContext,
        getAllocationWithdrawContext: async (): Promise<ChoiceContext> =>
            emptyContext,
        getAllocationCancelContext: async (): Promise<ChoiceContext> =>
            emptyContext,
    }
}
