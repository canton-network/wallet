// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type Kysely, sql } from 'kysely'
import type { DB } from '../schema.js'
import { isPostgres } from '../utils.js'

export async function up(db: Kysely<DB>): Promise<void> {
    if (await isPostgres(db)) {
        await db.schema
            .alterTable('sessions')
            .alterColumn('accessToken', (col) => col.dropNotNull())
            .execute()

        await sql`
            CREATE UNIQUE INDEX sessions_one_onboarding_session_per_user_network
            ON sessions(network, user_id)
            WHERE access_token IS NULL
        `.execute(db)
        return
    }

    await db.transaction().execute(async (trx) => {
        await trx.schema.dropTable('sessions_new').ifExists().execute()

        await trx.schema
            .createTable('sessions_new')
            .addColumn('id', 'text', (col) => col.primaryKey())
            .addColumn('accessToken', 'text')
            .addColumn('userId', 'text', (col) => col.notNull())
            .addColumn('network', 'text', (col) => col.notNull())
            .addColumn('origin', 'text', (col) => col.notNull())
            .execute()

        await sql`
            INSERT INTO sessions_new (id, access_token, user_id, network, origin)
            SELECT id, access_token, user_id, network, origin FROM sessions
        `.execute(trx)

        await trx.schema.dropTable('sessions').execute()
        await trx.schema
            .alterTable('sessions_new')
            .renameTo('sessions')
            .execute()

        // Unchanged since migration 015 (recreated after SQLite table rebuild).
        await sql`
            CREATE UNIQUE INDEX IF NOT EXISTS sessions_one_session_per_origin_user
            ON sessions(network, user_id, origin)
        `.execute(trx)

        await sql`
            CREATE UNIQUE INDEX IF NOT EXISTS sessions_unique_access_token_per_network
            ON sessions(network, access_token)
        `.execute(trx)

        // New in this migration - one tokenless session per user and network.
        await sql`
            CREATE UNIQUE INDEX IF NOT EXISTS sessions_one_onboarding_session_per_user_network
            ON sessions(network, user_id)
            WHERE access_token IS NULL
        `.execute(trx)
    })
}

export async function down(db: Kysely<DB>): Promise<void> {
    await db.deleteFrom('sessions').where('accessToken', 'is', null).execute()

    if (await isPostgres(db)) {
        await db.schema
            .dropIndex('sessions_one_onboarding_session_per_user_network')
            .execute()
        await db.schema
            .alterTable('sessions')
            .alterColumn('accessToken', (col) => col.setNotNull())
            .execute()
        return
    }

    await db.transaction().execute(async (trx) => {
        await trx.schema.dropTable('sessions_new').ifExists().execute()

        await trx.schema
            .createTable('sessions_new')
            .addColumn('id', 'text', (col) => col.primaryKey())
            .addColumn('accessToken', 'text', (col) => col.notNull())
            .addColumn('userId', 'text', (col) => col.notNull())
            .addColumn('network', 'text', (col) => col.notNull())
            .addColumn('origin', 'text', (col) => col.notNull())
            .execute()

        await sql`
            INSERT INTO sessions_new (id, access_token, user_id, network, origin)
            SELECT id, access_token, user_id, network, origin FROM sessions
        `.execute(trx)

        await trx.schema.dropTable('sessions').execute()
        await trx.schema
            .alterTable('sessions_new')
            .renameTo('sessions')
            .execute()

        await sql`
            CREATE UNIQUE INDEX IF NOT EXISTS sessions_one_session_per_origin_user
            ON sessions(network, user_id, origin)
        `.execute(trx)

        await sql`
            CREATE UNIQUE INDEX IF NOT EXISTS sessions_unique_access_token_per_network
            ON sessions(network, access_token)
        `.execute(trx)
    })
}
