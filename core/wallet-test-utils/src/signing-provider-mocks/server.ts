// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as http from 'node:http'

export interface MockHttpRequest {
    headers: http.IncomingHttpHeaders
    method: string
    path: string
    query: URLSearchParams
}

export interface MockHttpResponse {
    status?: number
    headers?: Record<string, string>
    body?: unknown
}

export interface SigningProviderMockContext {
    request: MockHttpRequest
    body: unknown
}

export type SigningProviderMockHandler = (
    context: SigningProviderMockContext
) => Promise<MockHttpResponse> | MockHttpResponse

export type MockHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface SigningProviderMockRoute {
    method: MockHttpMethod
    path: string
    handler: SigningProviderMockHandler
}

export interface SigningProviderMockModule {
    pathPrefix: string
    routes: SigningProviderMockRoute[]
}

export interface SigningProviderMockServerOptions {
    host: string
    port: number
    providers: SigningProviderMockModule[]
    logger?: (message: string) => void // TODO maybe required?
}

export interface SigningProviderMockServer {
    readonly host: string
    readonly port: number
    readonly baseUrl: string
    close(): Promise<void>
}

function readRawBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = []
        req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
        req.on('end', () => {
            resolve(Buffer.concat(chunks).toString('utf8').trim())
        })
        req.on('error', reject)
    })
}

async function parseRequestBody(req: http.IncomingMessage): Promise<unknown> {
    const method = (req.method ?? 'GET').toUpperCase()
    const methodsWithBody = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
    if (!methodsWithBody.has(method)) {
        return {}
    }

    const rawBody = await readRawBody(req)
    if (!rawBody) {
        return {}
    }

    return JSON.parse(rawBody) as unknown
}

function toRouteMap(
    providers: SigningProviderMockModule[]
): Map<string, SigningProviderMockHandler> {
    const routeMap = new Map<string, SigningProviderMockHandler>()

    for (const provider of providers) {
        const normalizedPrefix = provider.pathPrefix.replace(/\/+$/, '')
        for (const route of provider.routes) {
            const normalizedPath = route.path.startsWith('/')
                ? route.path
                : `/${route.path}`
            const fullPath = `${normalizedPrefix}${normalizedPath}`
            const routeKey = `${route.method.toUpperCase()} ${fullPath}`

            if (routeMap.has(routeKey)) {
                throw new Error(`Duplicate mock route declared: ${routeKey}`)
            }
            routeMap.set(routeKey, route.handler)
        }
    }

    return routeMap
}

function sendJson(res: http.ServerResponse, response: MockHttpResponse): void {
    const status = response.status ?? 200
    const headers = {
        'Content-Type': 'application/json',
        ...(response.headers ?? {}),
    }
    res.writeHead(status, headers)
    if (response.body === undefined) {
        res.end('{}')
        return
    }
    res.end(JSON.stringify(response.body))
}

export async function startSigningProviderMockServer(
    options: SigningProviderMockServerOptions
): Promise<SigningProviderMockServer> {
    const host = options.host
    const requestedPort = options.port
    const logger = options.logger ?? ((message: string) => console.log(message)) // TODO Maybe let's use pino from outside, and as this will be required, no default console.log?
    const routeMap = toRouteMap(options.providers)

    const server = http.createServer(async (req, res) => {
        const method = req.method ?? 'GET'
        const incomingUrl = new URL(req.url ?? '/', `http://${host}`)
        const routeKey = `${method.toUpperCase()} ${incomingUrl.pathname}`
        const route = routeMap.get(routeKey)

        logger(`[signing-mocks] -> ${routeKey}`)

        if (!route) {
            sendJson(res, {
                status: 404,
                body: {
                    error: 'route_not_found',
                    error_description: `No mock route registered for ${routeKey}`,
                },
            })
            logger(`[signing-mocks] <- ${routeKey} 404 route_not_found`)
            return
        }

        let body: unknown
        try {
            body = await parseRequestBody(req)
        } catch (error) {
            sendJson(res, {
                status: 400,
                body: {
                    error: 'invalid_json',
                    error_description:
                        error instanceof Error ? error.message : String(error),
                },
            })
            logger(`[signing-mocks] <- ${routeKey} 400 invalid_json`)
            return
        }

        try {
            const response = await route({
                request: {
                    headers: req.headers,
                    method,
                    path: incomingUrl.pathname,
                    query: incomingUrl.searchParams,
                },
                body,
            })
            sendJson(res, response)
            logger(`[signing-mocks] <- ${routeKey} ${response.status ?? 200}`)
        } catch (error) {
            sendJson(res, {
                status: 500,
                body: {
                    error: 'mock_handler_error',
                    error_description:
                        error instanceof Error ? error.message : String(error),
                },
            })
            logger(`[signing-mocks] <- ${routeKey} 500 mock_handler_error`)
        }
    })

    await new Promise<void>((resolve, reject) => {
        server.once('error', reject)
        server.listen(requestedPort, host, () => resolve())
    })

    return {
        host,
        port: requestedPort,
        baseUrl: `http://${host}:${requestedPort}`,
        close: async () => {
            await new Promise<void>((resolve, reject) => {
                server.close((error) => (error ? reject(error) : resolve()))
            })
        },
    }
}
