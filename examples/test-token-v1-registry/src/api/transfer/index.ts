// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { OpenAPIBackend } from 'openapi-backend'
import { availableOpenAPIPaths } from '../../common/getOpenApiPath'

export const transferInstructionAPI = new OpenAPIBackend({
    definition: availableOpenAPIPaths['transfer-instruction-v1.yaml'],
    quick: true,
    handlers: {},
})

await transferInstructionAPI.init()
