// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from 'vitest'
import { sql } from 'kysely'

import {
    forEachDialect,
    migrateDownThrough,
    migrateUpThrough,
    migrateUpToBefore,
    hasColumn,
    listColumns,
} from '../helpers'
import { insertIdp } from '../seeds/001-init'
import { insertNetwork } from '../seeds/014-add-service-account-column'
import { insertWallet } from '../seeds/005-add-wallet-disabled-reason'
import { insertSession } from '../seeds/019-make-session-access-token-nullable'

const TARGET = 21

forEachDialect('migration 021 - drop network user id', ({ getDb }) => {
    test('drops the user_id column and keeps networks of all users', async () => {
        const db = getDb()
        await migrateUpToBefore(db, TARGET)

        await insertIdp(db, { id: 'idp1' })
        await insertNetwork(db, { id: 'net-global', idpId: 'idp1' })
        await insertNetwork(db, {
            id: 'net-owned',
            idpId: 'idp1',
            userId: 'admin',
        })
        await insertWallet(db, {
            partyId: 'party::1',
            userId: 'alice',
            networkId: 'net-owned',
        })
        await insertSession(db, {
            id: 'session-1',
            network: 'net-owned',
            userId: 'alice',
            origin: 'http://localhost',
        })

        await migrateUpThrough(db, TARGET)

        expect(await hasColumn(db, 'networks', 'user_id')).toBe(false)

        const rows = await sql<{
            id: string
        }>`SELECT id FROM networks ORDER BY id`.execute(db)
        expect(rows.rows.map((row) => row.id)).toEqual([
            'net-global',
            'net-owned',
        ])
        // Dropping the column must not cascade to rows of the network
        const wallets = await sql<{
            partyId: string
        }>`SELECT party_id FROM wallets`.execute(db)
        expect(wallets.rows).toEqual([{ partyId: 'party::1' }])
        const sessions = await sql<{
            id: string
        }>`SELECT id FROM sessions`.execute(db)
        expect(sessions.rows).toEqual([{ id: 'session-1' }])
    })

    test('down adds a nullable user_id column and keeps networks global', async () => {
        const db = getDb()
        await migrateUpThrough(db, TARGET)

        await insertIdp(db, { id: 'idp1' })
        await sql`
            INSERT INTO networks (id, name, ledger_api_base_url, identity_provider_id, auth)
            VALUES ('net1', 'net1', 'http://ledger.local', 'idp1', '{"method":"self_signed"}')
        `.execute(db)

        await migrateDownThrough(db, TARGET)

        const cols = await listColumns(db, 'networks')
        const byName = new Map(cols.map((c) => [c.name, c]))
        expect(byName.get('user_id')?.nullable).toBe(true)

        const rows = await sql`SELECT id, user_id FROM networks`.execute(db)
        expect(rows.rows).toEqual([{ id: 'net1', userId: null }])
    })
})
