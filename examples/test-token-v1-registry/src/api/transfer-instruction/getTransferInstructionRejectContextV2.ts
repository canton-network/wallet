// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { APIError } from '../common'
import { buildTokenRulesV2ChoiceContext } from '../token-rules-v2.js'
import { OffLedger } from '@canton-network/core-token-standard'
import { TExpressOpenApiRequestHandler } from 'openapi-ts-router/express'

type RejectPath =
    OffLedger.TransferInstructionV2.paths['/registry/transfer-instruction/v2/{transferInstructionId}/choice-contexts/reject']['post']

export const getTransferInstructionRejectContextV2: TExpressOpenApiRequestHandler<
    RejectPath
> = async (_req, res, next) => {
    try {
        res.json(await buildTokenRulesV2ChoiceContext())
    } catch (e) {
        next(e instanceof APIError ? e : new APIError(500, String(e)))
    }
}
