// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type Kysely, sql } from 'kysely'
import type { DB } from '../schema.js'
import { isPostgres } from '../utils.js'

const createSessionIndexes = async (
    db: Kysely<DB>,
    includeOnboardingIndex: boolean
): Promise<void> => {
    await sql`
        CREATE UNIQUE INDEX sessions_one_session_per_origin_user
        ON sessions(network, user_id, origin)
    `.execute(db)
    await sql`
        CREATE UNIQUE INDEX sessions_unique_access_token_per_network
        ON sessions(network, access_token)
    `.execute(db)
    if (includeOnboardingIndex) {
        await sql`
            CREATE UNIQUE INDEX sessions_one_onboarding_session_per_user
            ON sessions(user_id)
            WHERE access_token IS NULL
        `.execute(db)
    }
}

export async function up(db: Kysely<DB>): Promise<void> {
    if (await isPostgres(db)) {
        await sql`
            ALTER TABLE sessions
            ALTER COLUMN access_token DROP NOT NULL
        `.execute(db)
        await sql`
            CREATE UNIQUE INDEX sessions_one_onboarding_session_per_user
            ON sessions(user_id)
            WHERE access_token IS NULL
        `.execute(db)
        return
    }

    await db.transaction().execute(async (trx) => {
        await sql`
            CREATE TABLE sessions_new (
                id TEXT PRIMARY KEY,
                access_token TEXT,
                user_id TEXT NOT NULL,
                network TEXT NOT NULL,
                origin TEXT NOT NULL
            )
        `.execute(trx)
        await sql`
            INSERT INTO sessions_new (
                id, access_token, user_id, network, origin
            )
            SELECT id, access_token, user_id, network, origin
            FROM sessions
        `.execute(trx)
        await sql`DROP TABLE sessions`.execute(trx)
        await sql`ALTER TABLE sessions_new RENAME TO sessions`.execute(trx)
        await createSessionIndexes(trx, true)
    })
}

export async function down(db: Kysely<DB>): Promise<void> {
    await sql`DELETE FROM sessions WHERE access_token IS NULL`.execute(db)

    if (await isPostgres(db)) {
        await sql`
            DROP INDEX sessions_one_onboarding_session_per_user
        `.execute(db)
        await sql`
            ALTER TABLE sessions
            ALTER COLUMN access_token SET NOT NULL
        `.execute(db)
        return
    }

    await db.transaction().execute(async (trx) => {
        await sql`
            CREATE TABLE sessions_new (
                id TEXT PRIMARY KEY,
                access_token TEXT NOT NULL,
                user_id TEXT NOT NULL,
                network TEXT NOT NULL,
                origin TEXT NOT NULL
            )
        `.execute(trx)
        await sql`
            INSERT INTO sessions_new (
                id, access_token, user_id, network, origin
            )
            SELECT id, access_token, user_id, network, origin
            FROM sessions
        `.execute(trx)
        await sql`DROP TABLE sessions`.execute(trx)
        await sql`ALTER TABLE sessions_new RENAME TO sessions`.execute(trx)
        await createSessionIndexes(trx, false)
    })
}
