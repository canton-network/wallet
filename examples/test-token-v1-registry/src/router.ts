// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { APIHandlerResponse } from './types'
import { metatadaAPI } from './api/metadata/index'
import { transferInstructionAPI } from './api/transfer-instruction/index'
import { allocationAPI } from './api/allocation/index'
import { allocationInstructionAPI } from './api/allocation-instruction/index'
import { Context } from 'koa'

/**
 * Normalizes Koa request context into the shape expected by generated API handlers.
 *
 * Each API module (`metadata`, `transfer-instruction`, `allocations`, `allocation-instruction`)
 * exposes `handleRequest(request)` and expects the request object returned by this helper.
 */
const contextToRequest = (ctx: Context) => {
    return {
        method: ctx.method,
        path: ctx.path,
        body: ctx.request.body,
        query: ctx.query as Record<string, string | string[]>,
        headers: ctx.headers as Record<string, string | string[]>,
    }
}

/**
 * Maps route prefixes to API handler modules.
 *
 * The router performs prefix matching and delegates the full request to the mapped handler,
 * so each API module remains responsible for operation-level routing and validation.
 */
const routeMap = new Map([
    ['/registry/metadata/v1/', metatadaAPI],
    ['/registry/transfer-instruction/v1/', transferInstructionAPI],
    ['/registry/allocations/v1/', allocationAPI],
    ['/registry/allocation-instruction/v1/', allocationInstructionAPI],
])

/**
 * Root registry router.
 *
 * How it works:
 * 1. Finds the first configured route prefix that matches `ctx.path`.
 * 2. Converts Koa context into a handler request via `contextToRequest`.
 * 3. Calls the matched module's `handleRequest` function.
 * 4. Writes handler response status/payload back to Koa response.
 *
 * Returns HTTP 501 when the path does not match any known registry route prefix.
 */
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
