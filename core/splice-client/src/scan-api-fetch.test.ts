// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchScanApiUrl } from './scan-api-fetch.js'

const isNode =
    typeof process !== 'undefined' && typeof process.versions?.node === 'string'

describe('fetchScanApiUrl', () => {
    let fetchMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
        fetchMock = vi.fn().mockResolvedValue(new Response('ok'))
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('uses global fetch for non-scan.localhost URLs', async () => {
        await fetchScanApiUrl('https://scan.example/api/scan/v0/dso', {
            method: 'GET',
        })

        expect(fetchMock).toHaveBeenCalledOnce()
        expect(fetchMock.mock.calls[0]?.[0]).toBe(
            'https://scan.example/api/scan/v0/dso'
        )
    })

    describe.runIf(isNode)('scan.localhost Node bypass', () => {
        it('dials 127.0.0.1 with Host scan.localhost', async () => {
            const http = await import('node:http')

            let seenHost: string | undefined
            let seenUrl: string | undefined

            const server = http.createServer((req, res) => {
                seenHost = req.headers.host
                seenUrl = req.url
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ ok: true }))
            })

            await new Promise<void>((resolve) => {
                server.listen(0, '127.0.0.1', () => resolve())
            })

            const address = server.address()
            if (address === null || typeof address === 'string') {
                server.close()
                throw new Error('Expected TCP server address')
            }

            try {
                const response = await fetchScanApiUrl(
                    `http://scan.localhost:${address.port}/api/scan/v0/dso`,
                    { method: 'GET', headers: { Accept: 'application/json' } }
                )

                expect(fetchMock).not.toHaveBeenCalled()
                expect(response.status).toBe(200)
                expect(await response.json()).toEqual({ ok: true })
                expect(seenHost).toBe(`scan.localhost:${address.port}`)
                expect(seenUrl).toBe('/api/scan/v0/dso')
            } finally {
                await new Promise<void>((resolve, reject) => {
                    server.close((err) => (err ? reject(err) : resolve()))
                })
            }
        })
    })
})
