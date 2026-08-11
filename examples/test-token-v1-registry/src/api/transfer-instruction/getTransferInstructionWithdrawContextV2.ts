// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { emptyChoiceContext } from '../common'
import { OffLedger } from '@canton-network/core-token-standard'
import { TExpressOpenApiRequestHandler } from 'openapi-ts-router/express'

type WithdrawPath =
    OffLedger.TransferInstructionV2.paths['/registry/transfer-instruction/v2/{transferInstructionId}/choice-contexts/withdraw']['post']

export const getTransferInstructionWithdrawContextV2: TExpressOpenApiRequestHandler<
    WithdrawPath
> = async (_req, res) => {
    res.json(emptyChoiceContext)
}
