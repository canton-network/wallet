// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from 'vitest'

import {
    columnNames,
    forEachDialect,
    listColumns,
    migrateDownThrough,
    migrateUpThrough,
    migrateUpToBefore,
    primaryKeyColumns,
    tableExists,
} from '../helpers.js'

const TARGET = 22
const TABLE = 'clear_signing_descriptors'

forEachDialect('migration 022 - clear-signing descriptors', ({ getDb }) => {
    test('creates clear_signing_descriptors with a composite primary key', async () => {
        const db = getDb()
        await migrateUpToBefore(db, TARGET)
        expect(await tableExists(db, TABLE)).toBe(false)

        await migrateUpThrough(db, TARGET)

        expect(await tableExists(db, TABLE)).toBe(true)
        expect(await primaryKeyColumns(db, TABLE)).toEqual([
            'user_id',
            'package_id',
            'module_name',
            'entity_name',
        ])
        expect(await columnNames(db, TABLE)).toEqual(
            [
                'user_id',
                'package_id',
                'module_name',
                'entity_name',
                'descriptor',
                'created_at',
            ].sort()
        )

        const cols = await listColumns(db, TABLE)
        const byName = new Map(cols.map((c) => [c.name, c]))
        expect(byName.get('user_id')?.nullable).toBe(false)
        expect(byName.get('package_id')?.nullable).toBe(false)
        expect(byName.get('module_name')?.nullable).toBe(false)
        expect(byName.get('entity_name')?.nullable).toBe(false)
        expect(byName.get('descriptor')?.nullable).toBe(false)
        expect(byName.get('created_at')?.nullable).toBe(false)
    })

    test('down drops clear_signing_descriptors', async () => {
        const db = getDb()
        await migrateUpThrough(db, TARGET)
        await db
            .insertInto('clearSigningDescriptors')
            .values({
                userId: 'user-1',
                packageId: 'pkg',
                moduleName: 'Mod',
                entityName: 'Ent',
                descriptor: '{}',
                createdAt: '2026-05-08T13:00:00.000Z',
            })
            .execute()

        await migrateDownThrough(db, TARGET)

        expect(await tableExists(db, TABLE)).toBe(false)
    })
})
