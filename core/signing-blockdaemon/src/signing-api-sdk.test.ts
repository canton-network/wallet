// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SigningAPIClient } from './signing-api-sdk.js'

describe('SigningAPIClient', () => {
    let fetchMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
        fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    function assertRequestAndGetInit(endpoint: string) {
        const call = fetchMock.mock.calls.find((c) =>
            String(c[0]).endsWith(endpoint)
        )
        expect(call).toBeDefined()
        return call![1] as RequestInit
    }

    it('constructor strips a trailing slash from the base URL', () => {
        const client = new SigningAPIClient('http://api.example/')
        expect(client.getConfiguration().BaseURL).toBe('http://api.example')
    })

    it('omits Authorization header when no API key is configured', async () => {
        const client = new SigningAPIClient('http://api.example')
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify([]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        )

        await client.getKeys()

        const init = assertRequestAndGetInit('/getKeys')
        expect(init.headers).not.toHaveProperty('Authorization')
    })

    it('sends Authorization header when an API key is configured', async () => {
        const client = new SigningAPIClient('http://api.example')
        client.setConfiguration({ ApiKey: 'secret-key' })
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify([]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        )

        await client.getKeys()

        const init = assertRequestAndGetInit('/getKeys')
        expect(init.headers).toMatchObject({
            Authorization: 'Bearer secret-key',
        })
    })

    it('signTransaction posts to the signing endpoint', async () => {
        const client = new SigningAPIClient('http://api.example')
        const tx = { txId: 'tx-1', status: 'signed' }
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify(tx), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        )

        const result = await client.signTransaction({
            tx: 'bytes',
            txHash: 'hash',
            keyIdentifier: { publicKey: 'pk' },
        })

        expect(result).toEqual(tx)
        assertRequestAndGetInit('/signTransaction')
    })

    it('getTransaction posts to the getTransaction endpoint', async () => {
        const client = new SigningAPIClient('http://api.example')
        const tx = { txId: 'tx-1', status: 'pending' }
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify(tx), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        )

        const result = await client.getTransaction({ txId: 'tx-1' })

        expect(result).toEqual(tx)
        assertRequestAndGetInit('/getTransaction')
    })

    it('getTransactions posts with filter params', async () => {
        const client = new SigningAPIClient('http://api.example')
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify([{ txId: 'tx-1', status: 'signed' }]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        )

        const result = await client.getTransactions({
            txIds: ['tx-1'],
            publicKeys: ['pk-1'],
        })

        expect(result).toHaveLength(1)
        assertRequestAndGetInit('/getTransactions')
    })

    it('createKey posts to the createKey endpoint', async () => {
        const client = new SigningAPIClient('http://api.example')
        const key = { id: 'k-1', name: 'key', publicKey: 'pk' }
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify(key), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        )

        const result = await client.createKey({ name: 'key' })

        expect(result).toEqual(key)
        assertRequestAndGetInit('/createKey')
    })

    it('post returns an empty object for 204 responses', async () => {
        const client = new SigningAPIClient('http://api.example')
        fetchMock.mockResolvedValue(
            new Response(null, {
                status: 204,
                headers: { 'content-length': '0' },
            })
        )

        const result = await client.getKeys()

        expect(result).toEqual({})
    })

    it('post returns an empty object when content-length is zero', async () => {
        const client = new SigningAPIClient('http://api.example')
        fetchMock.mockResolvedValue(
            new Response('', {
                status: 200,
                headers: { 'content-length': '0' },
            })
        )

        const result = await client.getKeys()

        expect(result).toEqual({})
    })

    it('throws with the response body when the API returns an error', async () => {
        const client = new SigningAPIClient('http://api.example')
        fetchMock.mockResolvedValue(
            new Response('signing provider error', {
                status: 502,
                statusText: 'Bad Gateway',
            })
        )

        await expect(client.getKeys()).rejects.toThrow(
            'API call to /getKeys failed (502): signing provider error'
        )
    })

    it('falls back to statusText when the error body is empty', async () => {
        const client = new SigningAPIClient('http://api.example')
        fetchMock.mockResolvedValue(
            new Response('', {
                status: 500,
                statusText: 'Internal Server Error',
            })
        )

        await expect(client.getKeys()).rejects.toThrow(
            'API call to /getKeys failed (500): Internal Server Error'
        )
    })

    it('setConfiguration updates BaseURL, ApiKey, MasterKey, and Caip2', () => {
        const client = new SigningAPIClient('http://api.example/')

        const config = client.setConfiguration({
            BaseURL: 'https://new.api/',
            ApiKey: 'new-key',
            MasterKey: 'Custom',
            Caip2: 'canton:mainnet',
        })

        expect(config).toMatchObject({
            BaseURL: 'https://new.api',
            ApiKey: 'new-key',
            MasterKey: 'Custom',
            CAIP2: 'canton:mainnet',
        })
    })

    it('setConfiguration only updates provided fields', () => {
        const client = new SigningAPIClient('http://api.example')
        client.setConfiguration({ ApiKey: 'initial-key' })

        const config = client.setConfiguration({ MasterKey: 'OnlyMaster' })

        expect(config.ApiKey).toBe('initial-key')
        expect(config.MasterKey).toBe('OnlyMaster')
        expect(config.BaseURL).toBe('http://api.example')
    })

    it('setConfiguration keeps BaseURL unchanged when it has no trailing slash', () => {
        const client = new SigningAPIClient('http://api.example')

        const config = client.setConfiguration({
            BaseURL: 'https://plain.api',
        })

        expect(config.BaseURL).toBe('https://plain.api')
    })

    it('includes default masterKey and caip2 in request bodies', async () => {
        const client = new SigningAPIClient('http://api.example')
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify([]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        )

        await client.getKeys()

        const init = assertRequestAndGetInit('/getKeys')
        const body = JSON.parse(init.body as string)
        expect(body).toMatchObject({
            masterKey: 'Default',
            caip2: 'canton:devnet',
        })
    })
})
