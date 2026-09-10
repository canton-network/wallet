// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Kysely, sql } from 'kysely'
import { DB } from '../schema.js'

export async function up(db: Kysely<DB>): Promise<void> {
    console.log('Adding failure reason to transaction')

    await db.schema
        .alterTable('transactions')
        .addColumn('failure_reason', 'text')
        .execute()

    await sql`
                UPDATE transactions
                SET status = 'awaiting-signature'
                WHERE status = 'pending' AND external_tx_id IS NOT NULL
            `.execute(db)
}
