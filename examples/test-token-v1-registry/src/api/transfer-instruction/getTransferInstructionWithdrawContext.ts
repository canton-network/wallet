// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { emptyChoiceContext } from '../common'
import { TransferInstructionAPIHandler } from './common'

/**
 * @returns Empty choice context payload for the transfer withdraw operation.
 */
export const getTransferInstructionWithdrawContext: TransferInstructionAPIHandler<
    'getTransferInstructionWithdrawContext'
> = async () => {
    return {
        payload: emptyChoiceContext,
    }
}
