// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { OffLedger } from '@canton-network/core-token-standard-v2'
import type { TExpressOpenApiRequestHandler } from 'openapi-ts-router/express'
import { getTokenRulesContext } from '../getTokenRulesContext'

/**
 * Resolves or creates an allocation factory for initiating allocation workflows.
 *
 * @throws {500} when instantiating new allocation factory contract has failed.
 * @returns Factory identifier with choice context on success.
 */
export const getAllocationFactory: TExpressOpenApiRequestHandler<
    OffLedger.AllocationInstructionV2.paths['/registry/allocation-instruction/v2/allocation-factory']['post']
> = async (_req, res, next) => {
    try {
        res.json(await getTokenRulesContext())
    } catch (e) {
        next(e)
    }
}
