// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { OpenAPIBackend } from 'openapi-backend'
import { availableOpenAPIPaths } from '../../common/getOpenApiPath'
import { getTransferFactory } from './getTransferFactory'
import { getTransferInstructionAcceptContext } from './getTransferInstructionAcceptContext'
import { getTransferInstructionRejectContext } from './getTransferInstructionRejectContext'
import { getTransferInstructionWithdrawContext } from './getTransferInstructionWithdrawContext'

export const transferInstructionAPI = new OpenAPIBackend({
    definition: availableOpenAPIPaths['transfer-instruction-v1.yaml'],
    quick: true,
    handlers: {
        getTransferFactory,
        getTransferInstructionAcceptContext,
        getTransferInstructionRejectContext,
        getTransferInstructionWithdrawContext,
    },
})

await transferInstructionAPI.init()
