// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { OffLedger } from '@canton-network/core-token-standard-v2'
import type { TExpressOpenApiRequestHandler } from 'openapi-ts-router/express'

import { emptyChoiceContext } from '../common.ts'

/**
 * @returns Empty choice context payload for the allocation cancel operation.
 */
export const getAllocationCancelContext: TExpressOpenApiRequestHandler<
    OffLedger.AllocationV2.paths['/registry/allocations/v2/{allocationId}/choice-contexts/cancel']['post']
> = (_req, res) => {
    res.json(emptyChoiceContext)
}
