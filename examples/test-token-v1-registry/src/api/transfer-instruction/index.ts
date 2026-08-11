// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Router } from 'express'
import {
    getTransferFactory,
    getTransferFactoryChoiceArgumentsSchema,
} from './getTransferFactory'
import { getTransferInstructionAcceptContext } from './getTransferInstructionAcceptContext'
import { getTransferInstructionRejectContext } from './getTransferInstructionRejectContext'
import { getTransferInstructionWithdrawContext } from './getTransferInstructionWithdrawContext'
import {
    getTransferFactoryV2,
    getTransferFactoryV2ChoiceArgumentsSchema,
} from './getTransferFactoryV2.js'
import { getTransferInstructionAcceptContextV2 } from './getTransferInstructionAcceptContextV2.js'
import { getTransferInstructionRejectContextV2 } from './getTransferInstructionRejectContextV2.js'
import { getTransferInstructionWithdrawContextV2 } from './getTransferInstructionWithdrawContextV2.js'
import { OffLedger } from '@canton-network/core-token-standard'
import { createExpressOpenApiRouter } from 'openapi-ts-router/express'
import z, { ZodType } from 'zod'
import { choiceContextRequestSchema } from '../common'

const pathSchema = z.object({
    transferInstructionId: z.string(),
})

const transferInstructionAPIRouter = Router()

const openAPIRouter =
    createExpressOpenApiRouter<OffLedger.TransferInstructionV1.paths>(
        transferInstructionAPIRouter
    )

const openAPIRouterV2 =
    createExpressOpenApiRouter<OffLedger.TransferInstructionV2.paths>(
        transferInstructionAPIRouter
    )

openAPIRouter.post('/registry/transfer-instruction/v1/transfer-factory', {
    bodySchema: z.object({
        choiceArguments: getTransferFactoryChoiceArgumentsSchema,
        excludeDebugFields: z.boolean(),
    }) as unknown as ZodType<
        OffLedger.TransferInstructionV1.operations['getTransferFactory']['requestBody']['content']['application/json']
    >,
    handler: getTransferFactory,
})

openAPIRouter.post(
    '/registry/transfer-instruction/v1/{transferInstructionId}/choice-contexts/accept',
    {
        bodySchema: choiceContextRequestSchema,
        pathSchema,
        handler: getTransferInstructionAcceptContext,
    }
)

openAPIRouter.post(
    '/registry/transfer-instruction/v1/{transferInstructionId}/choice-contexts/reject',
    {
        handler: getTransferInstructionRejectContext,
        bodySchema: choiceContextRequestSchema,
        pathSchema,
    }
)

openAPIRouter.post(
    '/registry/transfer-instruction/v1/{transferInstructionId}/choice-contexts/withdraw',
    {
        handler: getTransferInstructionWithdrawContext,
        bodySchema: choiceContextRequestSchema,
        pathSchema,
    }
)

openAPIRouterV2.post('/registry/transfer-instruction/v2/transfer-factory', {
    bodySchema: z.object({
        choiceArguments: getTransferFactoryV2ChoiceArgumentsSchema,
        excludeDebugFields: z.boolean(),
    }) as unknown as ZodType<
        OffLedger.TransferInstructionV2.operations['getTransferFactory']['requestBody']['content']['application/json']
    >,
    handler: getTransferFactoryV2,
})

openAPIRouterV2.post(
    '/registry/transfer-instruction/v2/{transferInstructionId}/choice-contexts/accept',
    {
        bodySchema: choiceContextRequestSchema,
        pathSchema,
        handler: getTransferInstructionAcceptContextV2,
    }
)

openAPIRouterV2.post(
    '/registry/transfer-instruction/v2/{transferInstructionId}/choice-contexts/reject',
    {
        handler: getTransferInstructionRejectContextV2,
        bodySchema: choiceContextRequestSchema,
        pathSchema,
    }
)

openAPIRouterV2.post(
    '/registry/transfer-instruction/v2/{transferInstructionId}/choice-contexts/withdraw',
    {
        handler: getTransferInstructionWithdrawContextV2,
        bodySchema: choiceContextRequestSchema,
        pathSchema,
    }
)

export default transferInstructionAPIRouter
