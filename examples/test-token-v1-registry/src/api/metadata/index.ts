// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { OffLedger } from '@canton-network/core-token-standard'
import { Router } from 'express'
import { createExpressOpenApiRouter } from 'openapi-ts-router/express'
import z from 'zod'

import { getInstrument } from './getInstrument.ts'
import { getRegistryInfo } from './getRegistryInfo.ts'
import { listInstruments } from './listInstruments.ts'

const metadataAPIRouter: Router = Router()

const openAPIRouter =
    createExpressOpenApiRouter<OffLedger.MetadataV1.paths>(metadataAPIRouter)

openAPIRouter.get('/registry/metadata/v1/info', {
    handler: getRegistryInfo,
})

openAPIRouter.get('/registry/metadata/v1/instruments', {
    handler: listInstruments,
})

openAPIRouter.get('/registry/metadata/v1/instruments/{instrumentId}', {
    pathSchema: z.object({
        instrumentId: z.string(),
    }),
    handler: getInstrument,
})

export default metadataAPIRouter
