// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { OpenAPIBackend } from 'openapi-backend'
import { availableOpenAPIPaths } from '../../common/getOpenApiPath'
import { getAllocationFactory } from './getAllocationFactory'

export const allocationInstructionAPI = new OpenAPIBackend({
    definition: availableOpenAPIPaths['allocation-instruction-v1.yaml'],
    quick: true,
    handlers: {
        getAllocationFactory,
    },
})

await allocationInstructionAPI.init()
