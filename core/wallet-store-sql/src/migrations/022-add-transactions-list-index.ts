// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type Kysely, sql } from 'kysely'
import type { DB } from '../schema.js'
import { isPostgres } from '../utils.js'

const INDEX_NAME = 'idx_transactions_user_network_created_at_id'

// Matches the filter and sort order of `listTransactions` and lets
// `transactionsCount` use an index-only scan. Without it every page request
// scans and sorts all of the user's transactions.
export async function up(db: Kysely<DB>): Promise<void> {
    if (await isPostgres(db)) {
        await sql`
            CREATE INDEX IF NOT EXISTS ${sql.raw(INDEX_NAME)}
            ON transactions (user_id, network_id, created_at DESC NULLS LAST, id DESC)
        `.execute(db)
        return
    }

    // SQLite sorts NULL as the smallest value, so DESC already puts NULLs last.
    await sql`
        CREATE INDEX IF NOT EXISTS ${sql.raw(INDEX_NAME)}
        ON transactions (user_id, network_id, created_at DESC, id DESC)
    `.execute(db)
}

export async function down(db: Kysely<DB>): Promise<void> {
    await sql`DROP INDEX IF EXISTS ${sql.raw(INDEX_NAME)}`.execute(db)
}
