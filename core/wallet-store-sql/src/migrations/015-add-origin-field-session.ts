// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Kysely, sql } from 'kysely'
import { DB } from '../schema.js'
import { isPostgres } from '../utils.js'

export async function up(db: Kysely<DB>): Promise<void> {
    console.log('Adding origin column to sessions table')

    await db.deleteFrom('sessions').execute()

    const pg = await isPostgres(db)
    if (pg) {
        await sql`
            ALTER TABLE sessions
            ADD PRIMARY KEY ("id")
        `.execute(db)

        await db.schema
            .alterTable('sessions')
            .addColumn('origin', 'text', (col) => col.notNull())
            .execute()
    } else {
        // for sqlite, delete whole table, recreate from scratch
        await db.schema.dropTable('sessions').execute()
        await db.schema
            .createTable('sessions')
            .addColumn('id', 'text', (col) => col.primaryKey())
            .addColumn('access_token', 'text', (col) => col.notNull())
            .addColumn('user_id', 'text', (col) => col.notNull())
            .addColumn('network', 'text', (col) => col.notNull())
            .addColumn('origin', 'text', (col) => col.notNull())
            .execute()
    }

    await sql`
            CREATE UNIQUE INDEX IF NOT EXISTS sessions_one_session_per_origin_user
            ON sessions(network, user_id, origin)
        `.execute(db)

    await sql`
            CREATE UNIQUE INDEX IF NOT EXISTS sessions_unique_access_token_per_network
            ON sessions(network, access_token)
        `.execute(db)
}

export async function down(db: Kysely<DB>): Promise<void> {
    await db.schema.alterTable('sessions').dropColumn('origin').execute()
}
