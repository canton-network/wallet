// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'
import { pino } from 'pino'
import { sink } from 'pino-test'
import { SigningWorker } from './signing-worker.js'
import type { Network, Transaction } from '@canton-network/core-wallet-store'
import type { Idp } from '@canton-network/core-wallet-auth'
import { SigningProvider } from '@canton-network/core-signing-lib'

const mocks = vi.hoisted(() => ({
    signAndExecute: vi.fn().mockResolvedValue({ commandId: 'cmd-1' }),
}))

vi.mock('@canton-network/core-wallet-auth', async () => {
    const actual = await vi.importActual<
        typeof import('@canton-network/core-wallet-auth')
    >('@canton-network/core-wallet-auth')
    return {
        ...actual,
        AuthTokenProvider: {
            fromGatewayConfig: vi.fn().mockReturnValue({
                getAuthContext: vi.fn().mockResolvedValue({
                    userId: 'service_account',
                    accessToken: 'abc',
                }),
            }),
        },
    }
})

vi.mock('../ledger/transaction-service.js', () => ({
    TransactionService: vi.fn(function TransactionServiceMock() {
        return { signAndExecute: mocks.signAndExecute }
    }),
}))

const idp: Idp = {
    id: 'idp1',
    type: 'oauth',
    issuer: 'https://issuer.example',
    configUrl: 'https://issuer.example/.well-known/openid-configuration',
}

const m2mNetwork: Network = {
    id: 'net-m2m',
    name: 'm2m',
    description: '',
    synchronizerId: 'sync::fp',
    identityProviderId: 'idp1',
    ledgerApi: { baseUrl: 'http://ledger' },
    auth: {
        method: 'authorization_code',
        clientId: 'user',
        audience: 'aud',
        scope: 'scope',
    },
    serviceAccountAuth: {
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

const aliceWallet = {
    primary: false,
    partyId: 'alice::ns2',
    status: 'allocated' as const,
    hint: 'alice',
    publicKey: 'pk2',
    namespace: 'ns2',
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

function createWorker(
    storeOverrides: {
        listAllPendingTransactions?: ReturnType<typeof vi.fn>
        getNetwork?: ReturnType<typeof vi.fn>
        withAuthContext?: ReturnType<typeof vi.fn>
    } = {}
) {
    const scopedStore = {
        setSession: vi.fn().mockResolvedValue(undefined),
        getPrimaryWallet: vi.fn().mockResolvedValue(wallet),
        getAllWallets: vi.fn().mockResolvedValue([wallet, aliceWallet]),
        getTransaction: vi.fn().mockResolvedValue(pendingTransaction),
    }
    const store = {
        listAllPendingTransactions: vi
            .fn()
            .mockResolvedValue([pendingTransaction]),
        getIdp: vi.fn().mockResolvedValue(idp),
        getNetwork: vi.fn().mockResolvedValue(m2mNetwork),
        withAuthContext: vi.fn().mockReturnValue(scopedStore),
        ...storeOverrides,
    }
    const logger = pino({ level: 'silent' }, sink())

    return {
        worker: new SigningWorker({
            intervalMs: 1000,
            signingDrivers: {},
            store: store as never,
            notificationService: {
                getNotifier: vi.fn(() => ({ emit: vi.fn() })),
            } as never,
            logger,
        }),
        store,
        scopedStore,
    }
}

describe('SigningWorker', () => {
    afterEach(() => vi.clearAllMocks())

    it('completes pending external transactions with a primary wallet', async () => {
        const { worker } = createWorker()

        await worker.tick()

        expect(mocks.signAndExecute.mock.calls[0][2].partyId).toBe('party::ns')
    })

    it('uses a non-primary wallet when actAs payload is present', async () => {
        const { worker } = createWorker({
            listAllPendingTransactions: vi.fn().mockResolvedValue([
                {
                    ...pendingTransaction,
                    payload: { actAs: ['alice::ns2'] },
                },
            ]),
        })

        await worker.tick()

        expect(mocks.signAndExecute).toHaveBeenCalledOnce()
        expect(mocks.signAndExecute.mock.calls[0][2].partyId).toBe('alice::ns2')
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
})
