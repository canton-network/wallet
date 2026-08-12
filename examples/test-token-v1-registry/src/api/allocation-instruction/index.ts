// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Router } from 'express'
import { getAllocationFactory } from './getAllocationFactory'
import { getAllocationFactoryV2 } from './getAllocationFactoryV2.js'
import { OffLedger } from '@canton-network/core-token-standard'
import { createExpressOpenApiRouter } from 'openapi-ts-router/express'
import z, { ZodType } from 'zod'
import { choiceContextRequestSchema, emptyChoiceContext } from '../common'

const allocationInstructionAPIRouter = Router()

const openAPIRouter =
    createExpressOpenApiRouter<OffLedger.AllocationInstructionV1.paths>(
        allocationInstructionAPIRouter
    )

const openAPIRouterV2 =
    createExpressOpenApiRouter<OffLedger.AllocationInstructionV2.paths>(
        allocationInstructionAPIRouter
    )

openAPIRouter.post('/registry/allocation-instruction/v1/allocation-factory', {
    handler: getAllocationFactory,
    bodySchema: z.object({
        choiceArguments: z.record(z.string(), z.never()),
        excludeDebugFields: z.boolean(),
    }),
})

openAPIRouterV2.post('/registry/allocation-instruction/v2/allocation-factory', {
    handler: getAllocationFactoryV2,
    bodySchema: z.object({
        choiceArguments: z.record(z.string(), z.unknown()).optional(),
        excludeDebugFields: z.boolean().optional(),
    }) as unknown as ZodType<
        OffLedger.AllocationInstructionV2.operations['getAllocationFactory']['requestBody']['content']['application/json']
    >,
})

const instructionPathSchema = z.object({
    allocationInstructionId: z.string(),
})

openAPIRouterV2.post(
    '/registry/allocation-instruction/v2/{allocationInstructionId}/choice-contexts/accept',
    {
        pathSchema: instructionPathSchema,
        bodySchema: choiceContextRequestSchema,
        handler: async (_req, res) => {
            res.json(emptyChoiceContext)
        },
    }
)

openAPIRouterV2.post(
    '/registry/allocation-instruction/v2/{allocationInstructionId}/choice-contexts/withdraw',
    {
        pathSchema: instructionPathSchema,
        bodySchema: choiceContextRequestSchema,
        handler: async (_req, res) => {
            res.json(emptyChoiceContext)
        },
    }
)

export default allocationInstructionAPIRouter
