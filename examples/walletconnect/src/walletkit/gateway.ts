// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const DAPP_PATH = '/api/v0/dapp'
const USER_PATH = '/api/v0/user'

const selfSignedCredentials = {
    clientId: import.meta.env.VITE_AUTH_CLIENT_ID || 'ledger-api-user',
    clientSecret: import.meta.env.VITE_AUTH_CLIENT_SECRET || 'unsafe',
}

let requestId = 0
let cachedAccessToken: string | undefined

async function getAccessToken(): Promise<string> {
    if (!cachedAccessToken) {
        throw new Error('Not authenticated — connect to a network first')
    }
    return cachedAccessToken
}

async function jsonRpc<T>(
    path: string,
    method: string,
    params: unknown,
    options?: { authenticated?: boolean }
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (options?.authenticated !== false) {
        headers.Authorization = `Bearer ${await getAccessToken()}`
    }

    const res = await fetch(path, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: ++requestId,
            method,
            params: params ?? {},
        }),
    })

    const body = await res.json()
    if (body.error) {
        throw new Error(body.error.message || JSON.stringify(body.error))
    }
    return body.result as T
}

// ── dApp API ──

export function callDappApi<T = unknown>(
    method: string,
    params?: unknown
): Promise<T> {
    return jsonRpc<T>(DAPP_PATH, method, params)
}

// ── User API ──

export function callUserApi<T = unknown>(
    method: string,
    params?: unknown
): Promise<T> {
    return jsonRpc<T>(USER_PATH, method, params)
}

// ── Unauthenticated calls (allowed without session) ──

export interface NetworkInfo {
    id: string
    name: string
    description: string
}

export async function listNetworks(): Promise<NetworkInfo[]> {
    const result = await jsonRpc<{ networks: NetworkInfo[] }>(
        USER_PATH,
        'listNetworks',
        {},
        { authenticated: false }
    )
    return result.networks
}

export async function selfSignedAccessToken(
    networkId: string
): Promise<string> {
    const { accessToken } = await jsonRpc<{ accessToken: string }>(
        USER_PATH,
        'selfSignedAccessToken',
        {
            networkId,
            clientId: selfSignedCredentials.clientId,
            clientSecret: selfSignedCredentials.clientSecret,
        },
        { authenticated: false }
    )
    cachedAccessToken = accessToken
    return accessToken
}

export async function bootstrapSession(
    networkId: string
): Promise<{ id: string }> {
    await selfSignedAccessToken(networkId)
    return callUserApi<{ id: string }>('addSession', {
        networkId,
        origin: window.location.origin,
    })
}

// ── Wallet helpers ──

export async function listWallets(): Promise<
    Array<{
        partyId: string
        publicKey: string
        namespace: string
        networkId: string
        signingProviderId: string
        status: string
        primary: boolean
    }>
> {
    return callUserApi('listWallets', {})
}

export async function setPrimaryWallet(partyId: string): Promise<void> {
    await callUserApi('setPrimaryWallet', { partyId })
}

export async function getPrimaryPartyId(): Promise<string> {
    const wallets = await listWallets()
    const primary = wallets.find((w) => w.primary)
    if (!primary) throw new Error('No primary wallet configured on gateway')
    return primary.partyId
}

// ── Full prepare → sign → execute flow ──

export interface PrepareSignExecuteResult {
    status: 'executed'
    commandId: string
    payload: {
        updateId: string
        completionOffset: number
    }
}

export async function prepareSignExecute(
    params: Record<string, unknown>
): Promise<PrepareSignExecuteResult> {
    // 1. Prepare the transaction via dapp API
    const prepResult = await callDappApi<{ userUrl: string }>(
        'prepareExecute',
        params
    )

    // Extract transactionId and commandId from the userUrl query string
    const url = new URL(prepResult.userUrl, window.location.origin)
    const transactionId = url.searchParams.get('transactionId')
    const commandId = url.searchParams.get('commandId')
    if (!transactionId) {
        throw new Error('No transactionId in prepareExecute response')
    }
    if (!commandId) throw new Error('No commandId in prepareExecute response')

    // 2. Get partyId for signing
    const partyId = await getPrimaryPartyId()

    // 3. Sign the transaction via user API
    const signResult = await callUserApi<{
        status: string
        signature?: string
        signedBy?: string
    }>('sign', { transactionId, partyId })

    if (signResult.status !== 'signed') {
        throw new Error(`Sign returned status: ${signResult.status}`)
    }

    // 4. Execute the signed transaction via user API
    const execResult = await callUserApi<{
        updateId?: string
        completionOffset?: number
    }>('execute', {
        transactionId,
        partyId,
        signature: signResult.signature,
        signedBy: signResult.signedBy,
    })

    return {
        status: 'executed',
        commandId,
        payload: {
            updateId: execResult.updateId ?? '',
            completionOffset: execResult.completionOffset ?? 0,
        },
    }
}

export interface SignMessageFlowResult {
    signature: string
    publicKey?: string
}

export async function signMessageFlow(
    message: string
): Promise<SignMessageFlowResult> {
    const response = await callDappApi<{ messageId: string; userUrl: string }>(
        'signMessage',
        { message }
    )

    const messageId =
        response.messageId ||
        new URL(response.userUrl, window.location.origin).searchParams.get(
            'messageId'
        )
    if (!messageId) {
        throw new Error('No messageId in signMessage response')
    }

    return callUserApi<SignMessageFlowResult>('signMessage', { messageId })
}
