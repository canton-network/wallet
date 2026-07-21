// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { emptyChoiceContext } from '../common'
import { TransferInstructionAPIHandler } from './common'

/**
 * @returns Empty choice context payload for the transfer accept operation.
 */
export const getTransferInstructionAcceptContext: TransferInstructionAPIHandler<
    'getTransferInstructionAcceptContext'
> = async () => {
    return {
        payload: emptyChoiceContext,
    }
}
