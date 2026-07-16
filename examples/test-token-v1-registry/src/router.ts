// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { APIHandlerResponse } from './types'
import { metatadaAPI } from './api/metadata/index'
import { transferInstructionAPI } from './api/transfer-instruction/index'
import { allocationAPI } from './api/allocation/index'
import { allocationInstructionAPI } from './api/allocation-instruction/index'
import { Context } from 'koa'

const contextToRequest = (ctx: Context) => {
    return {
        method: ctx.method,
        path: ctx.path,
        body: ctx.request.body,
        query: ctx.query as Record<string, string | string[]>,
        headers: ctx.headers as Record<string, string | string[]>,
    }
}

const routeMap = new Map([
    ['/registry/metadata/v1/', metatadaAPI],
    ['/registry/transfer-instruction/v1/', transferInstructionAPI],
    ['/registry/allocation/v1/', allocationAPI],
    ['/registry/allocation-instruction/v1/', allocationInstructionAPI],
])

export const router = async (ctx: Context) => {
    const route = [...routeMap.keys()].find((route) =>
        ctx.path.startsWith(route)
    )

    if (!route) {
        ctx.status = 501
        return
    }

    const response: APIHandlerResponse = await routeMap
        .get(route)
        ?.handleRequest(contextToRequest(ctx))
    ctx.status = response.status || 200
    ctx.body = response.payload
}
