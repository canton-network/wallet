// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    Session,
    Transaction,
    Wallet,
} from '@canton-network/core-wallet-store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { authContext } from '../auth-context'
import { createVault, type Vault, VaultLockedError } from '../vault'
import { loadAuthedStore } from './index'
import { createWalletStore } from './wallet-store'

const PASSWORD = 'first password 1'
const CONTEXT = { userId: 'alice', accessToken: 'alice-token' }
const NETWORK_ID = 'canton:local-oauth'

// The store finds the current network through the session with this token.
const SESSION: Session = {
    id: 'session-1',
    origin: 'popup',
    network: NETWORK_ID,
    accessToken: CONTEXT.accessToken,
}

// Factories, because the store keeps and changes the objects it's given.
const wallet = (): Wallet => ({
    primary: true,
    status: 'allocated',
    partyId: 'alice::1220',
    hint: 'alice',
    publicKey: 'public-key',
    namespace: '1220',
    networkId: NETWORK_ID,
    signingProviderId: 'wallet-kernel',
    rights: [],
    userId: CONTEXT.userId,
})

const transaction = (id = 'tx-1'): Transaction => ({
    id,
    status: 'signed',
    commandId: 'command-1',
    preparedTransaction: 'prepared',
    preparedTransactionHash: 'hash',
    origin: 'https://dapp.example',
    createdAt: new Date('2026-01-02T03:04:05.000Z'),
    signedAt: new Date('2026-01-02T03:05:00.000Z'),
})

/** Starts a vault on the fake storage, the way the background does. */
async function startVault(): Promise<Vault> {
    const vault = createVault({ iterations: 1000 })
    await vault.ready
    return vault
}

async function createdVault(): Promise<Vault> {
    const vault = await startVault()
    await vault.create(PASSWORD)
    return vault
}

/** Wraps `vault` so `afterRead` runs each time an item read resolves. */
function withReadHook(vault: Vault, afterRead: () => void): Vault {
    return {
        ...vault,
        defineItem<T>(key: string, opts: { fallback: T }) {
            const item = vault.defineItem(key, opts)
            return {
                ...item,
                getValue: async () => {
                    const value = await item.getValue()
                    afterRead()
                    return value
                },
            }
        },
    }
}

const snapshotIn = (vault: Vault) =>
    vault.defineItem('walletStore', { fallback: null }).getValue()

describe('createWalletStore', () => {
    beforeEach(() => {
        fakeBrowser.reset()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('returns the same data after a worker restart', async () => {
        const vault = await createdVault()
        const store = (await createWalletStore(vault).get()).withAuthContext(
            CONTEXT
        )
        await store.setSession(SESSION)
        await store.addWallet(wallet())
        await store.setTransaction(transaction())

        // Session storage still has the key, so this vault restores unlocked,
        // as it would after a service worker restart.
        const restarted = await startVault()
        const reread = (
            await createWalletStore(restarted).get()
        ).withAuthContext(CONTEXT)

        expect(await reread.getSession(CONTEXT.accessToken)).toEqual({
            ...SESSION,
            userId: CONTEXT.userId,
        })
        expect(await reread.getWallets()).toEqual([wallet()])
        const read = await reread.getTransaction('tx-1')
        expect(read?.createdAt).toBeInstanceOf(Date)
        expect(read?.signedAt).toBeInstanceOf(Date)
        expect(read).toEqual(transaction())
    })

    it('starts a new vault with the local network and the mock IdP', async () => {
        const store = await createWalletStore(await createdVault()).get()

        expect((await store.listNetworks()).map(({ id }) => id)).toEqual([
            NETWORK_ID,
        ])
        expect((await store.listIdps()).map(({ id }) => id)).toEqual([
            'idp-mock-oauth',
        ])
    })

    it('refuses the store while locked and drops writes from before the lock', async () => {
        const vault = await createdVault()
        const holder = createWalletStore(vault)
        const store = (await holder.get()).withAuthContext(CONTEXT)

        await vault.lock()

        await expect(holder.get()).rejects.toThrow(VaultLockedError)
        await expect(store.addWallet(wallet())).rejects.toThrow(
            VaultLockedError
        )

        await vault.unlock(PASSWORD)
        const reread = (await holder.get()).withAuthContext(CONTEXT)
        expect(await reread.getAllWallets()).toEqual([])
        expect(await snapshotIn(vault)).toBeNull()
    })

    it('rejects reads from a store kept from before a lock', async () => {
        const vault = await createdVault()
        const unscoped = await createWalletStore(vault).get()
        const store = unscoped.withAuthContext(CONTEXT)
        await store.setTransaction(transaction())

        await vault.lock()

        await expect(store.getTransaction('tx-1')).rejects.toThrow(
            VaultLockedError
        )
        expect(() => unscoped.withAuthContext(CONTEXT)).toThrow(
            VaultLockedError
        )
    })

    it('rejects a store that a lock() interrupts while it is scoped', async () => {
        const vault = await createdVault()
        const holder = createWalletStore(vault)
        const loading = Promise.withResolvers<void>()
        const released = Promise.withResolvers<void>()
        vi.spyOn(authContext, 'load').mockImplementation(async () => {
            loading.resolve()
            await released.promise
            return CONTEXT
        })
        // The same getStore() as in background/index.ts.
        const getStore = async () => loadAuthedStore(await holder.get())

        const store = getStore()
        await loading.promise
        await vault.lock()
        released.resolve()

        await expect(store).rejects.toThrow(VaultLockedError)
    })

    it('drops writes from a store built before a reset', async () => {
        const vault = await createdVault()
        const holder = createWalletStore(vault)
        const store = (await holder.get()).withAuthContext(CONTEXT)

        await vault.reset()
        await vault.create(PASSWORD)

        await expect(store.addWallet(wallet())).rejects.toThrow(
            VaultLockedError
        )
        const reread = (await holder.get()).withAuthContext(CONTEXT)
        expect(await reread.getAllWallets()).toEqual([])
        expect(await snapshotIn(vault)).toBeNull()
    })

    it('builds one store for concurrent first calls', async () => {
        const afterRead = vi.fn()
        const holder = createWalletStore(
            withReadHook(await createdVault(), afterRead)
        )

        const [first, second] = await Promise.all([holder.get(), holder.get()])

        expect(first).toBe(second)
        expect(afterRead).toHaveBeenCalledOnce()
    })

    it('rejects a build that a lock() interrupts and builds again after unlock', async () => {
        const vault = await createdVault()
        let locking: Promise<void> | undefined
        const holder = createWalletStore(
            withReadHook(vault, () => {
                locking ??= vault.lock()
            })
        )

        // The hook locks after the read resolves, before the build continues.
        await expect(holder.get()).rejects.toThrow(VaultLockedError)
        await locking

        await vault.unlock(PASSWORD)
        const store = (await holder.get()).withAuthContext(CONTEXT)
        await store.addWallet(wallet())
        expect(await store.getAllWallets()).toEqual([wallet()])
    })

    it('rebuilds from the vault after a failed write', async () => {
        const vault = await createdVault()
        const holder = createWalletStore(vault)
        const store = (await holder.get()).withAuthContext(CONTEXT)
        await store.setTransaction(transaction())
        vi.spyOn(fakeBrowser.storage.local, 'set').mockRejectedValueOnce(
            new Error('quota exceeded')
        )

        await expect(store.addWallet(wallet())).rejects.toThrow(
            'quota exceeded'
        )

        // Not VaultLockedError, or the pages would show the unlock page.
        const error = await store
            .removeTransaction('tx-1')
            .catch((error: unknown) => error)
        expect(error).not.toBeInstanceOf(VaultLockedError)
        expect(error).toMatchObject({
            message: 'The wallet store was reloaded after a failed write.',
        })

        const reread = (await holder.get()).withAuthContext(CONTEXT)
        expect(await reread.getAllWallets()).toEqual([])
        expect(await reread.getTransaction('tx-1')).toEqual(transaction())
    })

    it('rejects a write queued behind a failed write without running it', async () => {
        const vault = await createdVault()
        const holder = createWalletStore(vault)
        const store = (await holder.get()).withAuthContext(CONTEXT)
        vi.spyOn(fakeBrowser.storage.local, 'set').mockRejectedValueOnce(
            new Error('quota exceeded')
        )

        const [failed, queued] = await Promise.allSettled([
            store.setTransaction(transaction('tx-1')),
            store.setTransaction(transaction('tx-2')),
        ])

        expect(failed).toMatchObject({
            status: 'rejected',
            reason: { message: 'quota exceeded' },
        })
        expect(queued).toMatchObject({
            status: 'rejected',
            reason: {
                message: 'The wallet store was reloaded after a failed write.',
            },
        })
        expect(await snapshotIn(vault)).toBeNull()
        const reread = (await holder.get()).withAuthContext(CONTEXT)
        expect(await reread.transactionsCount()).toBe(0)
    })

    it('keeps a failed removal off disk when the write before it succeeds', async () => {
        const vault = await createdVault()
        const holder = createWalletStore(vault)
        const store = (await holder.get()).withAuthContext(CONTEXT)
        await store.setTransaction(transaction('keep'))
        const local = fakeBrowser.storage.local
        const set = local.set.bind(local)
        vi.spyOn(local, 'set')
            .mockImplementationOnce(set)
            .mockRejectedValueOnce(new Error('quota exceeded'))

        const [added, removed] = await Promise.allSettled([
            store.setTransaction(transaction('new')),
            store.removeTransaction('keep'),
        ])

        expect(added.status).toBe('fulfilled')
        expect(removed).toMatchObject({
            status: 'rejected',
            reason: { message: 'quota exceeded' },
        })
        const reread = (await holder.get()).withAuthContext(CONTEXT)
        expect(await reread.getTransaction('keep')).toEqual(transaction('keep'))
        expect(await reread.getTransaction('new')).toEqual(transaction('new'))
    })

    it('does not save a write that throws, and keeps the store open', async () => {
        const vault = await createdVault()
        const store = (await createWalletStore(vault).get()).withAuthContext(
            CONTEXT
        )

        await expect(
            store.setTransactionStatus('missing', 'signed')
        ).rejects.toThrow('Transaction not found')
        expect(await snapshotIn(vault)).toBeNull()

        await store.setTransaction(transaction())
        expect(await snapshotIn(vault)).not.toBeNull()
    })
})
