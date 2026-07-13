// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import OpenAPIBackend, { Context } from 'openapi-backend'
import { availableOpenAPIPaths } from '../../common/getOpenApiPath'
import { GetRegistryInfoResponse } from '../../openapi-ts/token-metadata-v1'

const api = new OpenAPIBackend({
    definition: availableOpenAPIPaths['token-metadata-v1.yaml'],
    handlers: {
        getRegistryInfo(ctx: Context): GetRegistryInfoResponse {
            console.log(ctx)
            return {
                adminId: '',
                supportedApis: {},
            }
        },
    },
})

api.init()
