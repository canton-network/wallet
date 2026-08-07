// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Helpers for altering external signing providers' mock APIs state,
// as would happen for example when user approves tx signing on a phone app.

import { expect } from '@canton-network/core-wallet-test-utils'

export type ExternalSigningProvider = 'blockdaemon' | 'dfns' | 'fireblocks'

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

export async function setMockBlockdaemonTransactionState(
    txId: string,
    status: 'signed' | 'rejected' | 'failed'
): Promise<void> {
    const apiUrl = mockApiUrl(process.env.BLOCKDAEMON_API_URL)
    if (!apiUrl) {
        return
    }

    const promoteResponse = await fetch(
        toMockEndpoint(apiUrl, '/_admin/setTransactionState'),
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txId, status }),
        }
    )
    expect(promoteResponse.ok).toBeTruthy()

    const txResponse = await fetch(toMockEndpoint(apiUrl, '/getTransaction'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId }),
    })
    expect(txResponse.ok).toBeTruthy()
    const tx = (await txResponse.json()) as {
        txId: string
        status: string
    }
    expect(tx.txId).toBe(txId)
    expect(tx.status).toBe(status)
}

export async function setMockDfnsTransactionState(
    signatureId: string,
    status: 'Signed' | 'Rejected' | 'Failed'
): Promise<void> {
    const apiUrl = mockApiUrl(process.env.DFNS_BASE_URL)
    if (!apiUrl) {
        return
    }

    const setResponse = await fetch(
        toMockEndpoint(apiUrl, '/_admin/setTransactionState'),
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ signatureId, status }),
        }
    )
    expect(setResponse.ok).toBeTruthy()

    const updated = (await setResponse.json()) as { status: string }
    expect(updated.status).toBe(status)
}

export async function setMockFireblocksTransactionState(
    txId: string,
    status: 'signed' | 'rejected' | 'failed'
): Promise<void> {
    const apiUrl = mockApiUrl(process.env.FIREBLOCKS_API_PATH)
    if (!apiUrl) {
        return
    }

    const setResponse = await fetch(
        toMockEndpoint(apiUrl, '/_admin/setTransactionState'),
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txId, status }),
        }
    )
    expect(setResponse.ok).toBeTruthy()

    const updated = (await setResponse.json()) as {
        signedMessages?: unknown[]
        status?: string
    }
    if (status === 'signed') {
        expect(updated.signedMessages?.length).toBeGreaterThan(0)
    } else {
        expect(updated.status).toBe(
            status === 'rejected' ? 'REJECTED' : 'FAILED'
        )
    }
}
