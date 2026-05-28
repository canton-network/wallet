// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { vi } from 'vitest'
import type { Network as StoreNetwork } from '@canton-network/core-wallet-store'
import type {
    Idp,
    Network,
    Transaction,
    Wallet,
} from '@canton-network/core-wallet-user-rpc-client'

export const mockRequest = vi.fn()

export function createMockUserClient() {
    return { request: mockRequest }
}

export function makeWallet(overrides: Partial<Wallet> = {}): Wallet {
    return {
        primary: false,
        partyId: 'alice::1220abc',
        status: 'allocated',
        hint: 'alice',
        publicKey: 'pk',
        namespace: '1220abc',
        networkId: 'network1',
        signingProviderId: 'internal',
        rights: [],
        ...overrides,
    }
}

export function makeTransaction(
    overrides: Partial<Transaction> = {}
): Transaction {
    return {
        id: 'tx-1',
        commandId: 'cmd-1',
        status: 'pending',
        preparedTransaction: 'prepared-tx-blob',
        preparedTransactionHash: 'hash-abc',
        createdAt: '2024-06-01T12:00:00.000Z',
        origin: 'https://dapp.example',
        ...overrides,
    }
}

export function makeIdp(overrides: Partial<Idp> = {}): Idp {
    return {
        id: 'idp-1',
        type: 'oauth',
        issuer: 'https://issuer.example',
        configUrl: 'https://config.example/.well-known/openid-configuration',
        ...overrides,
    }
}

export function makeNetwork(overrides: Partial<Network> = {}): Network {
    return {
        id: 'net-1',
        name: 'Test Network',
        description: 'Test network description',
        identityProviderId: 'idp-1',
        ledgerApi: 'http://localhost:6865',
        auth: {
            method: 'client_credentials',
            audience: 'audience',
            scope: 'scope',
            clientId: 'client-id',
            clientSecret: 'client-secret',
        },
        ...overrides,
    }
}

export function makeStoreNetwork(
    overrides: Partial<StoreNetwork> = {}
): StoreNetwork {
    return {
        id: 'net-1',
        name: 'Test Network',
        description: 'Test network description',
        identityProviderId: 'idp-1',
        ledgerApi: { baseUrl: 'http://localhost:6865' },
        auth: {
            method: 'client_credentials',
            audience: 'audience',
            scope: 'scope',
            clientId: 'client-id',
            clientSecret: 'client-secret',
        },
        ...overrides,
    }
}

export function mockListWalletsFlow(
    wallets: Wallet[],
    networkId = 'network1'
): void {
    mockRequest.mockImplementation(async ({ method, params }) => {
        if (method === 'listSessions') {
            return {
                sessions: [
                    {
                        id: 'sess-1',
                        network: { id: networkId, name: 'Test' },
                    },
                ],
            }
        }
        if (method === 'listWallets') {
            if (
                params?.filter?.networkIds &&
                !params.filter.networkIds.includes(networkId)
            ) {
                return []
            }
            return wallets
        }
        return undefined
    })
}

export function mockNetworksPageFlow(
    networks: Network[],
    options: { isAdmin?: boolean } = {}
): void {
    mockRequest.mockImplementation(async ({ method }) => {
        if (method === 'listNetworks') {
            return { networks }
        }
        if (method === 'listSessions') {
            return { sessions: [] }
        }
        if (method === 'getUser') {
            return {
                userId: 'user-1',
                isAdmin: options.isAdmin ?? false,
            }
        }
        if (method === 'addNetwork' || method === 'removeNetwork') {
            return undefined
        }
        return undefined
    })
}
export function mockIdpsPageFlow(
    idps: Idp[],
    options: { isAdmin?: boolean } = {}
): void {
    mockRequest.mockImplementation(async ({ method }) => {
        if (method === 'listIdps') {
            return { idps }
        }
        if (method === 'getUser') {
            return {
                userId: 'user-1',
                isAdmin: options.isAdmin ?? false,
            }
        }
        if (method === 'addIdp' || method === 'removeIdp') {
            return undefined
        }
        return undefined
    })
}

export function mockSettingsPageFlow(
    options: {
        networks?: Network[]
        sessions?: { id: string; network: { id: string } }[]
        idps?: Idp[]
        isAdmin?: boolean
        userId?: string
        gatewayVersion?: string
    } = {}
): void {
    const {
        networks = [makeNetwork()],
        sessions = [{ id: 'sess-1', network: { id: 'net-1' } }],
        idps = [makeIdp()],
        isAdmin = true,
        userId = 'user-1',
        gatewayVersion = '1.2.3',
    } = options

    mockRequest.mockImplementation(async ({ method }) => {
        if (method === 'listNetworks') {
            return { networks }
        }
        if (method === 'listSessions') {
            return { sessions }
        }
        if (method === 'listIdps') {
            return { idps }
        }
        if (method === 'getUser') {
            return { userId, isAdmin }
        }
        if (
            method === 'addNetwork' ||
            method === 'removeNetwork' ||
            method === 'addIdp' ||
            method === 'removeIdp'
        ) {
            return undefined
        }
        return undefined
    })

    const originalFetch = globalThis.fetch.bind(globalThis)
    vi.stubGlobal(
        'fetch',
        async (input: RequestInfo | URL, init?: RequestInit) => {
            const url =
                typeof input === 'string'
                    ? input
                    : input instanceof URL
                      ? input.href
                      : input.url
            if (url.includes('/.well-known/wallet-gateway-version')) {
                return new Response(
                    JSON.stringify({ version: gatewayVersion }),
                    {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    }
                )
            }
            return originalFetch(input, init)
        }
    )
}
