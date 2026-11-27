// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { sql } from 'kysely'
import { expect, test } from 'vitest'

import {
    forEachDialect,
    hasColumn,
    listColumns,
    migrateDownThrough,
    migrateUpThrough,
    migrateUpToBefore,
} from '../helpers.ts'
import { insertSession as insertSession022 } from '../seeds/022-hash-session-access-token.ts'
import { insertSession as insertSession023 } from '../seeds/023-add-session-scopes.ts'

const TARGET = 23
const TABLE = 'sessions'

forEachDialect('migration 023 - session scopes', ({ getDb }) => {
    test('adds nullable scopes and keeps existing sessions unscoped', async () => {
        const db = getDb()
        await migrateUpToBefore(db, TARGET)
        await insertSession022(db, {
            id: 'session-1',
            network: 'network-1',
            accessTokenHash: 'token-hash',
            userId: 'alice',
            origin: 'https://dapp.example',
        })

        await migrateUpThrough(db, TARGET)

        const columns = await listColumns(db, TABLE)
        expect(columns.find((c) => c.name === 'scopes')).toEqual({
            name: 'scopes',
            nullable: true,
        })
        const rows = await sql`
            SELECT id, scopes FROM sessions
        `.execute(db)
        expect(rows.rows).toEqual([{ id: 'session-1', scopes: null }])
    })

    test('down removes scopes and keeps sessions', async () => {
        const db = getDb()
        await migrateUpThrough(db, TARGET)
        await insertSession023(db, {
            id: 'session-1',
            network: 'network-1',
            userId: 'alice',
            origin: 'https://dapp.example',
            scopes: JSON.stringify(['ledger:read']),
        })

        await migrateDownThrough(db, TARGET)

        expect(await hasColumn(db, TABLE, 'scopes')).toBe(false)
        const rows = await sql`
            SELECT id FROM sessions
        `.execute(db)
        expect(rows.rows).toEqual([{ id: 'session-1' }])
    })
})
