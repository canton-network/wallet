// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Kysely } from 'kysely'

import type { DB } from '../schema.ts'

export async function up(db: Kysely<DB>): Promise<void> {
    await db.schema
        .createTable('clearSigningDescriptors')
        .addColumn('userId', 'text', (col) => col.notNull())
        .addColumn('packageId', 'text', (col) => col.notNull())
        .addColumn('moduleName', 'text', (col) => col.notNull())
        .addColumn('entityName', 'text', (col) => col.notNull())
        .addColumn('descriptor', 'text', (col) => col.notNull())
        .addColumn('createdAt', 'text', (col) => col.notNull())
        .addPrimaryKeyConstraint('clear_signing_descriptors_pk', [
            'userId',
            'packageId',
            'moduleName',
            'entityName',
        ])
        .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
    await db.schema.dropTable('clearSigningDescriptors').execute()
}
