// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { OffLedger } from '@canton-network/core-token-standard'
import { APIError } from '../common'
import { buildTokenRulesV2ChoiceContext } from '../token-rules-v2.js'
import { TExpressOpenApiRequestHandler } from 'openapi-ts-router/express'

/**
 * @returns Choice context for accepting a TestTokenV2 mint/transfer offer.
 */
export const getTransferInstructionAcceptContext: TExpressOpenApiRequestHandler<
    OffLedger.TransferInstructionV1.paths['/registry/transfer-instruction/v1/{transferInstructionId}/choice-contexts/accept']['post']
> = async (_req, res, next) => {
    try {
        res.json(await buildTokenRulesV2ChoiceContext())
    } catch (e) {
        next(e instanceof APIError ? e : new APIError(500, String(e)))
    }
}
