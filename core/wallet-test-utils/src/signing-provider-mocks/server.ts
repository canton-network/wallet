// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as http from 'node:http'

export interface MockHttpResponse {
    status?: number
    body?: unknown
}

export interface SigningProviderMockContext {
    pathParams: Record<string, string>
    query: URLSearchParams
    body: unknown
}

export type SigningProviderMockHandler = (
    context: SigningProviderMockContext
) => Promise<MockHttpResponse> | MockHttpResponse

export type MockHttpMethod = 'GET' | 'POST'

export interface SigningProviderMockRoute {
    method: MockHttpMethod
    path: string
    handler: SigningProviderMockHandler
}

interface CompiledSigningProviderRoute {
    method: string
    matcher: RegExp
    paramNames: string[]
    handler: SigningProviderMockHandler
}

export interface SigningProviderMockServerOptions {
    host: string
    port: number
    routes: SigningProviderMockRoute[]
    logger?: (message: string) => void
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
    if ((req.method ?? 'GET').toUpperCase() !== 'POST') {
        return {}
    }

    const rawBody = await readRawBody(req)
    if (!rawBody) {
        return {}
    }

    return JSON.parse(rawBody) as unknown
}

function compilePathPattern(path: string): {
    matcher: RegExp
    paramNames: string[]
} {
    const normalized = path.startsWith('/') ? path : `/${path}`
    const segments = normalized
        .split('/')
        .filter((segment) => segment.length > 0)
        .map((segment) => {
            if (segment.startsWith(':')) {
                return { pattern: '([^/]+)', name: segment.slice(1) }
            }
            return {
                pattern: segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                name: undefined,
            }
        })

    const paramNames = segments
        .map((segment) => segment.name)
        .filter((name): name is string => Boolean(name))
    const matcher =
        segments.length === 0
            ? /^\/$/
            : new RegExp(
                  `^/${segments.map((segment) => segment.pattern).join('/')}$`
              )

    return { matcher, paramNames }
}

function compileRoutes(
    routes: SigningProviderMockRoute[]
): CompiledSigningProviderRoute[] {
    const compiled: CompiledSigningProviderRoute[] = []
    const routeKeys = new Set<string>()

    for (const route of routes) {
        const normalizedPath = route.path.startsWith('/')
            ? route.path
            : `/${route.path}`
        const routeKey = `${route.method.toUpperCase()} ${normalizedPath}`

        if (routeKeys.has(routeKey)) {
            throw new Error(`Duplicate mock route declared: ${routeKey}`)
        }
        routeKeys.add(routeKey)

        const { matcher, paramNames } = compilePathPattern(normalizedPath)
        compiled.push({
            method: route.method.toUpperCase(),
            matcher,
            paramNames,
            handler: route.handler,
        })
    }

    return compiled
}

function findRoute(
    routes: CompiledSigningProviderRoute[],
    method: string,
    path: string
): {
    route: CompiledSigningProviderRoute
    pathParams: Record<string, string>
} | null {
    for (const route of routes) {
        if (route.method !== method.toUpperCase()) {
            continue
        }
        const match = route.matcher.exec(path)
        if (!match) {
            continue
        }

        const pathParams = Object.fromEntries(
            route.paramNames.map((name, index) => [
                name,
                decodeURIComponent(match[index + 1] ?? ''),
            ])
        )

        return { route, pathParams }
    }

    return null
}

function sendJson(res: http.ServerResponse, response: MockHttpResponse): void {
    const status = response.status ?? 200
    res.writeHead(status, { 'Content-Type': 'application/json' })
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
    const logger = options.logger ?? ((message: string) => console.log(message))
    const routes = compileRoutes(options.routes)

    const server = http.createServer(async (req, res) => {
        const method = req.method ?? 'GET'
        const incomingUrl = new URL(req.url ?? '/', `http://${host}`)
        const routeKey = `${method.toUpperCase()} ${incomingUrl.pathname}`
        const matchedRoute = findRoute(
            routes,
            method.toUpperCase(),
            incomingUrl.pathname
        )

        logger(`[signing-mocks] -> ${routeKey}`)

        if (!matchedRoute) {
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
            const response = await matchedRoute.route.handler({
                pathParams: matchedRoute.pathParams,
                query: incomingUrl.searchParams,
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
