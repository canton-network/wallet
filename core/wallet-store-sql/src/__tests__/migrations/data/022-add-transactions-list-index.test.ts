// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from 'vitest'
import { sql } from 'kysely'

import {
    forEachDialect,
    indexExists,
    migrateDownThrough,
    migrateUpThrough,
    migrateUpToBefore,
} from '../helpers'
import { insertIdp, insertNetwork } from '../seeds/001-init'
import { insertTransaction } from '../seeds/016-add-failure-reason-and-awaiting-signature'

const TARGET = 22
const TABLE = 'transactions'
const INDEX_NAME = 'idx_transactions_user_network_created_at_id'

forEachDialect('migration 022 - transactions list index', ({ getDb }) => {
    test('creates the list index and keeps existing rows', async () => {
        const db = getDb()
        await migrateUpToBefore(db, TARGET)
        expect(await indexExists(db, TABLE, INDEX_NAME)).toBe(false)

        await insertIdp(db, { id: 'idp1' })
        await insertNetwork(db, { id: 'net1', idpId: 'idp1' })
        await insertTransaction(db, {
            id: 'tx-1',
            commandId: 'cmd-1',
            userId: 'user1',
            networkId: 'net1',
            createdAt: '2026-05-08T13:00:00.000Z',
        })
        await insertTransaction(db, {
            id: 'tx-2',
            commandId: 'cmd-2',
            userId: 'user1',
            networkId: 'net1',
            createdAt: null,
        })

        await migrateUpThrough(db, TARGET)

        expect(await indexExists(db, TABLE, INDEX_NAME)).toBe(true)
        const rows = await sql<{ id: string }>`
            SELECT id FROM transactions ORDER BY id
        `.execute(db)
        expect(rows.rows.map((r) => r.id)).toEqual(['tx-1', 'tx-2'])
    })

    test('down drops the list index', async () => {
        const db = getDb()
        await migrateUpThrough(db, TARGET)
        expect(await indexExists(db, TABLE, INDEX_NAME)).toBe(true)

        await migrateDownThrough(db, TARGET)

        expect(await indexExists(db, TABLE, INDEX_NAME)).toBe(false)
    })
})
