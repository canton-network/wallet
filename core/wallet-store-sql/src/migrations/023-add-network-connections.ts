// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Kysely } from 'kysely'

import type { DB } from '../schema.ts'

// TODO check postgres

export async function up(db: Kysely<DB>): Promise<void> {
    await db.schema
        .createTable('networkConnections')
        .addColumn('id', 'text', (col) => col.notNull().primaryKey())
        .addColumn('sessionId', 'text', (col) =>
            col.notNull().references('sessions.id').onDelete('cascade')
        )
        .addColumn('authMethod', 'text', (col) => col.notNull())
        .addColumn('userId', 'text', (col) => col.notNull())
        .addColumn('payload', 'jsonb', (col) => col.notNull())
        .addColumn('expiresAt', 'text')
        .addColumn('createdAt', 'text', (col) => col.notNull())
        .execute()

    // UNIQUE INDEX rather than UNIQUE, so it can be dropped in SQLite
    // without rebuilding the table once a session can have more connections.
    await db.schema
        .createIndex('network_connections_one_per_session')
        .on('networkConnections')
        .column('sessionId')
        .unique()
        .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
    await db.schema.dropTable('networkConnections').ifExists().execute()
}
