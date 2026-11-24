// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type Kysely, sql } from 'kysely'
import { expect, test } from 'vitest'

import type { DB } from '../../../schema.ts'
import {
    forEachDialect,
    indexExists,
    listColumns,
    migrateDownThrough,
    migrateUpThrough,
    migrateUpToBefore,
    primaryKeyColumns,
    tableExists,
} from '../helpers.ts'
import { insertSession } from '../seeds/022-hash-session-access-token.ts'
import { insertNetworkConnection } from '../seeds/023-add-network-connections.ts'

const TARGET = 23

const connection = {
    id: 'connection-1',
    sessionId: 'session-1',
    authMethod: 'self_issued',
    userId: 'alice',
    payload: { state: 'pending', scopes: ['ledger:read'] },
    createdAt: '2026-11-24T10:00:00.000Z',
}

async function seedSession(db: Kysely<DB>, id = 'session-1') {
    await insertSession(db, {
        id,
        network: 'network-1',
        userId: 'alice',
        origin: `https://${id}.example`,
    })
}

async function connectionIds(db: Kysely<DB>) {
    const result = await sql<{ id: string }>`
        SELECT id FROM network_connections ORDER BY id
    `.execute(db)
    return result.rows.map((row) => row.id)
}

forEachDialect('migration 023 - add network connections', ({ getDb }) => {
    test('creates the table with one connection per session', async () => {
        const db = getDb()
        await migrateUpThrough(db, TARGET)

        const columns = await listColumns(db, 'network_connections')
        expect(columns).toEqual([
            { name: 'id', nullable: false },
            { name: 'session_id', nullable: false },
            { name: 'auth_method', nullable: false },
            { name: 'user_id', nullable: false },
            { name: 'payload', nullable: false },
            { name: 'expires_at', nullable: true },
            { name: 'created_at', nullable: false },
        ])
        expect(await primaryKeyColumns(db, 'network_connections')).toEqual([
            'id',
        ])
        expect(
            await indexExists(
                db,
                'network_connections',
                'network_connections_one_per_session'
            )
        ).toBe(true)
    })

    test('reads the payload back as the stored json', async () => {
        const db = getDb()
        await migrateUpThrough(db, TARGET)
        await seedSession(db)
        await insertNetworkConnection(db, connection)

        const row = await db
            .selectFrom('networkConnections')
            .select('payload')
            .executeTakeFirstOrThrow()
        const payload: unknown =
            typeof row.payload === 'string'
                ? JSON.parse(row.payload)
                : row.payload
        expect(payload).toEqual(connection.payload)
    })

    test('deletes connections together with their session', async () => {
        const db = getDb()
        await migrateUpThrough(db, TARGET)
        await seedSession(db, 'session-1')
        await seedSession(db, 'session-2')
        await insertNetworkConnection(db, connection)
        await insertNetworkConnection(db, {
            ...connection,
            id: 'connection-2',
            sessionId: 'session-2',
        })

        await db.deleteFrom('sessions').where('id', '=', 'session-1').execute()

        expect(await connectionIds(db)).toEqual(['connection-2'])
    })

    test('rejects a second connection for the same session', async () => {
        const db = getDb()
        await migrateUpThrough(db, TARGET)
        await seedSession(db)
        await insertNetworkConnection(db, connection)

        await expect(
            insertNetworkConnection(db, { ...connection, id: 'connection-2' })
        ).rejects.toThrow()
        expect(await connectionIds(db)).toEqual(['connection-1'])
    })

    test('rejects a connection without a session', async () => {
        const db = getDb()
        await migrateUpThrough(db, TARGET)

        await expect(insertNetworkConnection(db, connection)).rejects.toThrow()
    })

    test('down drops the table and keeps sessions', async () => {
        const db = getDb()
        await migrateUpToBefore(db, TARGET)
        await seedSession(db)
        await migrateUpThrough(db, TARGET)
        await insertNetworkConnection(db, connection)

        await migrateDownThrough(db, TARGET)

        expect(await tableExists(db, 'network_connections')).toBe(false)
        const sessions = await sql<{ id: string }>`
            SELECT id FROM sessions
        `.execute(db)
        expect(sessions.rows).toEqual([{ id: 'session-1' }])
    })
})
