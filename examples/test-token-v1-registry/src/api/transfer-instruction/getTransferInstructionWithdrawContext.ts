// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TransferInstructionAPIHandler } from './common'

export const getTransferInstructionWithdrawContext: TransferInstructionAPIHandler<
    'getTransferInstructionWithdrawContext'
> = async (ctx) => {
    console.log(ctx)
    return {
        payload: {
            test: true,
        },
    }
}
