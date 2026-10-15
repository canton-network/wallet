// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    type Mock,
    vi,
} from 'vitest'
import type {
    Network,
    Store,
    Transaction,
    Wallet,
} from '@canton-network/core-wallet-store'
import { SigningProvider } from '@canton-network/core-signing-lib'
import {
    SigningWorker,
    type SigningWorkerRunContext,
    type SigningWorkerRunContextResolver,
} from './signing-worker.js'
import { TransactionService } from './transaction-service.js'
import type { Notifier } from './notification/index.js'
import { initializeLogRecorder } from './__tests__/test-utils.js'

const mocks = vi.hoisted(() => ({
    signAndExecute: vi.fn(),
}))

vi.mock('./transaction-service.js', () => ({
    TransactionService: vi.fn(function TransactionServiceMock() {
        return { signAndExecute: mocks.signAndExecute }
    }),
}))

const recorder = await initializeLogRecorder()

const network: Network = {
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

const wallet: Wallet = {
    primary: true,
    partyId: 'party::ns',
    userId: 'user-1',
    status: 'allocated',
    hint: 'party',
    publicKey: 'pk',
    namespace: 'ns',
    networkId: 'net-m2m',
    signingProviderId: SigningProvider.FIREBLOCKS,
    rights: [],
}

const aliceWallet: Wallet = {
    primary: false,
    partyId: 'alice::ns2',
    userId: 'user-1',
    status: 'allocated',
    hint: 'alice',
    publicKey: 'pk2',
    namespace: 'ns2',
    networkId: 'net-m2m',
    signingProviderId: SigningProvider.FIREBLOCKS,
    rights: [],
}

const transactionWithoutExternalTxId: Transaction = {
    id: 'tx-1',
    commandId: 'cmd-1',
    status: 'awaiting-signature',
    preparedTransaction: 'blob',
    preparedTransactionHash: 'hash',
    origin: null,
    userId: 'user-1',
    networkId: 'net-m2m',
}

const pendingTransaction: Transaction = {
    ...transactionWithoutExternalTxId,
    externalTxId: 'ext-1',
}

const secondTransaction: Transaction = {
    ...pendingTransaction,
    id: 'tx-2',
    commandId: 'cmd-2',
    externalTxId: 'ext-2',
}

const authContext = { userId: 'service_account', accessToken: 'abc' }
const signingDrivers = {}

function createDeferred<T>() {
    let resolve!: (value: T) => void
    const promise = new Promise<T>((res) => {
        resolve = res
    })
    return { promise, resolve }
}

function createScopedStore(overrides: Record<string, unknown> = {}) {
    return {
        getPrimaryWallet: vi.fn().mockResolvedValue(wallet),
        getAllWallets: vi.fn().mockResolvedValue([wallet, aliceWallet]),
        getTransaction: vi.fn().mockImplementation(async (id: string) => ({
            ...pendingTransaction,
            id,
        })),
        ...overrides,
    }
}

function createWorker(
    options: {
        pending?: Transaction[]
        listAllPendingTransactions?: Mock<() => Promise<Transaction[]>>
        scopedStore?: ReturnType<typeof createScopedStore>
        resolveRunContext?: SigningWorkerRunContextResolver
    } = {}
) {
    const scopedStore = options.scopedStore ?? createScopedStore()
    const notifier = { emit: vi.fn() } as unknown as Notifier
    const runContext: SigningWorkerRunContext = {
        authContext,
        store: scopedStore as unknown as Store,
        network,
        notifier,
    }
    const store = {
        listAllPendingTransactions:
            options.listAllPendingTransactions ??
            vi
                .fn<() => Promise<Transaction[]>>()
                .mockResolvedValue(options.pending ?? [pendingTransaction]),
    }
    const resolveRunContext = vi.fn(
        options.resolveRunContext ?? (async () => runContext)
    )

    return {
        worker: new SigningWorker({
            intervalMs: 1000,
            store,
            resolveRunContext,
            signingDrivers,
            hashingSchemeVersion: 'HASHING_SCHEME_VERSION_V3',
        }),
        store,
        scopedStore,
        notifier,
        resolveRunContext,
    }
}

type WorkerContext = ReturnType<typeof createWorker>

describe('SigningWorker', () => {
    beforeEach(() => {
        recorder.clear()
        vi.mocked(TransactionService).mockClear()
        mocks.signAndExecute.mockReset()
        mocks.signAndExecute.mockResolvedValue({ commandId: 'cmd-1' })
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('completes pending external transactions with the primary wallet', async () => {
        const { worker } = createWorker()

        await worker.tick()

        expect(mocks.signAndExecute).toHaveBeenCalledOnce()
        expect(mocks.signAndExecute.mock.calls[0][2]).toBe(wallet)
        const record = recorder.find({
            level: 'info',
            message: 'Signing worker completed service account transaction',
        })
        expect(record?.properties).toMatchObject({
            transactionId: 'tx-1',
            partyId: 'party::ns',
            result: { commandId: 'cmd-1' },
        })
    })

    it('uses the actAs wallet when the payload names one', async () => {
        const { worker } = createWorker({
            pending: [
                { ...pendingTransaction, payload: { actAs: ['alice::ns2'] } },
            ],
        })

        await worker.tick()

        expect(mocks.signAndExecute.mock.calls[0][2]).toBe(aliceWallet)
    })

    it('falls back to the primary wallet when no wallet matches actAs', async () => {
        const { worker } = createWorker({
            pending: [
                { ...pendingTransaction, payload: { actAs: ['bob::ns3'] } },
            ],
        })

        await worker.tick()

        expect(mocks.signAndExecute.mock.calls[0][2]).toBe(wallet)
    })

    it('skips pending transactions without an externalTxId', async () => {
        const { worker, resolveRunContext } = createWorker({
            pending: [transactionWithoutExternalTxId],
        })

        await worker.tick()

        expect(resolveRunContext).not.toHaveBeenCalled()
        expect(mocks.signAndExecute).not.toHaveBeenCalled()
    })

    it('passes the transaction with userId and networkId to the resolver', async () => {
        const { worker, resolveRunContext } = createWorker()

        await worker.tick()

        expect(resolveRunContext).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'tx-1',
                userId: 'user-1',
                networkId: 'net-m2m',
            })
        )
    })

    it('skips when the resolver returns no run context', async () => {
        const { worker, scopedStore } = createWorker({
            resolveRunContext: async () => undefined,
        })

        await worker.tick()

        expect(scopedStore.getTransaction).not.toHaveBeenCalled()
        expect(TransactionService).not.toHaveBeenCalled()
        recorder.assertLogged({
            level: 'debug',
            message: 'Skipping signing worker tick: no run context',
            properties: { transactionId: 'tx-1' },
        })
    })

    it('skips when the re-read transaction is no longer pending', async () => {
        const scopedStore = createScopedStore({
            getTransaction: vi.fn().mockResolvedValue({
                ...pendingTransaction,
                status: 'executed',
            }),
        })
        const { worker } = createWorker({ scopedStore })

        await worker.tick()

        expect(mocks.signAndExecute).not.toHaveBeenCalled()
        recorder.assertLogged({
            level: 'debug',
            message:
                'Skipping signing worker tick: transaction no longer pending',
            properties: { transactionId: 'tx-1', status: 'executed' },
        })
    })

    it('skips when the submitting wallet cannot be resolved', async () => {
        const scopedStore = createScopedStore({
            getPrimaryWallet: vi.fn().mockResolvedValue(undefined),
        })
        const { worker } = createWorker({ scopedStore })

        await worker.tick()

        expect(scopedStore.getTransaction).not.toHaveBeenCalled()
        expect(mocks.signAndExecute).not.toHaveBeenCalled()
        recorder.assertLogged({
            level: 'warning',
            message:
                'Skipping signing worker tick: could not deduce submitting wallet from transaction payload',
            properties: {
                userId: 'user-1',
                networkId: 'net-m2m',
                transactionId: 'tx-1',
                commandId: 'cmd-1',
            },
        })
    })

    it('logs a pending result as still awaiting external signing', async () => {
        mocks.signAndExecute.mockResolvedValue({
            status: 'pending',
            externalTxId: 'ext-1',
        })
        const { worker } = createWorker()

        await worker.tick()

        recorder.assertLogged({
            level: 'info',
            message:
                'Signing worker: transaction still awaiting external signing',
            properties: {
                transactionId: 'tx-1',
                externalTxId: 'ext-1',
                signingProviderId: SigningProvider.FIREBLOCKS,
            },
        })
        recorder.assertNotLogged({ level: 'error' })
    })

    it('continues with the next row when signAndExecute fails', async () => {
        const error = new Error('boom')
        mocks.signAndExecute
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce({ commandId: 'cmd-2' })
        const { worker } = createWorker({
            pending: [pendingTransaction, secondTransaction],
        })

        await worker.tick()

        expect(mocks.signAndExecute).toHaveBeenCalledTimes(2)
        recorder.assertLogged({
            level: 'error',
            message:
                'Signing worker failed to complete service account transaction',
            properties: { err: error, transactionId: 'tx-1' },
        })
        recorder.assertLogged({
            level: 'info',
            message: 'Signing worker completed service account transaction',
            properties: { transactionId: 'tx-2' },
        })
    })

    it.each([
        {
            stage: 'resolving the run context',
            fail: (ctx: WorkerContext, error: Error) =>
                ctx.resolveRunContext.mockRejectedValueOnce(error),
        },
        {
            stage: 'resolving the wallet',
            fail: (ctx: WorkerContext, error: Error) =>
                ctx.scopedStore.getPrimaryWallet.mockRejectedValueOnce(error),
        },
        {
            stage: 're-reading the transaction',
            fail: (ctx: WorkerContext, error: Error) =>
                ctx.scopedStore.getTransaction.mockRejectedValueOnce(error),
        },
    ])('continues with the next row when $stage fails', async ({ fail }) => {
        const error = new Error('lookup failed')
        const ctx = createWorker({
            pending: [pendingTransaction, secondTransaction],
        })
        fail(ctx, error)

        await ctx.worker.tick()

        expect(mocks.signAndExecute).toHaveBeenCalledOnce()
        expect(mocks.signAndExecute.mock.calls[0][3].id).toBe('tx-2')
        recorder.assertLogged({
            level: 'error',
            message: 'Signing worker failed to process pending transaction',
            properties: { err: error, transactionId: 'tx-1' },
        })
    })

    it('logs a failed listing and resets the running flag', async () => {
        const error = new Error('db down')
        const listAllPendingTransactions = vi
            .fn<() => Promise<Transaction[]>>()
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce([pendingTransaction])
        const { worker } = createWorker({ listAllPendingTransactions })

        await expect(worker.tick()).resolves.toBeUndefined()

        recorder.assertLogged({
            level: 'error',
            message: 'Signing worker tick failed',
            properties: { err: error },
        })

        await worker.tick()

        expect(listAllPendingTransactions).toHaveBeenCalledTimes(2)
        expect(mocks.signAndExecute).toHaveBeenCalledOnce()
    })

    it('ignores a tick started while another tick is in flight', async () => {
        const deferred = createDeferred<Transaction[]>()
        const listAllPendingTransactions = vi
            .fn<() => Promise<Transaction[]>>()
            .mockReturnValue(deferred.promise)
        const { worker } = createWorker({ listAllPendingTransactions })

        const first = worker.tick()
        await worker.tick()

        expect(listAllPendingTransactions).toHaveBeenCalledOnce()

        deferred.resolve([pendingTransaction])
        await first

        expect(mocks.signAndExecute).toHaveBeenCalledOnce()
    })

    it('builds TransactionService with the scoped store and notifier from the resolver', async () => {
        const { worker, scopedStore, notifier } = createWorker()

        await worker.tick()

        expect(TransactionService).toHaveBeenCalledExactlyOnceWith(
            scopedStore,
            signingDrivers,
            notifier,
            'HASHING_SCHEME_VERSION_V3'
        )
        expect(mocks.signAndExecute).toHaveBeenCalledWith(
            authContext,
            network,
            wallet,
            expect.objectContaining({
                id: 'tx-1',
                status: 'awaiting-signature',
            })
        )
    })

    it('starts a single timer when start() is called twice and stop() clears it', async () => {
        vi.useFakeTimers()
        const { worker, store } = createWorker({ pending: [] })

        worker.start()
        worker.start()

        expect(
            recorder.filter({ message: 'Signing worker started' })
        ).toHaveLength(1)

        await vi.advanceTimersByTimeAsync(1000)
        expect(store.listAllPendingTransactions).toHaveBeenCalledOnce()

        worker.stop()

        await vi.advanceTimersByTimeAsync(5000)
        expect(store.listAllPendingTransactions).toHaveBeenCalledOnce()
    })
})
