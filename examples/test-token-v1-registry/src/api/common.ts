// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChoiceContext as AllocationInstructionChoiceContext } from '../openapi-ts/allocation-instruction-v1'
import { ChoiceContext as AllocationChoiceContext } from '../openapi-ts/allocation-v1'
import { ChoiceContext as TransferInstructionChoiceContext } from '../openapi-ts/transfer-instruction-v1'

export const emptyChoiceContext:
    | AllocationChoiceContext
    | AllocationInstructionChoiceContext
    | TransferInstructionChoiceContext = {
    choiceContextData: {},
    disclosedContracts: [],
}
