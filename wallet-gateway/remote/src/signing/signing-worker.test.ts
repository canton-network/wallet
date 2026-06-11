// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'
import { pino } from 'pino'
import { sink } from 'pino-test'
import { AuthTokenProvider } from '@canton-network/core-wallet-auth'
import { SigningWorker } from './signing-worker.js'
import type { Network, Transaction } from '@canton-network/core-wallet-store'
import { SigningProvider } from '@canton-network/core-signing-lib'

const transactionServiceMocks = vi.hoisted(() => ({
    signAndExecute: vi.fn().mockResolvedValue({ commandId: 'cmd-1' }),
    mockUuidV4: vi.fn(() => 'session-new'),
}))

vi.mock('uuid', () => ({
    v4: transactionServiceMocks.mockUuidV4,
}))

vi.mock('../ledger/transaction-service.js', () => ({
    TransactionService: vi.fn(function TransactionServiceMock() {
        return {
            signAndExecute: transactionServiceMocks.signAndExecute,
        }
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

function createWorker(store: {
    listPendingExternalTransactions: ReturnType<typeof vi.fn>
    getSessionForUser: ReturnType<typeof vi.fn>
    getNetwork: ReturnType<typeof vi.fn>
    withAuthContext: ReturnType<typeof vi.fn>
}) {
    const scopedStore = {
        setSession: vi.fn().mockResolvedValue(undefined),
        getPrimaryWallet: vi.fn().mockResolvedValue(wallet),
        getTransaction: vi.fn().mockResolvedValue(pendingTransaction),
    }
    store.withAuthContext.mockImplementation(() => scopedStore)

    const logger = pino({ level: 'silent' }, sink())
    const createAccessTokenProvider = vi.fn(async () =>
        AuthTokenProvider.fromToken(validJwt(), logger)
    )

    return {
        worker: new SigningWorker({
            intervalMs: 1000,
            signingDrivers: {},
            store: store as never,
            notificationService: {
                getNotifier: vi.fn(() => ({ emit: vi.fn() })),
            } as never,
            createAccessTokenProvider,
            logger,
        }),
        scopedStore,
        createAccessTokenProvider,
    }
}

describe('SigningWorker', () => {
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

        const { worker, scopedStore, createAccessTokenProvider } =
            createWorker(store)

        await worker.tick()

        expect(store.getSessionForUser).toHaveBeenCalledWith('user-1', {
            authType: 'client_credentials',
        })
        expect(createAccessTokenProvider).toHaveBeenCalledWith(
            clientCredentialsNetwork
        )
        const mintedToken = validJwt()
        expect(store.withAuthContext).toHaveBeenCalledWith({
            userId: 'user-1',
            accessToken: mintedToken,
        })
        expect(scopedStore.setSession).toHaveBeenCalledWith({
            id: 'session-new',
            network: 'net-m2m',
            accessToken: mintedToken,
            authType: 'client_credentials',
        })
        expect(transactionServiceMocks.signAndExecute).toHaveBeenCalled()
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
                authType: 'client_credentials',
            }),
            getNetwork: vi.fn().mockResolvedValue(clientCredentialsNetwork),
            withAuthContext: vi.fn(),
        }

        const { worker, scopedStore } = createWorker(store)

        await worker.tick()

        const sessionToken = validJwt()
        expect(scopedStore.setSession).toHaveBeenCalledWith({
            id: 'session-1',
            network: 'net-m2m',
            accessToken: sessionToken,
            authType: 'client_credentials',
        })
        expect(transactionServiceMocks.signAndExecute).toHaveBeenCalled()
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

        const { worker } = createWorker(store)

        await worker.tick()

        expect(transactionServiceMocks.signAndExecute).not.toHaveBeenCalled()
    })
})
