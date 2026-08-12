// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Router } from 'express'
import { getAllocationCancelContext } from './getAllocationCancelContext'
import { getAllocationTransferContext } from './getAllocationTransferContext'
import { getAllocationWithdrawContext } from './getAllocationWithdrawContext'
import { getSettlementFactoryV2 } from './getSettlementFactoryV2.js'
import { emptyChoiceContext } from '../common'
import { OffLedger } from '@canton-network/core-token-standard'
import { createExpressOpenApiRouter } from 'openapi-ts-router/express'
import z, { ZodType } from 'zod'
import { choiceContextRequestSchema } from '../common'

const pathSchema = z.object({
    allocationId: z.string(),
})

const allocationAPIRouter = Router()

const openAPIRouter =
    createExpressOpenApiRouter<OffLedger.AllocationV1.paths>(
        allocationAPIRouter
    )

const openAPIRouterV2 =
    createExpressOpenApiRouter<OffLedger.AllocationV2.paths>(
        allocationAPIRouter
    )

openAPIRouter.post(
    '/registry/allocations/v1/{allocationId}/choice-contexts/cancel',
    {
        pathSchema,
        bodySchema: choiceContextRequestSchema,
        handler: getAllocationCancelContext,
    }
)

openAPIRouter.post(
    '/registry/allocations/v1/{allocationId}/choice-contexts/execute-transfer',
    {
        pathSchema,
        bodySchema: choiceContextRequestSchema,
        handler: getAllocationTransferContext,
    }
)

openAPIRouter.post(
    '/registry/allocations/v1/{allocationId}/choice-contexts/withdraw',
    {
        pathSchema,
        bodySchema: choiceContextRequestSchema,
        handler: getAllocationWithdrawContext,
    }
)

openAPIRouterV2.post('/registry/allocation/v2/settlement-factory', {
    bodySchema: z.object({
        choiceArguments: z.record(z.string(), z.unknown()).optional(),
        excludeDebugFields: z.boolean().optional(),
    }) as unknown as ZodType<
        OffLedger.AllocationV2.operations['getSettlementFactory']['requestBody']['content']['application/json']
    >,
    handler: getSettlementFactoryV2,
})

openAPIRouterV2.post(
    '/registry/allocations/v2/{allocationId}/choice-contexts/cancel',
    {
        pathSchema,
        bodySchema: choiceContextRequestSchema,
        handler: async (_req, res) => {
            res.json(emptyChoiceContext)
        },
    }
)

openAPIRouterV2.post(
    '/registry/allocations/v2/{allocationId}/choice-contexts/withdraw',
    {
        pathSchema,
        bodySchema: choiceContextRequestSchema,
        handler: async (_req, res) => {
            res.json(emptyChoiceContext)
        },
    }
)

export default allocationAPIRouter
