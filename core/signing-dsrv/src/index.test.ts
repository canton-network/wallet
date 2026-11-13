// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { PartyMode, SigningProvider } from '@canton-network/core-signing-lib'
import DsrvSigningDriver from './index.js'

const BASE_URL = 'http://signing.example'
const userId = 'user-1'

const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    })

describe('DsrvSigningDriver', () => {
    let fetchMock: ReturnType<typeof vi.fn>
    let driver: DsrvSigningDriver

    beforeEach(() => {
        fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)
        driver = new DsrvSigningDriver({
            baseUrl: BASE_URL,
            bearerToken: 'gw-token',
        })
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    function lastRequest() {
        const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit]
        return { url, body: JSON.parse(init.body as string) as unknown }
    }

    test('is an external-party driver registered as dsrv', () => {
        expect(driver.partyMode).toBe(PartyMode.EXTERNAL)
        expect(driver.signingProvider).toBe(SigningProvider.DSRV)
    })

    describe('createKey', () => {
        test('posts the key name and the requesting user', async () => {
            fetchMock.mockResolvedValue(
                jsonResponse({
                    id: 'key-1',
                    name: 'alice',
                    publicKey: 'pk-1',
                    createdAt: '2026-01-01T00:00:00.000Z',
                })
            )

            const result = await driver
                .controller(userId)
                .createKey({ name: 'alice' })

            expect(lastRequest()).toEqual({
                url: `${BASE_URL}/api/signing/createKey`,
                body: { name: 'alice', requestedBy: userId },
            })
            expect(result).toEqual({
                id: 'key-1',
                name: 'alice',
                publicKey: 'pk-1',
            })
        })

        test('omits requestedBy without a user', async () => {
            fetchMock.mockResolvedValue(
                jsonResponse({ id: 'key-1', name: 'alice', publicKey: 'pk-1' })
            )

            await driver.controller(undefined).createKey({ name: 'alice' })

            expect(lastRequest().body).toEqual({ name: 'alice' })
        })

        test('returns create_key_error when the request fails', async () => {
            fetchMock.mockResolvedValue(
                new Response('unavailable', { status: 503 })
            )

            const result = await driver
                .controller(userId)
                .createKey({ name: 'alice' })

            expect(result).toEqual({
                error: 'create_key_error',
                error_description:
                    'DSRV signing API createKey failed (503): unavailable',
            })
        })
    })

    describe('getKeys', () => {
        test('posts an empty body and returns the keys', async () => {
            fetchMock.mockResolvedValue(
                jsonResponse({
                    keys: [
                        { id: 'key-1', name: 'alice', publicKey: 'pk-1' },
                        { id: 'key-2', name: 'bob', publicKey: 'pk-2' },
                    ],
                })
            )

            const result = await driver.controller(userId).getKeys()

            expect(lastRequest()).toEqual({
                url: `${BASE_URL}/api/signing/getKeys`,
                body: {},
            })
            expect(result).toEqual({
                keys: [
                    { id: 'key-1', name: 'alice', publicKey: 'pk-1' },
                    { id: 'key-2', name: 'bob', publicKey: 'pk-2' },
                ],
            })
        })

        test('returns fetch_error when the request fails', async () => {
            fetchMock.mockRejectedValue(new Error('connection refused'))

            const result = await driver.controller(userId).getKeys()

            expect(result).toEqual({
                error: 'fetch_error',
                error_description: 'connection refused',
            })
        })
    })

    describe('signTransaction', () => {
        const signParams = {
            tx: 'prepared-tx',
            txHash: 'tx-hash',
            keyIdentifier: { publicKey: 'pk-1' },
            internalTxId: 'internal-1',
        }

        test('posts the transaction, the internal id and the requesting user', async () => {
            fetchMock.mockResolvedValue(
                jsonResponse({ txId: 'dsrv-tx-1', status: 'pending' })
            )

            const result = await driver
                .controller(userId)
                .signTransaction(signParams)

            expect(lastRequest()).toEqual({
                url: `${BASE_URL}/api/signing/signTransaction`,
                body: { ...signParams, requestedBy: userId },
            })
            expect(result).toEqual({ txId: 'dsrv-tx-1', status: 'pending' })
        })

        test('does not forward extra parameters', async () => {
            fetchMock.mockResolvedValue(
                jsonResponse({ txId: 'dsrv-tx-1', status: 'pending' })
            )

            await driver.controller(undefined).signTransaction({
                tx: 'prepared-tx',
                txHash: 'tx-hash',
                keyIdentifier: { publicKey: 'pk-1' },
                extraParams: { ignored: true },
            })

            expect(lastRequest().body).toEqual({
                tx: 'prepared-tx',
                txHash: 'tx-hash',
                keyIdentifier: { publicKey: 'pk-1' },
            })
        })

        test('passes a refusal from the signing API on as an RPC error', async () => {
            fetchMock.mockResolvedValue(
                jsonResponse({
                    error: 'key_not_found',
                    error_description: 'no such key',
                })
            )

            const result = await driver
                .controller(userId)
                .signTransaction(signParams)

            expect(result).toEqual({
                error: 'key_not_found',
                error_description: 'no such key',
            })
        })

        test('uses the error code when a refusal has no description', async () => {
            fetchMock.mockResolvedValue(jsonResponse({ error: 'halted' }))

            const result = await driver
                .controller(userId)
                .signTransaction(signParams)

            expect(result).toEqual({
                error: 'halted',
                error_description: 'halted',
            })
        })

        test('returns signing_error when the request fails', async () => {
            fetchMock.mockResolvedValue(
                new Response('', { status: 502, statusText: 'Bad Gateway' })
            )

            const result = await driver
                .controller(userId)
                .signTransaction(signParams)

            expect(result).toEqual({
                error: 'signing_error',
                error_description:
                    'DSRV signing API signTransaction failed (502): Bad Gateway',
            })
        })
    })

    describe('getTransaction', () => {
        test('posts only the transaction id', async () => {
            fetchMock.mockResolvedValue(
                jsonResponse({
                    txId: 'dsrv-tx-1',
                    status: 'signed',
                    signature: 'sig-1',
                    publicKey: 'pk-1',
                    metadata: { internalTxId: 'internal-1' },
                })
            )

            const result = await driver
                .controller(userId)
                .getTransaction({ userId, txId: 'dsrv-tx-1' })

            expect(lastRequest()).toEqual({
                url: `${BASE_URL}/api/signing/getTransaction`,
                body: { txId: 'dsrv-tx-1' },
            })
            expect(result).toEqual({
                txId: 'dsrv-tx-1',
                status: 'signed',
                signature: 'sig-1',
                publicKey: 'pk-1',
                metadata: { internalTxId: 'internal-1' },
            })
        })

        test('reports signed without a signature as pending', async () => {
            fetchMock.mockResolvedValue(
                jsonResponse({ txId: 'dsrv-tx-1', status: 'signed' })
            )

            const result = await driver
                .controller(userId)
                .getTransaction({ userId, txId: 'dsrv-tx-1' })

            expect(result).toEqual({ txId: 'dsrv-tx-1', status: 'pending' })
        })

        test('omits optional fields that are not returned', async () => {
            fetchMock.mockResolvedValue(
                jsonResponse({ txId: 'dsrv-tx-1', status: 'pending' })
            )

            const result = await driver
                .controller(userId)
                .getTransaction({ txId: 'dsrv-tx-1' })

            expect(result).toEqual({ txId: 'dsrv-tx-1', status: 'pending' })
        })

        test('passes a refusal from the signing API on as an RPC error', async () => {
            fetchMock.mockResolvedValue(
                jsonResponse({
                    error: 'not_found',
                    error_description: 'unknown txId',
                })
            )

            const result = await driver
                .controller(userId)
                .getTransaction({ txId: 'missing' })

            expect(result).toEqual({
                error: 'not_found',
                error_description: 'unknown txId',
            })
        })

        test('returns transaction_not_found when the request fails', async () => {
            fetchMock.mockRejectedValue(new Error('connection refused'))

            const result = await driver
                .controller(userId)
                .getTransaction({ txId: 'dsrv-tx-1' })

            expect(result).toEqual({
                error: 'transaction_not_found',
                error_description: 'connection refused',
            })
        })
    })

    describe('getTransactions', () => {
        test('posts the filters and returns the transactions', async () => {
            fetchMock.mockResolvedValue(
                jsonResponse({
                    transactions: [
                        { txId: 'dsrv-tx-1', status: 'signed', signature: 's' },
                        { txId: 'dsrv-tx-2', status: 'rejected' },
                    ],
                })
            )

            const result = await driver.controller(userId).getTransactions({
                txIds: ['dsrv-tx-1', 'dsrv-tx-2'],
                publicKeys: ['pk-1'],
            })

            expect(lastRequest()).toEqual({
                url: `${BASE_URL}/api/signing/getTransactions`,
                body: {
                    txIds: ['dsrv-tx-1', 'dsrv-tx-2'],
                    publicKeys: ['pk-1'],
                },
            })
            expect(result).toEqual({
                transactions: [
                    { txId: 'dsrv-tx-1', status: 'signed', signature: 's' },
                    { txId: 'dsrv-tx-2', status: 'rejected' },
                ],
            })
        })

        test('posts only the filters given', async () => {
            fetchMock.mockResolvedValue(jsonResponse({}))

            const result = await driver
                .controller(userId)
                .getTransactions({ publicKeys: ['pk-1'] })

            expect(lastRequest().body).toEqual({ publicKeys: ['pk-1'] })
            expect(result).toEqual({ transactions: [] })
        })

        test('returns bad_arguments without filters', async () => {
            const result = await driver.controller(userId).getTransactions({})

            expect(result).toEqual({
                error: 'bad_arguments',
                error_description:
                    'either public key or txIds must be supplied',
            })
            expect(fetchMock).not.toHaveBeenCalled()
        })

        test('passes a refusal from the signing API on as an RPC error', async () => {
            fetchMock.mockResolvedValue(
                jsonResponse({
                    error: 'invalid_params',
                    error_description: 'txIds or publicKeys required',
                })
            )

            const result = await driver
                .controller(userId)
                .getTransactions({ txIds: [] })

            expect(result).toEqual({
                error: 'invalid_params',
                error_description: 'txIds or publicKeys required',
            })
        })

        test('returns fetch_error when the request fails', async () => {
            fetchMock.mockRejectedValue(new Error('connection refused'))

            const result = await driver
                .controller(userId)
                .getTransactions({ txIds: ['dsrv-tx-1'] })

            expect(result).toEqual({
                error: 'fetch_error',
                error_description: 'connection refused',
            })
        })
    })

    test('signMessage is not allowed', async () => {
        const result = await driver.controller(userId).signMessage({
            message: 'hello',
            keyIdentifier: { publicKey: 'pk-1' },
        })

        expect(result).toEqual({
            error: 'not_allowed',
            error_description:
                'Signing messages is not supported by the DSRV signing provider.',
        })
        expect(fetchMock).not.toHaveBeenCalled()
    })

    describe('configuration', () => {
        test('getConfiguration returns the base URL', async () => {
            expect(await driver.controller(userId).getConfiguration()).toEqual({
                baseUrl: BASE_URL,
                bearerToken: '***HIDDEN***',
            })
        })

        test('setConfiguration changes the base URL used for requests', async () => {
            const controller = driver.controller(userId)

            expect(
                await controller.setConfiguration({
                    baseUrl: 'http://other.example/',
                })
            ).toEqual({
                baseUrl: 'http://other.example',
                bearerToken: '***HIDDEN***',
            })

            fetchMock.mockResolvedValue(jsonResponse({ keys: [] }))
            await controller.getKeys()
            expect(lastRequest().url).toBe(
                'http://other.example/api/signing/getKeys'
            )
        })

        test('setConfiguration ignores other settings', async () => {
            expect(
                await driver
                    .controller(userId)
                    .setConfiguration({ apiKey: 'ignored' })
            ).toEqual({ baseUrl: BASE_URL, bearerToken: '***HIDDEN***' })
        })
    })

    describe('bearer token', () => {
        const lastHeaders = () =>
            (fetchMock.mock.calls.at(-1) as [string, RequestInit])[1].headers

        test('is sent on every operation', async () => {
            const withToken = new DsrvSigningDriver({
                baseUrl: BASE_URL,
                bearerToken: 'gw-token',
            }).controller(userId)
            fetchMock.mockImplementation(async () =>
                jsonResponse({ txId: 'dsrv-tx-1', status: 'pending' })
            )

            await withToken.createKey({ name: 'alice' })
            expect(lastHeaders()).toMatchObject({
                Authorization: 'Bearer gw-token',
            })
            await withToken.signTransaction({
                tx: 'tx',
                txHash: 'hash',
                keyIdentifier: { publicKey: 'pk-1' },
            })
            expect(lastHeaders()).toMatchObject({
                Authorization: 'Bearer gw-token',
            })
            await withToken.getTransaction({ txId: 'dsrv-tx-1' })
            expect(lastHeaders()).toMatchObject({
                Authorization: 'Bearer gw-token',
            })
        })

        test('is hidden in the configuration and can be replaced', async () => {
            const controller = new DsrvSigningDriver({
                baseUrl: BASE_URL,
                bearerToken: 'gw-token',
            }).controller(userId)

            expect(await controller.getConfiguration()).toEqual({
                baseUrl: BASE_URL,
                bearerToken: '***HIDDEN***',
            })
            await controller.setConfiguration({ bearerToken: 'next-token' })
            fetchMock.mockResolvedValue(jsonResponse({ keys: [] }))
            await controller.getKeys()
            expect(lastHeaders()).toMatchObject({
                Authorization: 'Bearer next-token',
            })
        })

        test('a 401 from the signing API becomes the operation error', async () => {
            fetchMock.mockResolvedValue(
                new Response('invalid token', { status: 401 })
            )

            const result = await new DsrvSigningDriver({
                baseUrl: BASE_URL,
                bearerToken: 'wrong-token',
            })
                .controller(userId)
                .signTransaction({
                    tx: 'tx',
                    txHash: 'hash',
                    keyIdentifier: { publicKey: 'pk-1' },
                })

            expect(result).toEqual({
                error: 'signing_error',
                error_description:
                    'DSRV signing API signTransaction failed (401): invalid token',
            })
        })
    })
})
