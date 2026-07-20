// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
    await db.schema
        .createTable('apiKeys')
        .addColumn('id', 'text', (col) => col.notNull().primaryKey())
        .addColumn('digest', 'text', (col) => col.notNull())
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('userId', 'text', (col) => col.notNull())
        .addColumn('email', 'text')
        .addColumn('networkId', 'text', (col) => col.notNull())
        .addColumn('createdAt', 'text', (col) => col.notNull())
        .addColumn('lastUsedAt', 'text')
        .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
    await db.schema.dropTable('apiKeys').execute()
}
