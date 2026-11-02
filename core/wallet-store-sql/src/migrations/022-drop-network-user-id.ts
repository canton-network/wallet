// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Kysely } from 'kysely'
import type { DB } from '../schema.js'

// Networks were only visible to the user who added them, so networks added
// at runtime by the admin were missing for every other user. All networks
// are global now.
export async function up(db: Kysely<DB>): Promise<void> {
    console.log('Dropping userId column from networks table')

    await db.schema.alterTable('networks').dropColumn('userId').execute()
}

// All networks stay global, the previous owners are not restored
export async function down(db: Kysely<DB>): Promise<void> {
    await db.schema.alterTable('networks').addColumn('userId', 'text').execute()
}
