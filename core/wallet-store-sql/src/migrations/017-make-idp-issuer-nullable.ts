// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type Kysely, sql } from 'kysely'
import type { DB } from '../schema.js'
import { isPostgres } from '../utils.js'

export async function up(db: Kysely<DB>): Promise<void> {
    if (await isPostgres(db)) {
        await sql`
            ALTER TABLE idps
            ALTER COLUMN issuer DROP NOT NULL
        `.execute(db)
    } else {
        // `networks.identity_provider_id` references `idps` with ON DELETE CASCADE.
        // Temporarily disable enforcement while replacing the referenced table,
        // so dropping it does not delete the dependent network rows.
        await sql`PRAGMA foreign_keys = OFF`.execute(db)
        try {
            await db.transaction().execute(async (trx) => {
                await sql`
                    CREATE TABLE idps_new (
                        id TEXT PRIMARY KEY,
                        type TEXT NOT NULL,
                        issuer TEXT,
                        config_url TEXT
                    )
                `.execute(trx)
                await sql`
                    INSERT INTO idps_new (id, type, issuer, config_url)
                    SELECT id, type, issuer, config_url FROM idps
                `.execute(trx)
                await sql`DROP TABLE idps`.execute(trx)
                await sql`ALTER TABLE idps_new RENAME TO idps`.execute(trx)
            })
        } finally {
            await sql`PRAGMA foreign_keys = ON`.execute(db)
        }
    }

    await sql`
        UPDATE idps
        SET issuer = NULL
        WHERE type = 'self_issued'
    `.execute(db)
}

export async function down(db: Kysely<DB>): Promise<void> {
    await sql`
        UPDATE idps
        SET issuer = ''
        WHERE issuer IS NULL
    `.execute(db)

    if (await isPostgres(db)) {
        await sql`
            ALTER TABLE idps
            ALTER COLUMN issuer SET NOT NULL
        `.execute(db)
    } else {
        // `networks.identity_provider_id` references `idps` with ON DELETE CASCADE.
        // Temporarily disable enforcement while replacing the referenced table,
        // so dropping it does not delete the dependent network rows.
        await sql`PRAGMA foreign_keys = OFF`.execute(db)
        try {
            await db.transaction().execute(async (trx) => {
                await sql`
                    CREATE TABLE idps_new (
                        id TEXT PRIMARY KEY,
                        type TEXT NOT NULL,
                        issuer TEXT NOT NULL,
                        config_url TEXT
                    )
                `.execute(trx)
                await sql`
                    INSERT INTO idps_new (id, type, issuer, config_url)
                    SELECT id, type, issuer, config_url FROM idps
                `.execute(trx)
                await sql`DROP TABLE idps`.execute(trx)
                await sql`ALTER TABLE idps_new RENAME TO idps`.execute(trx)
            })
        } finally {
            await sql`PRAGMA foreign_keys = ON`.execute(db)
        }
    }
}
