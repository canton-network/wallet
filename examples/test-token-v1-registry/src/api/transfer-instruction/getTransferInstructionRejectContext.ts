// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { OffLedger } from '@canton-network/core-token-standard'
import { APIHandler } from '../../types'
import { emptyChoiceContext } from '../common'

/**
 * @returns Empty choice context payload for the transfer reject operation.
 */
export const getTransferInstructionRejectContext: APIHandler<
    OffLedger.TransferInstructionV1.paths['/registry/transfer-instruction/v1/{transferInstructionId}/choice-contexts/reject']['post']
> = async () => {
    return {
        payload: emptyChoiceContext,
    }
}
