// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Generic, type-safe Express router driven by OpenAPI `operations` types.
 *
 * This is the hand-written runtime that the code-generated registry routing
 * table plugs into (see ../generated-server/registry-server.ts). The route
 * definitions and operation set are generated from the specs; all logic and the
 * shared type machinery live here.
 */

import express, {
    type Request,
    type RequestHandler,
    type Router,
} from 'express'

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'

/** Path parameters declared by an operation (empty object when none). */
type PathParams<Op> = Op extends { parameters: { path: infer P } }
    ? [P] extends [never]
        ? Record<string, never>
        : P
    : Record<string, never>

/** Query parameters declared by an operation (empty object when none). */
type QueryParams<Op> = Op extends { parameters: { query?: infer Q } }
    ? [Q] extends [never]
        ? Record<string, never>
        : NonNullable<Q>
    : Record<string, never>

/** JSON request body of an operation (`never` when none). */
type RequestBody<Op> = Op extends {
    requestBody?: { content: { 'application/json': infer B } }
}
    ? B
    : never

/** Success (200) JSON response body of an operation. */
type SuccessResponse<Op> = Op extends {
    responses: { 200: { content: { 'application/json': infer R } } }
}
    ? R
    : void

/**
 * openapi-typescript renders bare `object` schemas (e.g. Daml choice-context
 * data) as `Record<string, never>`. Widen those to accept any JSON object so a
 * handler can return the real payload, while keeping precise schemas strict.
 */
type Loosen<T> = [T] extends [Record<string, never>]
    ? Record<string, unknown>
    : T extends readonly (infer E)[]
      ? Loosen<E>[]
      : T extends object
        ? { [K in keyof T]: Loosen<T[K]> }
        : T

/** Response payload a handler may return for an operation. */
type HandlerResponse<Op> = Loosen<SuccessResponse<Op>>

/** Arguments handed to an operation handler, fully typed from the OpenAPI spec. */
export interface OperationRequest<Op> {
    params: PathParams<Op>
    query: QueryParams<Op>
    body: RequestBody<Op>
    req: Request
}

/**
 * Implements a single operation. Return the success payload to send it as
 * `200 application/json`, or `null` to respond with `404 Not Found`.
 */
export type OperationHandler<Op> = (
    request: OperationRequest<Op>
) => HandlerResponse<Op> | null | Promise<HandlerResponse<Op> | null>

/**
 * The complete set of handlers for an OpenAPI `operations` type. Every
 * `operationId` must be implemented; omissions and signature mismatches are
 * compile errors.
 */
export type OperationHandlers<Operations> = {
    [Id in keyof Operations]: OperationHandler<Operations[Id]>
}

/** A route binding one `operationId` to an HTTP method and Express path. */
export interface Route<Operations> {
    operationId: keyof Operations
    method: HttpMethod
    path: string
}

type UntypedHandler = (request: {
    params: Record<string, string>
    query: Record<string, unknown>
    body: unknown
    req: Request
}) => unknown

/**
 * Builds an Express router that binds each route to its handler. Routing is
 * data-driven: pass the generated route table and the `operationId -> handler`
 * map; nothing here is spec-specific.
 */
export function createOpenApiRouter<Operations>(
    routes: readonly Route<Operations>[],
    handlers: OperationHandlers<Operations>
): Router {
    const router = express.Router()
    for (const route of routes) {
        const handle = handlers[route.operationId] as UntypedHandler
        const requestHandler: RequestHandler = (req, res, next) => {
            Promise.resolve()
                .then(() =>
                    handle({
                        params: req.params as Record<string, string>,
                        query: req.query as Record<string, unknown>,
                        body: req.body,
                        req,
                    })
                )
                .then((result) => {
                    if (result === null || result === undefined) {
                        res.status(404).json({
                            error: String(route.operationId) + ': not found',
                        })
                    } else {
                        res.status(200).json(result)
                    }
                })
                .catch(next)
        }
        switch (route.method) {
            case 'get':
                router.get(route.path, requestHandler)
                break
            case 'post':
                router.post(route.path, requestHandler)
                break
            case 'put':
                router.put(route.path, requestHandler)
                break
            case 'delete':
                router.delete(route.path, requestHandler)
                break
            case 'patch':
                router.patch(route.path, requestHandler)
                break
        }
    }
    return router
}
