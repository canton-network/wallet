// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

function isScanLocalhostUrl(targetUrl: string): boolean {
    return new URL(targetUrl).hostname === 'scan.localhost'
}

function isNodeRuntime(): boolean {
    return (
        typeof process !== 'undefined' &&
        typeof process.versions?.node === 'string'
    )
}

function resolveUrl(input: RequestInfo | URL): string {
    if (typeof input === 'string') {
        return input
    }
    if (input instanceof URL) {
        return input.href
    }
    return input.url
}

function headersToRecord(
    headers?: RequestInit['headers']
): Record<string, string> {
    if (!headers) {
        return {}
    }

    if (Array.isArray(headers)) {
        return Object.fromEntries(headers)
    }

    if (headers instanceof Headers) {
        return Object.fromEntries(headers.entries())
    }

    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(headers)) {
        result[key] = Array.isArray(value) ? value.join(', ') : String(value)
    }
    return result
}

async function readRequestBody(
    body: RequestInit['body']
): Promise<string | Uint8Array | undefined> {
    if (body === null || body === undefined) {
        return undefined
    }

    if (typeof body === 'string') {
        return body
    }

    if (body instanceof Uint8Array) {
        return body
    }

    return new Uint8Array(await new Response(body).arrayBuffer())
}

function mergeRequestInit(
    input: RequestInfo | URL,
    init?: RequestInit
): RequestInit {
    if (!(input instanceof Request)) {
        return init ?? {}
    }

    const requestHeaders = headersToRecord(input.headers)
    const initHeaders = headersToRecord(init?.headers)

    return {
        method: init?.method ?? input.method,
        headers: { ...requestHeaders, ...initHeaders },
        body: init?.body ?? input.body,
        signal: init?.signal ?? input.signal,
        redirect: init?.redirect ?? input.redirect,
        credentials: init?.credentials ?? input.credentials,
        cache: init?.cache ?? input.cache,
        integrity: init?.integrity ?? input.integrity,
        keepalive: init?.keepalive ?? input.keepalive,
        mode: init?.mode ?? input.mode,
        referrer: init?.referrer ?? input.referrer,
        referrerPolicy: init?.referrerPolicy ?? input.referrerPolicy,
    }
}

/**
 * Node-only transport for `scan.localhost`.
 *
 * Flow:
 * 1. Parse the target URL (scheme, port, path, query).
 * 2. Open `node:http(s)` to `127.0.0.1` on that port (avoids IPv6 `::1`).
 * 3. Set `Host` to the original host so localnet nginx matches the vhost.
 * 4. Stream the response body into a Fetch `Response`.
 */
async function fetchViaNodeHttp(
    targetUrl: string,
    init?: RequestInit
): Promise<Response> {
    const [{ default: http }, { default: https }] = await Promise.all([
        import('node:http'),
        import('node:https'),
    ])

    const parsed = new URL(targetUrl)
    const isHttps = parsed.protocol === 'https:'
    const transport = isHttps ? https : http
    const port = parsed.port ? Number(parsed.port) : isHttps ? 443 : 80

    const headers = headersToRecord(init?.headers)
    headers.Host = parsed.host

    const requestBody = await readRequestBody(init?.body)

    return new Promise((resolve, reject) => {
        const req = transport.request(
            {
                hostname: '127.0.0.1',
                port,
                path: `${parsed.pathname}${parsed.search}`,
                method: init?.method ?? 'GET',
                headers,
            },
            (res: import('node:http').IncomingMessage) => {
                const chunks: Uint8Array[] = []
                res.on('data', (chunk: Uint8Array) => chunks.push(chunk))
                res.on('end', () => {
                    const totalLength = chunks.reduce(
                        (sum, chunk) => sum + chunk.length,
                        0
                    )
                    const body = new Uint8Array(totalLength)
                    let offset = 0
                    for (const chunk of chunks) {
                        body.set(chunk, offset)
                        offset += chunk.length
                    }

                    resolve(
                        new Response(body, {
                            status: res.statusCode ?? 500,
                            headers: res.headers as Record<string, string>,
                        })
                    )
                })
            }
        )

        const signal = init?.signal
        if (signal) {
            if (signal.aborted) {
                req.destroy()
                reject(signal.reason ?? new Error('The operation was aborted'))
                return
            }

            signal.addEventListener(
                'abort',
                () => {
                    req.destroy()
                    reject(
                        signal.reason ?? new Error('The operation was aborted')
                    )
                },
                { once: true }
            )
        }

        req.on('error', reject)
        if (requestBody !== undefined) {
            req.write(requestBody)
        }
        req.end()
    })
}

/**
 * Fetch helper for Scan API URLs.
 *
 * Node's fetch resolves `scan.localhost` to IPv6 (`::1`) and forbids setting a
 * custom `Host` header. Localnet nginx routes on the `scan.localhost` vhost, so
 * in Node we dial `127.0.0.1` via `node:http` while preserving that Host header.
 * Browsers already treat `*.localhost` as loopback, so they use global fetch.
 */
export function fetchScanApiUrl(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<Response> {
    const targetUrl = resolveUrl(input)

    if (isScanLocalhostUrl(targetUrl) && isNodeRuntime()) {
        return fetchViaNodeHttp(targetUrl, mergeRequestInit(input, init))
    }

    return fetch(input, init)
}
