// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type Kysely, sql } from 'kysely'
import type { DB } from '../schema.js'
import { isPostgres } from '../utils.js'

export async function up(db: Kysely<DB>): Promise<void> {
    if (await isPostgres(db)) {
        await db.schema
            .alterTable('idps')
            .alterColumn('issuer', (column) => column.dropNotNull())
            .execute()
    } else {
        // `networks.identity_provider_id` references `idps` with ON DELETE CASCADE.
        // Temporarily disable enforcement while replacing the referenced table,
        // so dropping it does not delete the dependent network rows.
        await sql`PRAGMA foreign_keys = OFF`.execute(db)
        try {
            await db.transaction().execute(async (trx) => {
                await trx.schema
                    .createTable('idps_new')
                    .addColumn('id', 'text', (column) => column.primaryKey())
                    .addColumn('type', 'text', (column) => column.notNull())
                    .addColumn('issuer', 'text')
                    .addColumn('config_url', 'text')
                    .execute()
                await sql`
                    INSERT INTO idps_new (id, type, issuer, config_url)
                    SELECT id, type, issuer, config_url FROM idps
                `.execute(trx)
                await trx.schema.dropTable('idps').execute()
                await trx.schema
                    .alterTable('idps_new')
                    .renameTo('idps')
                    .execute()
            })
        } finally {
            await sql`PRAGMA foreign_keys = ON`.execute(db)
        }
    }

    await db
        .updateTable('idps')
        .set({ issuer: null })
        .where('type', '=', 'self_issued')
        .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
    await db
        .updateTable('idps')
        .set({ issuer: '' })
        .where('issuer', 'is', null)
        .execute()

    if (await isPostgres(db)) {
        await db.schema
            .alterTable('idps')
            .alterColumn('issuer', (column) => column.setNotNull())
            .execute()
    } else {
        // `networks.identity_provider_id` references `idps` with ON DELETE CASCADE.
        // Temporarily disable enforcement while replacing the referenced table,
        // so dropping it does not delete the dependent network rows.
        await sql`PRAGMA foreign_keys = OFF`.execute(db)
        try {
            await db.transaction().execute(async (trx) => {
                await trx.schema
                    .createTable('idps_new')
                    .addColumn('id', 'text', (column) => column.primaryKey())
                    .addColumn('type', 'text', (column) => column.notNull())
                    .addColumn('issuer', 'text', (column) => column.notNull())
                    .addColumn('config_url', 'text')
                    .execute()
                await sql`
                    INSERT INTO idps_new (id, type, issuer, config_url)
                    SELECT id, type, issuer, config_url FROM idps
                `.execute(trx)
                await trx.schema.dropTable('idps').execute()
                await trx.schema
                    .alterTable('idps_new')
                    .renameTo('idps')
                    .execute()
            })
        } finally {
            await sql`PRAGMA foreign_keys = ON`.execute(db)
        }
    }
}
