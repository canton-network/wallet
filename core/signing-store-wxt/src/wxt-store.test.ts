// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    SigningDriverConfig,
    SigningKey,
    SigningTransaction,
} from '@canton-network/core-signing-lib'
import { describe, expect, beforeEach, it } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { WxtStore } from './wxt-store.js'
import {
    signingKeyIndexItem,
    publicKeyIndexItem,
    nameIndexItem,
} from './schemas.js'

describe('storage wxt', () => {
    beforeEach(() => {
        fakeBrowser.reset()
    })
    const t0 = new Date('2024-01-01T00:00:00.000Z')
    const t1 = new Date('2024-01-02T00:00:00.000Z')
    const t2 = new Date('2024-01-03T00:00:00.000Z')

    const createMockKey = (
        id: string,
        name: string,
        publicKey: string
    ): SigningKey => {
        return {
            id,
            name,
            publicKey,
            privateKey: 'priv-key-456',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }
    }

    const makeTx = (
        overrides: Partial<SigningTransaction> &
            Pick<SigningTransaction, 'id' | 'hash' | 'publicKey'>
    ): SigningTransaction => ({
        status: 'pending',
        createdAt: t0,
        updatedAt: t0,
        ...overrides,
    })
    const userId = 'user-1'

    it('should successfully save and retrieve a signing key', async () => {
        const store = new WxtStore(userId)
        const mockKey = createMockKey('key1', 'key1', 'pubkey-123')
        await store.setSigningKey(userId, mockKey)

        const retrieved = await store.getSigningKey(userId, 'key1')
        expect(retrieved).toBeDefined()
        expect(retrieved?.id).toBe(mockKey.id)
        expect(retrieved?.publicKey).toBe(mockKey.publicKey)

        const index = await signingKeyIndexItem().getValue()
        expect(index).toContain('key1')

        const mappedId = await publicKeyIndexItem('pubkey-123').getValue()
        expect(mappedId).toBe('key1')
    })

    it('should successfully delete a signing key and clean up indexes', async () => {
        const store = new WxtStore(userId)
        const mockKey = createMockKey('key1', 'key1', 'pubkey-123')
        await store.setSigningKey(userId, mockKey)

        await store.deleteSigningKey(userId, 'key1')

        const retrieved = await store.getSigningKey(userId, 'key1')
        expect(retrieved).toBeUndefined()

        const index = await signingKeyIndexItem().getValue()
        expect(index).not.toContain('key1')

        const publicKeyMapping =
            await publicKeyIndexItem('pubkey-123').getValue()
        expect(publicKeyMapping).toBeNull()

        const nameMapping = await nameIndexItem('Primary Key').getValue()
        expect(nameMapping).toBeNull()
    })

    it('should get signing key by various filters', async () => {
        const store = new WxtStore(userId)
        const mockKey1 = createMockKey('key1', 'key1', 'pubkey-123')
        const mockKey2 = createMockKey('key2', 'key2', 'pubkey-456')
        await store.setSigningKeys(userId, [mockKey1, mockKey2])

        const retrievedKeyByPublicKey =
            await store.getSigningKeyByPublicKey('pubkey-456')

        expect(retrievedKeyByPublicKey).toBeDefined()
        expect(retrievedKeyByPublicKey?.id).toBe(mockKey2.id)
        expect(retrievedKeyByPublicKey?.name).toBe(mockKey2.name)
        expect(retrievedKeyByPublicKey?.publicKey).toBe(mockKey2.publicKey)

        const retrievedKeyByName = await store.getSigningKeyByName(
            'user-1',
            'key1'
        )

        expect(retrievedKeyByName).toBeDefined()
        expect(retrievedKeyByName?.id).toBe(mockKey1.id)
        expect(retrievedKeyByName?.name).toBe(mockKey1.name)
        expect(retrievedKeyByName?.publicKey).toBe(mockKey1.publicKey)

        const allSigningKeys = await store.listSigningKeys(userId)
        expect(allSigningKeys.length).toBe(2)
        expect(allSigningKeys.map((x) => x.id)).toEqual(
            [mockKey1, mockKey2].map((x) => x.id)
        )
    })

    it('sets, gets, and lists transactionss', async () => {
        const store = new WxtStore(userId)
        const tx = makeTx({
            id: 'tx-1',
            hash: 'hash-1',
            publicKey: 'pub-tx',
            status: 'pending',
            metadata: { note: 'test' },
        })

        await store.setSigningTransaction(userId, tx)
        expect(await store.getSigningTransaction(userId, 'tx-1')).toMatchObject(
            {
                id: tx.id,
                hash: tx.hash,
                status: 'pending',
                metadata: tx.metadata,
            }
        )

        const listed = await store.listSigningTransactions(userId, 10)
        expect(listed).toHaveLength(1)
    })

    it('upserts transactions and preserves bulk updates via setSigningTransactions', async () => {
        const store = new WxtStore(userId)
        const tx = makeTx({
            id: 'tx-upsert',
            hash: 'h1',
            publicKey: 'pub',
        })
        await store.setSigningTransaction(userId, tx)
        await store.setSigningTransaction(userId, {
            ...tx,
            hash: 'h2',
            signature: 'sig',
            status: 'signed',
            signedAt: t1,
            updatedAt: t1,
        })

        const updated = await store.getSigningTransaction(userId, 'tx-upsert')
        expect(updated?.hash).toBe('h2')
        expect(updated?.signature).toBe('sig')
        expect(updated?.status).toBe('signed')

        await store.setSigningTransactions(userId, [])
        await store.setSigningTransactions(userId, [
            makeTx({
                id: 'bulk-tx',
                hash: 'bh',
                publicKey: 'bp',
                createdAt: t1,
                updatedAt: t1,
            }),
        ])
        expect(
            await store.getSigningTransaction(userId, 'bulk-tx')
        ).toBeDefined()
    })

    it('updates signing transaction status', async () => {
        const store = new WxtStore(userId)
        const tx = makeTx({
            id: 'tx-status change',
            hash: 'h1',
            publicKey: 'pub',
        })
        await store.setSigningTransaction(userId, {
            ...tx,
            status: 'pending',
        })

        const pending = await store.getSigningTransaction(userId, tx.id)
        expect(pending?.status).toBe('pending')

        await store.updateSigningTransactionStatus(userId, tx.id, 'signed')
        const signed = await store.getSigningTransaction(userId, tx.id)
        expect(signed?.status).toBe('signed')
    })

    it('listSigningTransactions respects limit and before param', async () => {
        const store = new WxtStore(userId)
        await store.setSigningTransaction(
            userId,
            makeTx({
                id: 'tx-old',
                hash: 'h1',
                publicKey: 'p',
                createdAt: t0,
                updatedAt: t0,
            })
        )
        await store.setSigningTransaction(
            userId,
            makeTx({
                id: 'tx-new',
                hash: 'h2',
                publicKey: 'p',
                createdAt: t2,
                updatedAt: t2,
            })
        )

        expect(await store.listSigningTransactions(userId, 1)).toHaveLength(1)

        const page2 = await store.listSigningTransactions(userId, 10, 'tx-new')
        expect(page2.map((t) => t.id)).toEqual(['tx-old'])
    })

    it('listSigningTransactionsByTxIdsAndPublicKeys matches ids or public keys', async () => {
        const store = new WxtStore(userId)
        await store.setSigningTransaction(
            userId,
            makeTx({ id: 'by-id', hash: 'h1', publicKey: 'pub-a' })
        )
        await store.setSigningTransaction(
            userId,
            makeTx({ id: 'by-pub', hash: 'h2', publicKey: 'pub-b' })
        )
        await store.setSigningTransaction(
            userId,
            makeTx({ id: 'other', hash: 'h3', publicKey: 'pub-c' })
        )

        const found = await store.listSigningTransactionsByTxIdsAndPublicKeys(
            ['by-id'],
            ['pub-b']
        )
        expect(found.map((t) => t.id).sort()).toEqual(['by-id', 'by-pub'])
    })

    it('sets and retrieves driver configuration with upsert', async () => {
        const store = new WxtStore(userId)
        const config: SigningDriverConfig = {
            driverId: 'driver-id',
            config: { property: true },
        }

        await store.setSigningDriverConfiguration(userId, config)
        expect(
            await store.getSigningDriverConfiguration(userId, 'driver-id')
        ).toEqual(config)

        await store.setSigningDriverConfiguration(userId, {
            driverId: 'driver-id',
            config: { property: false },
        })
        expect(
            await store.getSigningDriverConfiguration(userId, 'driver-id')
        ).toEqual({ driverId: 'driver-id', config: { property: false } })

        expect(
            await store.getSigningDriverConfiguration(userId, 'missing')
        ).toBeUndefined()
    })
})
