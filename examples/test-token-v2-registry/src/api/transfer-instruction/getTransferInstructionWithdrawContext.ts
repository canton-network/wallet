// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { OffLedger } from '@canton-network/core-token-standard-v2'
import { getTransferFactoryContext } from './getTransferFactoryContext'
import type { TExpressOpenApiRequestHandler } from 'openapi-ts-router/express'

/**
 * @returns Token rules context and disclosure for the transfer withdraw operation.
 */
export const getTransferInstructionWithdrawContext: TExpressOpenApiRequestHandler<
    OffLedger.TransferInstructionV2.paths['/registry/transfer-instruction/v2/{transferInstructionId}/choice-contexts/withdraw']['post']
> = async (req, res, next) => {
    try {
        const { choiceContext } = await getTransferFactoryContext(
            req.params.transferInstructionId
        )
        res.json(choiceContext)
    } catch (e) {
        next(e)
    }
}
