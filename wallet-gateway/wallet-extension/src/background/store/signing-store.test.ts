// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    createKeyPair,
    type SigningKey,
    type SigningTransaction,
} from '@canton-network/core-signing-lib'
import { beforeEach, describe, expect, it } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { createVault, type Vault, VaultLockedError } from '../vault'
import { createVaultSigningStore } from './signing-store'

const PASSWORD = 'first password 1'
const USER_ID = 'alice'

const signingKey = (id = 'key-1'): SigningKey => ({
    id,
    name: id,
    ...createKeyPair(),
    metadata: { purpose: 'test' },
    createdAt: new Date('2026-01-02T03:04:05.000Z'),
    updatedAt: new Date('2026-01-02T03:04:05.000Z'),
})

const signingTransaction = (publicKey: string): SigningTransaction => ({
    id: 'tx-1',
    hash: 'hash',
    signature: 'signature',
    publicKey,
    status: 'signed',
    createdAt: new Date('2026-01-02T03:05:00.000Z'),
    updatedAt: new Date('2026-01-02T03:05:00.000Z'),
    signedAt: new Date('2026-01-02T03:05:01.000Z'),
})

async function createdVault(): Promise<Vault> {
    const vault = createVault({ iterations: 1000 })
    await vault.ready
    await vault.create(PASSWORD)
    return vault
}

describe('createVaultSigningStore', () => {
    beforeEach(() => {
        fakeBrowser.reset()
    })

    it('keeps keys and transactions encrypted through a lock', async () => {
        const vault = await createdVault()
        const store = createVaultSigningStore(vault)
        const key = signingKey()
        const tx = signingTransaction(key.publicKey)
        await store.setSigningKey(USER_ID, key)
        await store.setSigningTransaction(USER_ID, tx)

        await vault.lock()
        await vault.unlock(PASSWORD)

        expect(await store.listSigningKeys(USER_ID)).toEqual([
            { ...key, updatedAt: expect.any(Date) },
        ])
        expect(await store.getSigningTransaction(USER_ID, tx.id)).toEqual({
            ...tx,
            updatedAt: expect.any(Date),
        })
        const stored = JSON.stringify(await fakeBrowser.storage.local.get())
        expect(stored).not.toContain(key.privateKey)
        expect(stored).not.toContain('signingKeys')
        expect(stored).not.toContain('signingTransactions')
    })

    it('keeps every key written concurrently', async () => {
        const store = createVaultSigningStore(await createdVault())
        const ids = ['key-1', 'key-2', 'key-3', 'key-4', 'key-5']

        await Promise.all(
            ids.map((id) => store.setSigningKey(USER_ID, signingKey(id)))
        )

        const keys = await store.listSigningKeys(USER_ID)
        expect(keys.map((key) => key.id).sort()).toEqual(ids)
    })

    it('rejects while locked and loses its data on reset', async () => {
        const vault = await createdVault()
        const store = createVaultSigningStore(vault)
        await store.setSigningKey(USER_ID, signingKey())

        await vault.lock()
        await expect(store.listSigningKeys(USER_ID)).rejects.toThrow(
            VaultLockedError
        )
        await expect(
            store.setSigningKey(USER_ID, signingKey('key-2'))
        ).rejects.toThrow(VaultLockedError)
        await expect(
            store.listSigningTransactionsByTxIdsAndPublicKeys([], [])
        ).rejects.toThrow(VaultLockedError)

        await vault.unlock(PASSWORD)
        expect(
            await store.listSigningTransactionsByTxIdsAndPublicKeys([], [])
        ).toEqual([])

        await vault.reset()
        await vault.create(PASSWORD)
        expect(await store.listSigningKeys(USER_ID)).toEqual([])
    })
})
