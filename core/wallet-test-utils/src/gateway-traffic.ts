// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test as base } from '@playwright/test'
import type { Page, Request, TestInfo, TestType } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/** One request the browser sent to the wallet gateway. */
export interface GatewayRequestRecord {
    /** Epoch milliseconds, so per-minute windows can be computed after the run. */
    timestamp: number
    /** `sub` of the bearer token, the key the gateway rate limits on. Null before login. */
    user: string | null
    /** JSON-RPC method from the body. Null when the request is not a JSON-RPC POST. */
    method: string | null
    path: string
    /** Null until the response arrives. A 429 means the run was capped by the limiter. */
    status: number | null
}

/**
 * Requests are matched by port and not only by path: LocalNet serves a Splice
 * validator under `/api/` too, on another port, and that traffic is not rate
 * limited by the gateway.
 */
const DEFAULT_GATEWAY_PORT = '3030'

/** A session repeats one token across every request, so decoding is cached. */
const subjectCache = new Map<string, string | null>()

/**
 * Read the `sub` claim of a bearer token, unverified. Verifying is the
 * gateway's job; here we only need the identifier it groups by. The token
 * itself is never stored, since these records reach public CI artifacts.
 */
function subjectOf(authorizationHeader: string | undefined): string | null {
    if (!authorizationHeader?.startsWith('Bearer ')) return null

    const token = authorizationHeader.slice('Bearer '.length)
    if (subjectCache.has(token)) return subjectCache.get(token) ?? null

    let subject: string | null = null
    try {
        const payload = token.split('.')[1]
        if (payload) {
            const claims = JSON.parse(
                Buffer.from(payload, 'base64url').toString('utf8')
            )
            subject = typeof claims.sub === 'string' ? claims.sub : null
        }
    } catch {
        subject = null
    }

    subjectCache.set(token, subject)
    return subject
}

/**
 * Read the JSON-RPC method from a request body. Each API is a single path, so
 * the body is the only place that says which call was made.
 */
function methodOf(request: Request): string | null {
    if (request.method() !== 'POST') return null

    try {
        const body = request.postData()
        if (!body) return null
        const parsed = JSON.parse(body)
        return typeof parsed?.method === 'string' ? parsed.method : null
    } catch {
        return null
    }
}

/**
 * Record every gateway request a page makes.
 *
 * Every e2e test in the repository runs this, so an error here would break
 * tests that have nothing to do with measuring traffic. Errors are swallowed on
 * purpose: a token that cannot be decoded is recorded with no user, and a
 * request that throws is not recorded at all.
 */
function setupGatewayTrafficCapture(
    page: Page,
    records: GatewayRequestRecord[],
    gatewayPort: string
): void {
    // Playwright passes the same Request object to both events, which is how
    // the response is matched back to its record.
    const pending = new Map<Request, GatewayRequestRecord>()

    page.on('request', (request: Request) => {
        try {
            const { pathname, port } = new URL(request.url())
            if (port !== gatewayPort || !pathname.startsWith('/api/')) return

            const record: GatewayRequestRecord = {
                timestamp: Date.now(),
                user: subjectOf(request.headers()['authorization']),
                method: methodOf(request),
                path: pathname,
                status: null,
            }
            records.push(record)
            pending.set(request, record)
        } catch {
            // Never let instrumentation break the test it is observing.
        }
    })

    page.on('response', (response) => {
        try {
            const record = pending.get(response.request())
            if (!record) return
            record.status = response.status()
            pending.delete(response.request())
        } catch {
            // As above: a missing status beats a failed test.
        }
    })
}

/**
 * Write the capture to the test output directory and attach it to the report.
 *
 * Saved on every outcome, unlike the console and network logs, which are kept
 * only on failure: the measurement is about runs that pass, since a failing run
 * stops early and its counts say nothing about normal usage.
 */
async function saveGatewayTraffic(
    testInfo: TestInfo,
    records: GatewayRequestRecord[]
): Promise<void> {
    if (records.length === 0) return

    const dir = path.join(testInfo.project.outputDir, 'gateway-traffic')
    const name = `${testInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    const file = path.join(dir, name)

    try {
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(
            file,
            JSON.stringify(
                {
                    test: testInfo.title,
                    project: testInfo.project.name,
                    records,
                },
                null,
                2
            )
        )
        await testInfo.attach('gateway-traffic', {
            path: file,
            contentType: 'application/json',
        })
    } catch (error) {
        console.error(
            'Failed to save gateway traffic:',
            (error as Error).message
        )
    }
}

/**
 * Add gateway traffic capture to any Playwright `test`.
 *
 * A wrapper instead of a single fixed fixture, because the dApps start from
 * different bases: ping uses the `test` from `fixtures.ts`, which also brings
 * console tracking and failure screenshots, while portfolio uses plain
 * Playwright. Both need the capture and only one wants the rest.
 *
 * Popups are covered too, since the wallet connect flow runs in one and its
 * requests count against the same limits.
 */
export function withGatewayCapture<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends TestType<any, any>,
>(test: T, gatewayPort: string = DEFAULT_GATEWAY_PORT): T {
    return test.extend({
        page: async (
            { page }: { page: Page },
            use: (page: Page) => Promise<void>,
            testInfo: TestInfo
        ) => {
            const records: GatewayRequestRecord[] = []

            setupGatewayTrafficCapture(page, records, gatewayPort)
            page.on('popup', (popup: Page) =>
                setupGatewayTrafficCapture(popup, records, gatewayPort)
            )

            await use(page)

            await saveGatewayTraffic(testInfo, records)
        },
    }) as T
}

/**
 * Plain Playwright `test` plus the capture, for dApps that still need to be
 * measured but were not written against the fixture in `fixtures.ts` and would
 * change behaviour if they inherited it.
 */
export const testWithGatewayCapture = withGatewayCapture(base)
