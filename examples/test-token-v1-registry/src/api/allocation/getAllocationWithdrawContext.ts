// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { OffLedger } from '@canton-network/core-token-standard'
import { APIHandler } from '../../types'
import { emptyChoiceContext } from '../common'

/**
 * @returns Empty choice context payload for the allocation withdraw operation.
 */
export const getAllocationWithdrawContext: APIHandler<
    OffLedger.AllocationV1.paths['/registry/allocations/v1/{allocationId}/choice-contexts/withdraw']['post']
> = async () => {
    return {
        payload: emptyChoiceContext,
    }
}
