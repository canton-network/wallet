// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, test } from 'vitest'
import {
    createBlockdaemonMockProvider,
    SigningProviderMockServer,
    startSigningProviderMockServer,
} from './index.js'

async function postJson(
    baseUrl: string,
    path: string,
    body: unknown
): Promise<Response> {
    return fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
}

describe('signing provider mock server', () => {
    let server: SigningProviderMockServer | undefined

    afterEach(async () => {
        if (server) {
            await server.close()
            server = undefined
        }
    })

    test('keeps transaction pending until admin route updates state', async () => {
        server = await startSigningProviderMockServer({
            host: '127.0.0.1',
            port: 45081,
            providers: [createBlockdaemonMockProvider()],
        })

        const createKeyResponse = await postJson(
            server.baseUrl,
            '/blockdaemon/createKey',
            { name: 'wallet-1' }
        )
        expect(createKeyResponse.status).toBe(200)
        const key = (await createKeyResponse.json()) as {
            publicKey: string
        }
        expect(key.publicKey).toBeTruthy()

        const signResponse = await postJson(
            server.baseUrl,
            '/blockdaemon/signTransaction',
            {
                tx: 'tx-data',
                txHash: 'hash-data',
                keyIdentifier: { publicKey: key.publicKey },
            }
        )
        expect(signResponse.status).toBe(200)
        const pendingTx = (await signResponse.json()) as {
            txId: string
            status: string
        }
        expect(pendingTx.status).toBe('pending')

        const firstPollResponse = await postJson(
            server.baseUrl,
            '/blockdaemon/getTransaction',
            {
                txId: pendingTx.txId,
            }
        )
        expect(firstPollResponse.status).toBe(200)
        const firstPoll = (await firstPollResponse.json()) as { status: string }
        expect(firstPoll.status).toBe('pending')

        const secondPollResponse = await postJson(
            server.baseUrl,
            '/blockdaemon/getTransaction',
            {
                txId: pendingTx.txId,
            }
        )
        expect(secondPollResponse.status).toBe(200)
        const secondPoll = (await secondPollResponse.json()) as {
            status: string
            signature?: string
        }
        expect(secondPoll.status).toBe('pending')

        const adminSetResponse = await postJson(
            server.baseUrl,
            '/blockdaemon/_admin/setTransactionState',
            {
                txId: pendingTx.txId,
                status: 'signed',
            }
        )
        expect(adminSetResponse.status).toBe(200)

        const afterAdminGetResponse = await postJson(
            server.baseUrl,
            '/blockdaemon/getTransaction',
            {
                txId: pendingTx.txId,
            }
        )
        const afterAdminTx = (await afterAdminGetResponse.json()) as {
            status: string
            signature?: string
        }
        expect(afterAdminTx.status).toBe('signed')
        expect(afterAdminTx.signature).toBeTruthy()
    })

    test('supports custom path prefixes', async () => {
        server = await startSigningProviderMockServer({
            host: '127.0.0.1',
            port: 45082,
            providers: [
                createBlockdaemonMockProvider({
                    pathPrefix: '/signing/blockdaemon',
                }),
            ],
        })

        const missingRoute = await postJson(
            server.baseUrl,
            '/blockdaemon/getKeys',
            {}
        )
        expect(missingRoute.status).toBe(404)

        const existingRoute = await postJson(
            server.baseUrl,
            '/signing/blockdaemon/getKeys',
            {}
        )
        expect(existingRoute.status).toBe(200)
    })

    test('supports deterministic transaction status via admin route', async () => {
        server = await startSigningProviderMockServer({
            host: '127.0.0.1',
            port: 45083,
            providers: [createBlockdaemonMockProvider()],
        })

        const signResponse = await postJson(
            server.baseUrl,
            '/blockdaemon/signTransaction',
            {
                tx: 'tx-data',
                txHash: 'hash-data',
                keyIdentifier: { publicKey: 'mock-public-key' },
            }
        )
        const signedTx = (await signResponse.json()) as {
            txId: string
        }

        const adminSetResponse = await postJson(
            server.baseUrl,
            '/blockdaemon/_admin/setTransactionState',
            {
                txId: signedTx.txId,
                status: 'rejected',
            }
        )
        expect(adminSetResponse.status).toBe(200)

        const getResponse = await postJson(
            server.baseUrl,
            '/blockdaemon/getTransaction',
            {
                txId: signedTx.txId,
            }
        )
        const tx = (await getResponse.json()) as { status: string }
        expect(tx.status).toBe('rejected')
    })
})
