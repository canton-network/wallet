// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from 'vitest'
import { sql } from 'kysely'

import {
    forEachDialect,
    migrateUpThrough,
    migrateUpToBefore,
    listColumns,
} from '../helpers'
import { insertIdp, insertNetwork } from '../seeds/001-init'
import { insertTransaction } from '../seeds/016-add-failure-reason-and-awaiting-signature'

const TARGET = 16

forEachDialect(
    'migration 016 - failure reason and awaiting signature status',
    ({ getDb }) => {
        test('adds nullable failure_reason and preserves existing rows', async () => {
            const db = getDb()
            await migrateUpToBefore(db, TARGET)

            await insertIdp(db, { id: 'idp1' })
            await insertNetwork(db, { id: 'net1', idpId: 'idp1' })
            await insertTransaction(db, {
                commandId: 'cmd-001',
                userId: 'user1',
                networkId: 'net1',
                origin: 'ledger',
                externalTxId: 'txid-1',
                status: 'executed',
            })

            await migrateUpThrough(db, TARGET)

            const cols = await listColumns(db, 'transactions')
            const byName = new Map(cols.map((c) => [c.name, c]))
            expect(byName.get('failure_reason')?.nullable).toBe(true)

            const rows =
                await sql`SELECT command_id, status, failure_reason from transactions`.execute(
                    db
                )
            expect(rows.rows).toHaveLength(1)
            expect(rows.rows[0]).toMatchObject({
                commandId: 'cmd-001',
                status: 'executed',
                failureReason: null,
            })
        })
    }
)
