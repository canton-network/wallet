// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { APIError } from '../common'
import {
    buildTokenRulesV2ChoiceContext,
    resolveOrCreateTokenRulesV2,
} from '../token-rules-v2.js'
import { OffLedger } from '@canton-network/core-token-standard'
import { TExpressOpenApiRequestHandler } from 'openapi-ts-router/express'

export const getAllocationFactoryV2: TExpressOpenApiRequestHandler<
    OffLedger.AllocationInstructionV2.paths['/registry/allocation-instruction/v2/allocation-factory']['post']
> = async (_req, res, next) => {
    try {
        const factoryId = await resolveOrCreateTokenRulesV2()
        res.json({
            factoryId,
            choiceContext: await buildTokenRulesV2ChoiceContext(),
        })
    } catch (e) {
        next(e instanceof APIError ? e : new APIError(500, String(e)))
    }
}
