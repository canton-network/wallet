// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DsrvSigningApiClient } from './signing-api-client.js'

describe('DsrvSigningApiClient', () => {
    let fetchMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
        fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    const okResponse = (body: unknown) =>
        new Response(JSON.stringify(body), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })

    it('strips a trailing slash from the base URL', () => {
        const client = new DsrvSigningApiClient(
            'http://signing.example/',
            'gw-token'
        )
        expect(client.getConfiguration()).toEqual({
            baseUrl: 'http://signing.example',
            bearerToken: '***HIDDEN***',
        })
    })

    it.each([
        ['createKey', (c: DsrvSigningApiClient) => c.createKey({ name: 'k' })],
        ['getKeys', (c: DsrvSigningApiClient) => c.getKeys()],
        [
            'signTransaction',
            (c: DsrvSigningApiClient) =>
                c.signTransaction({
                    tx: 'tx',
                    txHash: 'hash',
                    keyIdentifier: { publicKey: 'pk' },
                }),
        ],
        [
            'getTransaction',
            (c: DsrvSigningApiClient) => c.getTransaction({ txId: 'tx-1' }),
        ],
        [
            'getTransactions',
            (c: DsrvSigningApiClient) => c.getTransactions({ txIds: ['tx-1'] }),
        ],
    ] as const)(
        '%s posts JSON to /api/signing/%s with the bearer token',
        async (operation, call) => {
            fetchMock.mockResolvedValue(okResponse({}))

            await call(
                new DsrvSigningApiClient('http://signing.example', 'gw-token')
            )

            const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
            expect(url).toBe(`http://signing.example/api/signing/${operation}`)
            expect(init.method).toBe('POST')
            expect(init.headers).toEqual({
                'Content-Type': 'application/json',
                Authorization: 'Bearer gw-token',
            })
        }
    )

    it('never shows the bearer token in its configuration', () => {
        const client = new DsrvSigningApiClient(
            'http://signing.example',
            'gw-token'
        )

        expect(client.getConfiguration()).toEqual({
            baseUrl: 'http://signing.example',
            bearerToken: '***HIDDEN***',
        })
        expect(JSON.stringify(client.getConfiguration())).not.toContain(
            'gw-token'
        )
    })

    it('setConfiguration replaces the bearer token and ignores an empty one', async () => {
        fetchMock.mockImplementation(async () => okResponse({ keys: [] }))
        const client = new DsrvSigningApiClient(
            'http://signing.example',
            'gw-token'
        )

        expect(client.setConfiguration({ bearerToken: 'new-token' })).toEqual({
            baseUrl: 'http://signing.example',
            bearerToken: '***HIDDEN***',
        })
        await client.getKeys()
        expect(
            (fetchMock.mock.calls[0] as [string, RequestInit])[1].headers
        ).toMatchObject({ Authorization: 'Bearer new-token' })

        expect(client.setConfiguration({ bearerToken: '' })).toEqual({
            baseUrl: 'http://signing.example',
            bearerToken: '***HIDDEN***',
        })
        await client.getKeys()
        expect(
            (fetchMock.mock.calls[1] as [string, RequestInit])[1].headers
        ).toMatchObject({ Authorization: 'Bearer new-token' })
    })

    it('reports a rejected token like any other failed call', async () => {
        fetchMock.mockResolvedValue(
            new Response('invalid token', {
                status: 401,
                statusText: 'Unauthorized',
            })
        )

        const client = new DsrvSigningApiClient(
            'http://signing.example',
            'wrong-token'
        )

        const error = (await client.getKeys().catch((e: unknown) => e)) as Error
        expect(error.message).toBe(
            'DSRV signing API getKeys failed (401): invalid token'
        )
    })

    it('returns the response body, including a refusal answered with HTTP 200', async () => {
        const refusal = { error: 'not_found', error_description: 'unknown' }
        fetchMock.mockResolvedValue(okResponse(refusal))

        const client = new DsrvSigningApiClient(
            'http://signing.example',
            'gw-token'
        )

        await expect(client.getTransaction({ txId: 'tx-1' })).resolves.toEqual(
            refusal
        )
    })

    it('throws with the status and the response body for other statuses', async () => {
        fetchMock.mockResolvedValue(
            new Response('{"error":{"code":"x","message":"down"}}', {
                status: 503,
            })
        )

        const client = new DsrvSigningApiClient(
            'http://signing.example',
            'gw-token'
        )

        await expect(client.getKeys()).rejects.toThrow(
            'DSRV signing API getKeys failed (503): {"error":{"code":"x","message":"down"}}'
        )
    })

    it('cuts long error bodies', async () => {
        fetchMock.mockResolvedValue(
            new Response('x'.repeat(1000), { status: 500 })
        )

        const client = new DsrvSigningApiClient(
            'http://signing.example',
            'gw-token'
        )

        await expect(client.getKeys()).rejects.toThrow(
            `DSRV signing API getKeys failed (500): ${'x'.repeat(300)}`
        )
    })

    it('falls back to the status text when the error body is empty', async () => {
        fetchMock.mockResolvedValue(
            new Response('', {
                status: 500,
                statusText: 'Internal Server Error',
            })
        )

        const client = new DsrvSigningApiClient(
            'http://signing.example',
            'gw-token'
        )

        await expect(client.getKeys()).rejects.toThrow(
            'DSRV signing API getKeys failed (500): Internal Server Error'
        )
    })

    it('setConfiguration keeps the base URL when none is given', () => {
        const client = new DsrvSigningApiClient(
            'http://signing.example',
            'gw-token'
        )

        expect(client.setConfiguration({})).toEqual({
            baseUrl: 'http://signing.example',
            bearerToken: '***HIDDEN***',
        })
        expect(
            client.setConfiguration({ baseUrl: 'http://other.example/' })
        ).toEqual({
            baseUrl: 'http://other.example',
            bearerToken: '***HIDDEN***',
        })
    })
})
