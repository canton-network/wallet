// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Koa, { type Context } from 'koa'
import bodyParser from 'koa-bodyparser'
import { metatadaAPI } from './api/metadata/index'
import type { Request } from 'openapi-backend'
import { APIHandlerResponse } from './types'

const app = new Koa()

const contextToRequest = (ctx: Context): Request => {
    return {
        method: ctx.method,
        path: ctx.path,
        body: ctx.request.body,
        query: ctx.query as Record<string, string | string[]>,
        headers: ctx.headers as Record<string, string | string[]>,
    }
}

app.use(bodyParser())
    .use(async (ctx) => {
        const response: APIHandlerResponse = await metatadaAPI.handleRequest(
            contextToRequest(ctx)
        )
        ctx.status = response.status || 200
        ctx.body = response?.payload ?? response
    })
    .listen(3000, () => console.info('api listening on http://localhost:3000'))
