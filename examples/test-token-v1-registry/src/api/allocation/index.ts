// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { OpenAPIBackend } from 'openapi-backend'
import { availableOpenAPIPaths } from '../../common/getOpenApiPath'
import { getAllocationCancelContext } from './getAllocationCancelContext'
import { getAllocationTransferContext } from './getAllocationTransferContext'
import { getAllocationWithdrawContext } from './getAllocationWithdrawContext'

export const allocationAPI = new OpenAPIBackend({
    definition: availableOpenAPIPaths['allocation-v1.yaml'],
    quick: true,
    handlers: {
        getAllocationTransferContext,
        getAllocationWithdrawContext,
        getAllocationCancelContext,
    },
})

await allocationAPI.init()
