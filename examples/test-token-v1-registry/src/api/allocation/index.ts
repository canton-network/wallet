// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Handler, OpenAPIBackend } from 'openapi-backend'
import { availableOpenAPIPaths } from '../../common/getOpenApiPath'
import { getAllocationCancelContext } from './getAllocationCancelContext'
import { getAllocationTransferContext } from './getAllocationTransferContext'
import { getAllocationWithdrawContext } from './getAllocationWithdrawContext'
import { OffLedger } from '@canton-network/core-token-standard'

export const allocationAPI = new OpenAPIBackend({
    definition: availableOpenAPIPaths['allocation-v1.yaml'],
    quick: true,
    handlers: {
        getAllocationTransferContext,
        getAllocationWithdrawContext,
        getAllocationCancelContext,
    } satisfies Record<keyof OffLedger.AllocationV1.operations, Handler>,
})

await allocationAPI.init()
