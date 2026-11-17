// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { OffLedger } from '@canton-network/core-token-standard-v2'
import { Router } from 'express'
import { createExpressOpenApiRouter } from 'openapi-ts-router/express'
import z, { type ZodType } from 'zod'

import { choiceContextRequestSchema } from '../common.ts'
import { getAllocationFactory } from './getAllocationFactory.ts'
import { getAllocationInstructionAcceptContext } from './getAllocationInstructionAcceptContext.ts'
import { getAllocationInstructionWithdrawContext } from './getAllocationInstructionWithdrawContext.ts'

const choiceContextPathSchema = z.object({
    allocationInstructionId: z.string(),
})

const allocationInstructionAPIRouter: Router = Router()

const openAPIRouter =
    createExpressOpenApiRouter<OffLedger.AllocationInstructionV2.paths>(
        allocationInstructionAPIRouter
    )

openAPIRouter.post('/registry/allocation-instruction/v2/allocation-factory', {
    handler: getAllocationFactory,
    bodySchema: z.object({
        choiceArguments: z.record(z.string(), z.unknown()),
        excludeDebugFields: z.boolean(),
    }) as unknown as ZodType<
        OffLedger.AllocationInstructionV2.operations['getAllocationFactory']['requestBody']['content']['application/json']
    >,
})

openAPIRouter.post(
    '/registry/allocation-instruction/v2/{allocationInstructionId}/choice-contexts/accept',
    {
        pathSchema: choiceContextPathSchema,
        bodySchema: choiceContextRequestSchema,
        handler: getAllocationInstructionAcceptContext,
    }
)

openAPIRouter.post(
    '/registry/allocation-instruction/v2/{allocationInstructionId}/choice-contexts/withdraw',
    {
        pathSchema: choiceContextPathSchema,
        bodySchema: choiceContextRequestSchema,
        handler: getAllocationInstructionWithdrawContext,
    }
)

export default allocationInstructionAPIRouter
