// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'
import { pino } from 'pino'
import { sink } from 'pino-test'
import { PendingSigningPoller } from './pending-signing-poller.js'
import type { Network, Transaction } from '@canton-network/core-wallet-store'
import { SigningProvider } from '@canton-network/core-signing-lib'

const workerMocks = vi.hoisted(() => ({
    signAndExecutePreparedTransaction: vi
        .fn()
        .mockResolvedValue({ commandId: 'cmd-1' }),
    mockUuidV4: vi.fn(() => 'session-new'),
}))

vi.mock('uuid', () => ({
    v4: workerMocks.mockUuidV4,
}))

vi.mock('./service-account-worker.js', () => ({
    ServiceAccountWorker: vi.fn(function ServiceAccountWorkerMock() {
        return {
            signAndExecutePreparedTransaction:
                workerMocks.signAndExecutePreparedTransaction,
        }
    }),
}))

vi.mock('../ledger/transaction-service.js', () => ({
    TransactionService: vi.fn(function TransactionServiceMock() {
        return {}
    }),
}))

const clientCredentialsNetwork: Network = {
    id: 'net-m2m',
    name: 'm2m',
    description: '',
    synchronizerId: 'sync::fp',
    identityProviderId: 'idp1',
    ledgerApi: { baseUrl: 'http://ledger' },
    auth: {
        method: 'client_credentials',
        clientId: 'svc',
        clientSecret: 'secret',
        audience: 'aud',
        scope: 'scope',
    },
}

const wallet = {
    primary: true,
    partyId: 'party::ns',
    status: 'allocated' as const,
    hint: 'party',
    publicKey: 'pk',
    namespace: 'ns',
    networkId: 'net-m2m',
    signingProviderId: SigningProvider.FIREBLOCKS,
    rights: [],
}

function validJwt(): string {
    const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString(
        'base64url'
    )
    const payload = Buffer.from(
        JSON.stringify({
            sub: 'user-1',
            exp: Math.floor(Date.now() / 1000) + 3600,
        })
    ).toString('base64url')
    return `${header}.${payload}.`
}

const pendingTransaction: Transaction = {
    id: 'tx-1',
    commandId: 'cmd-1',
    status: 'pending',
    preparedTransaction: 'blob',
    preparedTransactionHash: 'hash',
    externalTxId: 'ext-1',
    origin: null,
}

function createPoller(store: {
    listPendingExternalTransactions: ReturnType<typeof vi.fn>
    getSessionForUser: ReturnType<typeof vi.fn>
    getNetwork: ReturnType<typeof vi.fn>
    withAuthContext: ReturnType<typeof vi.fn>
}) {
    const scopedStore = {
        setSession: vi.fn().mockResolvedValue(undefined),
        getWallets: vi.fn().mockResolvedValue([wallet]),
        getTransaction: vi.fn().mockResolvedValue(pendingTransaction),
    }
    store.withAuthContext.mockImplementation(() => scopedStore)

    const createAccessTokenProvider = vi.fn(async () => ({
        getAccessToken: async () => 'minted-token',
    }))

    return {
        poller: new PendingSigningPoller({
            intervalMs: 1000,
            workerConfig: {},
            signingDrivers: {},
            store: store as never,
            notificationService: {
                getNotifier: vi.fn(() => ({ emit: vi.fn() })),
            } as never,
            createAccessTokenProvider,
            logger: pino({ level: 'silent' }, sink()),
        }),
        scopedStore,
        createAccessTokenProvider,
    }
}

describe('PendingSigningPoller', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('mints a token and creates a session when no session exists on an M2M network', async () => {
        const store = {
            listPendingExternalTransactions: vi.fn().mockResolvedValue([
                {
                    userId: 'user-1',
                    networkId: 'net-m2m',
                    transaction: pendingTransaction,
                },
            ]),
            getSessionForUser: vi.fn().mockResolvedValue(undefined),
            getNetwork: vi.fn().mockResolvedValue(clientCredentialsNetwork),
            withAuthContext: vi.fn(),
        }

        const { poller, scopedStore, createAccessTokenProvider } =
            createPoller(store)

        await poller.tick()

        expect(store.getSessionForUser).toHaveBeenCalledWith('user-1')
        expect(createAccessTokenProvider).toHaveBeenCalledWith(
            clientCredentialsNetwork
        )
        expect(store.withAuthContext).toHaveBeenCalledWith({
            userId: 'user-1',
            accessToken: 'minted-token',
        })
        expect(scopedStore.setSession).toHaveBeenCalledWith({
            id: 'session-new',
            network: 'net-m2m',
            accessToken: 'minted-token',
        })
        expect(workerMocks.signAndExecutePreparedTransaction).toHaveBeenCalled()
    })

    it('reuses a valid existing session', async () => {
        const store = {
            listPendingExternalTransactions: vi.fn().mockResolvedValue([
                {
                    userId: 'user-1',
                    networkId: 'net-m2m',
                    transaction: pendingTransaction,
                },
            ]),
            getSessionForUser: vi.fn().mockResolvedValue({
                id: 'session-1',
                network: 'net-m2m',
                accessToken: validJwt(),
            }),
            getNetwork: vi.fn().mockResolvedValue(clientCredentialsNetwork),
            withAuthContext: vi.fn(),
        }

        const { poller, scopedStore } = createPoller(store)

        await poller.tick()

        const sessionToken = validJwt()
        expect(scopedStore.setSession).toHaveBeenCalledWith({
            id: 'session-1',
            network: 'net-m2m',
            accessToken: sessionToken,
        })
        expect(workerMocks.signAndExecutePreparedTransaction).toHaveBeenCalled()
    })

    it('skips interactive networks without a valid session', async () => {
        const interactiveNetwork: Network = {
            ...clientCredentialsNetwork,
            id: 'net-interactive',
            auth: {
                method: 'authorization_code',
                clientId: 'app',
                audience: 'aud',
                scope: 'scope',
            },
        }
        const store = {
            listPendingExternalTransactions: vi.fn().mockResolvedValue([
                {
                    userId: 'user-1',
                    networkId: 'net-interactive',
                    transaction: pendingTransaction,
                },
            ]),
            getSessionForUser: vi.fn().mockResolvedValue(undefined),
            getNetwork: vi.fn().mockResolvedValue(interactiveNetwork),
            withAuthContext: vi.fn(),
        }

        const { poller } = createPoller(store)

        await poller.tick()

        expect(
            workerMocks.signAndExecutePreparedTransaction
        ).not.toHaveBeenCalled()
    })
})
