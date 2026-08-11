// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { emptyChoiceContext } from '../common'
import { OffLedger } from '@canton-network/core-token-standard'
import { TExpressOpenApiRequestHandler } from 'openapi-ts-router/express'

type RejectPath =
    OffLedger.TransferInstructionV2.paths['/registry/transfer-instruction/v2/{transferInstructionId}/choice-contexts/reject']['post']

export const getTransferInstructionRejectContextV2: TExpressOpenApiRequestHandler<
    RejectPath
> = async (_req, res) => {
    res.json(emptyChoiceContext)
}
