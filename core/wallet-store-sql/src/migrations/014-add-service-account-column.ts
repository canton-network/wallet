// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Kysely } from 'kysely'
import type { DB } from '../schema.js'

export async function up(db: Kysely<DB>): Promise<void> {
    console.log('Adding serviceAccountAuth column to networks table')

    await db.schema
        .alterTable('networks')
        .addColumn('serviceAccountAuth', 'text')
        .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
    await db.schema
        .alterTable('networks')
        .dropColumn('serviceAccountAuth')
        .execute()
}
