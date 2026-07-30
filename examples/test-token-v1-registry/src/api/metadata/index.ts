// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Handler, OpenAPIBackend } from 'openapi-backend'
import { availableOpenAPIPaths } from '../../common/getOpenApiPath'
import { getRegistryInfo } from './getRegistryInfo'
import { listInstruments } from './listInstruments'
import { getInstrument } from './getInstrument'
import { OffLedger } from '@canton-network/core-token-standard'

export const metatadaAPI = new OpenAPIBackend({
    definition: availableOpenAPIPaths['token-metadata-v1.yaml'],
    quick: true,
    handlers: {
        getRegistryInfo,
        listInstruments,
        getInstrument,
    } satisfies Record<keyof OffLedger.MetadataV1.operations, Handler>,
})

await metatadaAPI.init()
