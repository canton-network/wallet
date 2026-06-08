// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test, beforeEach } from 'vitest'
import { AuthContext } from '@canton-network/core-wallet-auth'
import { Kysely } from 'kysely'
import { pino } from 'pino'
import { migrator } from './migrator.js'
import { DB } from './schema.js'
import { connection, StoreSql } from './store-sql.js'

const userA: AuthContext = {
    userId: 'user-a',
    accessToken: 'token-a',
}

const userB: AuthContext = {
    userId: 'user-b',
    accessToken: 'token-b',
}

describe('StoreSql auth scoping', () => {
    let db: Kysely<DB>

    beforeEach(async () => {
        db = connection({ connection: { type: 'memory' } })
        const umzug = migrator(db)
        await umzug.up()
    })

    test('returns empty for getSigningKeyByPublicKey owned by another user', async () => {
        const storeWithoutAuth = new StoreSql(db, pino({ level: 'silent' }))
        await storeWithoutAuth.setSigningKey(userB.userId, {
            id: 'key-b',
            name: 'key-b',
            publicKey: 'user-b-public-key',
            privateKey: 'private-key-b',
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        const scopedStore = storeWithoutAuth.withAuthContext(userA)
        const key =
            await scopedStore.getSigningKeyByPublicKey('user-b-public-key')

        expect(key).toBeUndefined()
    })

    test('scopes getSigningKeyByPublicKey to authContext user', async () => {
        const storeWithoutAuth = new StoreSql(db, pino({ level: 'silent' }))
        await storeWithoutAuth.setSigningKey(userA.userId, {
            id: 'key-a',
            name: 'key-a',
            publicKey: 'shared-public-key',
            privateKey: 'private-key-a',
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        await storeWithoutAuth.setSigningKey(userB.userId, {
            id: 'key-b',
            name: 'key-b',
            publicKey: 'shared-public-key',
            privateKey: 'private-key-b',
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        const scopedStore = storeWithoutAuth.withAuthContext(userA)
        const key =
            await scopedStore.getSigningKeyByPublicKey('shared-public-key')

        expect(key?.id).toBe('key-a')
        expect(key?.privateKey).toBe('private-key-a')
    })

    test('scopes listSigningTransactionsByTxIdsAndPublicKeys to authContext user', async () => {
        const storeWithoutAuth = new StoreSql(db, pino({ level: 'silent' }))
        const now = new Date()

        await storeWithoutAuth.setSigningTransaction(userA.userId, {
            id: 'tx-a',
            hash: 'hash-a',
            publicKey: 'public-key-a',
            status: 'signed',
            createdAt: now,
            updatedAt: now,
        })
        await storeWithoutAuth.setSigningTransaction(userB.userId, {
            id: 'tx-b',
            hash: 'hash-b',
            publicKey: 'public-key-b',
            status: 'signed',
            createdAt: now,
            updatedAt: now,
        })

        const scopedStore = storeWithoutAuth.withAuthContext(userA)
        const transactions =
            await scopedStore.listSigningTransactionsByTxIdsAndPublicKeys(
                ['tx-a', 'tx-b'],
                []
            )

        expect(transactions).toHaveLength(1)
        expect(transactions[0]?.id).toBe('tx-a')
    })
})
