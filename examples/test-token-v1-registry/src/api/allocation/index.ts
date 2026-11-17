// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { OffLedger } from '@canton-network/core-token-standard'
import { Router } from 'express'
import { createExpressOpenApiRouter } from 'openapi-ts-router/express'
import z from 'zod'

import { choiceContextRequestSchema } from '../common.ts'
import { getAllocationCancelContext } from './getAllocationCancelContext.ts'
import { getAllocationTransferContext } from './getAllocationTransferContext.ts'
import { getAllocationWithdrawContext } from './getAllocationWithdrawContext.ts'

const pathSchema = z.object({
    allocationId: z.string(),
})

const allocationAPIRouter: Router = Router()

const openAPIRouter =
    createExpressOpenApiRouter<OffLedger.AllocationV1.paths>(
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

export default allocationAPIRouter
