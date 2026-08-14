// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/*
  Turns the gateway traffic captured during e2e runs into a rate limit report.

  Usage:
    pnpm script:rate-limit-report <dir-with-captures> [limit]

  The gateway applies two independent limits and the report answers a different
  question for each. Authenticated traffic is limited per user, so what matters
  there is the busiest single minute of a single user. Traffic sent before login
  is limited per IP address, so what matters is what one client spends to
  connect, which then has to be multiplied by however many users are expected to
  share an address.

  Output is a fixed set of rows printed to stdout, plus the same figures as JSON
  next to the captures so that two runs can be compared over time.
*/

import fs from 'fs'
import path from 'path'

/**
 * Shape of one captured request, produced by `withGatewayCapture` in
 * core-wallet-test-utils.
 *
 * Declared here rather than imported so that generating a report never loads
 * Playwright or the test utilities: the report should be runnable wherever the
 * capture files are, including from CI artifacts on a machine with nothing else
 * set up. The contract between the two is the JSON on disk, not the type.
 */
interface GatewayRequestRecord {
    timestamp: number
    user: string | null
    method: string | null
    path: string
    status?: number | null
}

const WINDOW_MS = 60_000

type Capture = {
    test: string
    project: string
    records: GatewayRequestRecord[]
}

/**
 * Busiest 60 seconds of a series of records, measured with a sliding window.
 *
 * The gateway's own window is fixed rather than sliding, but it starts whenever
 * the client happens to send its first request rather than on a clock boundary,
 * so where those boundaries fall is not predictable. A limit set above the
 * sliding maximum holds no matter where they land; one derived from a
 * fixed-window count can be exceeded by the same traffic arriving a few seconds
 * earlier.
 */
function busiestWindow(
    records: GatewayRequestRecord[]
): GatewayRequestRecord[] {
    const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp)
    let busiest: GatewayRequestRecord[] = []
    let windowStart = 0

    for (let current = 0; current < sorted.length; current++) {
        while (
            sorted[current].timestamp - sorted[windowStart].timestamp >
            WINDOW_MS
        ) {
            windowStart++
        }
        const size = current - windowStart + 1
        if (size > busiest.length) {
            busiest = sorted.slice(windowStart, current + 1)
        }
    }

    return busiest
}

function loadCaptures(dir: string): Capture[] {
    return fs
        .readdirSync(dir)
        .filter((file) => file.endsWith('.json') && file !== 'report.json')
        .map((file) =>
            JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
        )
}

function analyse(captures: Capture[], limit: number) {
    const records = captures.flatMap((capture) => capture.records)

    // Grouped per test and per user, not per user alone. Tests run back to back
    // reusing the same identity, so merging them into one timeline puts requests
    // from separate sessions inside the same 60 second window and reports a peak
    // no single session ever produced. This holds because the e2e projects run
    // serially; were they ever made parallel, sessions sharing an identity would
    // genuinely share one bucket and would have to be merged instead.
    const sessions: {
        test: string
        user: string
        records: GatewayRequestRecord[]
    }[] = []
    for (const capture of captures) {
        const byUser = new Map<string, GatewayRequestRecord[]>()
        for (const record of capture.records) {
            if (record.user === null) continue
            const list = byUser.get(record.user) ?? []
            list.push(record)
            byUser.set(record.user, list)
        }
        for (const [user, userRecords] of byUser) {
            sessions.push({ test: capture.test, user, records: userRecords })
        }
    }

    // One row per user, holding that user's worst session, because the limit is
    // enforced per user and has to cover the worst minute any of them reached.
    const worstByUser = new Map<
        string,
        { test: string; window: GatewayRequestRecord[] }
    >()
    for (const session of sessions) {
        const window = busiestWindow(session.records)
        const current = worstByUser.get(session.user)
        if (!current || window.length > current.window.length) {
            worstByUser.set(session.user, { test: session.test, window })
        }
    }

    const perUser = [...worstByUser.entries()]
        .map(([user, { test, window }]) => {
            const counts: Record<string, number> = {}
            for (const record of window) {
                const label = record.method ?? `(${path.basename(record.path)})`
                counts[label] = (counts[label] || 0) + 1
            }
            const calls = Object.entries(counts).sort(([, a], [, b]) => b - a)

            return {
                user,
                busiestMinute: window.length,
                during: test,
                topCall: calls[0]?.[0] ?? '',
                topCallShare: calls[0]
                    ? Math.round((calls[0][1] / window.length) * 100)
                    : 0,
                calls,
            }
        })
        .sort((a, b) => b.busiestMinute - a.busiestMinute)

    // One connect flow, not the sum over the run: the total only reflects how
    // many sessions the tests happened to open.
    const requestsToConnect = Math.max(
        0,
        ...captures.map(
            (capture) =>
                capture.records.filter((record) => record.user === null).length
        )
    )

    return {
        limitEvaluated: limit,
        tests: captures.length,
        totalRequests: records.length,
        rejectedWith429: records.filter((record) => record.status === 429)
            .length,
        requestsToConnectOneUser: requestsToConnect,
        usersMeasured: worstByUser.size,
        perUser,
    }
}

/** Lay a label and its value out as one row. */
function row(label: string, value: string | number): string {
    return `${label.padEnd(34)}${value}`
}

/**
 * Render a table, sizing each column to its widest cell so that the header and
 * the rows cannot drift apart.
 */
function table(headers: string[], rows: (string | number)[][]): string[] {
    const widths = headers.map((header, column) =>
        Math.max(
            header.length,
            ...rows.map((cells) => String(cells[column]).length)
        )
    )
    const line = (cells: (string | number)[]) =>
        cells
            .map((cell, column) => String(cell).padEnd(widths[column] + 2))
            .join('')
            .trimEnd()

    return [line(headers), ...rows.map(line)]
}

function render(analysis: ReturnType<typeof analyse>): string {
    // Sorted by busiest minute, so the first user is the one the limit has to
    // cover.
    const busiestUser = analysis.perUser[0]
    const lines: string[] = []

    lines.push(`RATE LIMIT REPORT   ${analysis.tests} tests`)
    lines.push('')
    lines.push(row('limit evaluated', analysis.limitEvaluated))
    lines.push(row('requests rejected (429)', analysis.rejectedWith429))
    lines.push(row('busiest minute, one user', busiestUser?.busiestMinute ?? 0))
    lines.push(row('requests before login', analysis.requestsToConnectOneUser))
    lines.push(row('users measured', analysis.usersMeasured))
    lines.push(row('total requests', analysis.totalRequests))

    lines.push('')
    lines.push('PER USER')
    lines.push(
        ...table(
            ['user', 'busiest minute', 'top call', 'share'],
            analysis.perUser.map((user) => [
                user.user,
                user.busiestMinute,
                user.topCall,
                `${user.topCallShare}%`,
            ])
        )
    )

    if (busiestUser) {
        lines.push('')
        lines.push(
            `CALLS IN BUSIEST MINUTE   ${busiestUser.user}   ${busiestUser.during}`
        )
        lines.push(
            ...table(
                ['call', 'requests', 'share'],
                busiestUser.calls.map(([call, requests]) => [
                    call,
                    requests,
                    `${Math.round((requests / busiestUser.busiestMinute) * 100)}%`,
                ])
            )
        )
    }

    return lines.join('\n')
}

const capturesDir = process.argv[2]
if (!capturesDir) {
    console.error('usage: rate-limit-report <dir-with-captures> [limit]')
    process.exit(1)
}

const analysis = analyse(
    loadCaptures(capturesDir),
    Number(process.argv[3] ?? 200)
)

console.log(render(analysis))

// Written alongside the captures so runs can be diffed for regressions. The
// printed rows are what a person reads; this is what a machine compares.
const reportPath = path.join(capturesDir, 'report.json')
fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2))
console.log(`\nJSON: ${reportPath}`)
