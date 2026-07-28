// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Handler, OpenAPIBackend } from 'openapi-backend'
import { availableOpenAPIPaths } from '../../common/getOpenApiPath'
import { getAllocationFactory } from './getAllocationFactory'
import { OffLedger } from '@canton-network/core-token-standard'

export const allocationInstructionAPI = new OpenAPIBackend({
    definition: availableOpenAPIPaths['allocation-instruction-v1.yaml'],
    quick: true,
    handlers: {
        getAllocationFactory,
    } satisfies Record<
        keyof OffLedger.AllocationInstructionV1.operations,
        Handler
    >,
})

await allocationInstructionAPI.init()
