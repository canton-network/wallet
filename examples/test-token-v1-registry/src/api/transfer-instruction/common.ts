// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    ChoiceContext,
    OperationHandler,
    Operations,
} from '../../openapi-ts/transfer-instruction-v1'
import { APIOperationHandler } from '../../types'

export type TransferInstructionAPIHandler<
    operationId extends keyof Operations,
> = APIOperationHandler<OperationHandler<operationId>>

export const emptyChoiceContext: ChoiceContext = {
    choiceContextData: {},
    disclosedContracts: [],
}
