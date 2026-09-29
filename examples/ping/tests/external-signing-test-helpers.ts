// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Helpers for altering external signing providers' mock APIs state,
// as would happen for example when user approves tx signing on a phone app.

import { expect, test } from '@canton-network/core-wallet-test-utils'

export { MOCK_FIREBLOCKS_VAULT_NAME } from '@canton-network/core-wallet-test-utils'

const isLocalhost = (url: URL) =>
    ['localhost', '127.0.0.1'].includes(url.hostname)

function toMockEndpoint(baseUrl: string, path: string): string {
    const origin = new URL(baseUrl).origin
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${origin}${normalizedPath}`
}

// The same suites run against the real provider APIs, which offer no way to
// force a transaction into a given state, so these become no-ops there.
function mockApiUrl(configuredUrl: string | undefined): string | undefined {
    if (!configuredUrl || !isLocalhost(new URL(configuredUrl))) {
        return undefined
    }
    return configuredUrl
}

async function postToMock(
    apiUrl: string,
    path: string,
    body: unknown
): Promise<Response> {
    const url = toMockEndpoint(apiUrl, path)
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })

    // Reading the body is only safe once, so only spend it on the failure message.
    const detail = response.ok ? '' : `, body: ${await response.text()}`
    expect(response.status, `the mock should accept POST ${url}${detail}`).toBe(
        200
    )

    return response
}

export async function setMockBlockdaemonTransactionState(
    txId: string,
    status: 'signed' | 'rejected' | 'failed'
): Promise<void> {
    const apiUrl = mockApiUrl(process.env.BLOCKDAEMON_API_URL)
    if (!apiUrl) {
        return
    }

    await test.step(`tell the Blockdaemon mock to mark ${txId} as ${status}`, async () => {
        await postToMock(apiUrl, '/_admin/setTransactionState', {
            txId,
            status,
        })

        const txResponse = await postToMock(apiUrl, '/getTransaction', { txId })
        const tx = (await txResponse.json()) as {
            txId: string
            status: string
        }

        expect(
            tx,
            `the Blockdaemon mock should report ${txId} as ${status}`
        ).toMatchObject({ txId, status })
    })
}

export async function setMockDfnsTransactionState(
    signatureId: string,
    status: 'Signed' | 'Rejected' | 'Failed'
): Promise<void> {
    const apiUrl = mockApiUrl(process.env.DFNS_BASE_URL)
    if (!apiUrl) {
        return
    }

    await test.step(`tell the Dfns mock to mark ${signatureId} as ${status}`, async () => {
        const setResponse = await postToMock(
            apiUrl,
            '/_admin/setTransactionState',
            { signatureId, status }
        )

        const updated = (await setResponse.json()) as { status: string }
        expect(
            updated.status,
            `the Dfns mock should report ${signatureId} as ${status}`
        ).toBe(status)
    })
}

export async function setMockFireblocksTransactionState(
    txId: string,
    status: 'signed' | 'rejected' | 'failed'
): Promise<void> {
    const apiUrl = mockApiUrl(process.env.FIREBLOCKS_API_PATH)
    if (!apiUrl) {
        return
    }

    await test.step(`tell the Fireblocks mock to mark ${txId} as ${status}`, async () => {
        const setResponse = await postToMock(
            apiUrl,
            '/_admin/setTransactionState',
            { txId, status }
        )

        const updated = (await setResponse.json()) as {
            signedMessages?: unknown[]
            status?: string
        }
        if (status === 'signed') {
            expect(
                updated.signedMessages ?? [],
                `the Fireblocks mock should return a signature for ${txId}`
            ).not.toHaveLength(0)
        } else {
            expect(
                updated.status,
                `the Fireblocks mock should report ${txId} as ${status}`
            ).toBe(status === 'rejected' ? 'REJECTED' : 'FAILED')
        }
    })
}
