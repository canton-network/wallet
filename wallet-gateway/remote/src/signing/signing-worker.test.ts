// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'
import { pino } from 'pino'
import { sink } from 'pino-test'
import { AuthTokenProvider } from '@canton-network/core-wallet-auth'
import { SigningWorker } from './signing-worker.js'
import type { Network, Transaction } from '@canton-network/core-wallet-store'
import { SigningProvider } from '@canton-network/core-signing-lib'

const mocks = vi.hoisted(() => ({
    signAndExecute: vi.fn().mockResolvedValue({ commandId: 'cmd-1' }),
    uuidV4: vi.fn(() => 'session-new'),
}))

vi.mock('uuid', () => ({ v4: mocks.uuidV4 }))
vi.mock('../ledger/transaction-service.js', () => ({
    TransactionService: vi.fn(function TransactionServiceMock() {
        return { signAndExecute: mocks.signAndExecute }
    }),
}))

const m2mNetwork: Network = {
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

const pendingTransaction: Transaction = {
    id: 'tx-1',
    commandId: 'cmd-1',
    status: 'pending',
    preparedTransaction: 'blob',
    preparedTransactionHash: 'hash',
    externalTxId: 'ext-1',
    origin: null,
    userId: 'user-1',
    networkId: 'net-m2m',
}

function m2mJwt(extra: Record<string, unknown> = {}): string {
    const encode = (value: unknown) =>
        Buffer.from(JSON.stringify(value)).toString('base64url')
    return `${encode({ alg: 'none' })}.${encode({
        sub: 'user-1',
        gty: 'client_credentials',
        exp: Math.floor(Date.now() / 1000) + 3600,
        ...extra,
    })}.`
}

function createWorker(
    storeOverrides: {
        listAllPendingTransactions?: ReturnType<typeof vi.fn>
        getSessionForUser?: ReturnType<typeof vi.fn>
        getNetwork?: ReturnType<typeof vi.fn>
        withAuthContext?: ReturnType<typeof vi.fn>
    } = {}
) {
    const scopedStore = {
        setSession: vi.fn().mockResolvedValue(undefined),
        getPrimaryWallet: vi.fn().mockResolvedValue(wallet),
        getTransaction: vi.fn().mockResolvedValue(pendingTransaction),
    }
    const store = {
        listAllPendingTransactions: vi
            .fn()
            .mockResolvedValue([pendingTransaction]),
        getSessionForUser: vi.fn().mockResolvedValue(undefined),
        getNetwork: vi.fn().mockResolvedValue(m2mNetwork),
        withAuthContext: vi.fn().mockReturnValue(scopedStore),
        ...storeOverrides,
    }
    const logger = pino({ level: 'silent' }, sink())
    const createAccessTokenProvider = vi.fn(async () =>
        AuthTokenProvider.fromToken(m2mJwt(), logger)
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
        store,
        scopedStore,
        createAccessTokenProvider,
    }
}

describe('SigningWorker', () => {
    afterEach(() => vi.clearAllMocks())

    it('mints a session and completes pending external transactions', async () => {
        const { worker, store, createAccessTokenProvider } = createWorker()

        await worker.tick()

        expect(store.getSessionForUser).toHaveBeenCalledWith('user-1')
        expect(createAccessTokenProvider).toHaveBeenCalledWith(m2mNetwork)
        expect(mocks.signAndExecute).toHaveBeenCalled()
    })

    it('reuses a valid client-credentials session without minting', async () => {
        const session = {
            id: 'session-1',
            network: 'net-m2m',
            accessToken: m2mJwt(),
        }
        const { worker, scopedStore, createAccessTokenProvider } = createWorker(
            {
                getSessionForUser: vi.fn().mockResolvedValue(session),
            }
        )

        await worker.tick()

        expect(createAccessTokenProvider).not.toHaveBeenCalled()
        expect(scopedStore.setSession).toHaveBeenCalledWith(session)
        expect(mocks.signAndExecute).toHaveBeenCalled()
    })

    it('skips pending transactions without an externalTxId', async () => {
        const { worker } = createWorker({
            listAllPendingTransactions: vi
                .fn()
                .mockResolvedValue([
                    { ...pendingTransaction, externalTxId: undefined },
                ]),
        })

        await worker.tick()

        expect(mocks.signAndExecute).not.toHaveBeenCalled()
    })

    it('skips interactive networks without a stored session', async () => {
        const interactiveNetwork: Network = {
            ...m2mNetwork,
            id: 'net-interactive',
            auth: {
                method: 'authorization_code',
                clientId: 'app',
                audience: 'aud',
                scope: 'scope',
            },
        }
        const { worker } = createWorker({
            listAllPendingTransactions: vi
                .fn()
                .mockResolvedValue([
                    { ...pendingTransaction, networkId: 'net-interactive' },
                ]),
            getNetwork: vi.fn().mockResolvedValue(interactiveNetwork),
        })

        await worker.tick()

        expect(mocks.signAndExecute).not.toHaveBeenCalled()
    })
})
