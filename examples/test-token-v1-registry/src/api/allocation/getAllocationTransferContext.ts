// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { emptyChoiceContext } from '../common'
import { AllocationAPIHandler } from './common'

export const getAllocationTransferContext: AllocationAPIHandler<
    'getAllocationTransferContext'
> = async () => {
    return {
        payload: emptyChoiceContext,
    }
}
