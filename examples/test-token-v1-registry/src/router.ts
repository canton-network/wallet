// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Router, { RouterContext } from '@koa/router'
import { APIHandlerResponse } from './types'
import { metatadaAPI } from './api/metadata/index'
import { transferInstructionAPI } from './api/transfer-instruction/index'
import { allocationAPI } from './api/allocation/index'
import { allocationInstructionAPI } from './api/allocation-instruction/index'

const contextToRequest = (ctx: RouterContext) => {
    return {
        method: ctx.method,
        path: ctx.path,
        body: ctx.request.body,
        query: ctx.query as Record<string, string | string[]>,
        headers: ctx.headers as Record<string, string | string[]>,
    }
}

const router = new Router()

router.all('/registry/metadata/v1/:method', async (ctx) => {
    console.log()
    const response: APIHandlerResponse = await metatadaAPI.handleRequest(
        contextToRequest(ctx)
    )
    ctx.status = response.status || 200
    ctx.body = response.payload
})

router.all('/registry/transfer-instruction/v1/:method', async (ctx) => {
    const response: APIHandlerResponse =
        await transferInstructionAPI.handleRequest(contextToRequest(ctx))
    ctx.status = response.status || 200
    ctx.body = response.payload
})

router.all('/registry/allocation/v1/:method', async (ctx) => {
    const response: APIHandlerResponse = await allocationAPI.handleRequest(
        contextToRequest(ctx)
    )
    ctx.status = response.status || 200
    ctx.body = response.payload
})

router.all('/registry/allocation-instruction/v1/:method', async (ctx) => {
    const response: APIHandlerResponse =
        await allocationInstructionAPI.handleRequest(contextToRequest(ctx))
    ctx.status = response.status || 200
    ctx.body = response.payload
})

export default router
