// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from 'vitest'
import { sql } from 'kysely'

import {
    forEachDialect,
    migrateDownThrough,
    migrateUpThrough,
    migrateUpToBefore,
} from '../helpers'
import { insertIdp, insertNetwork } from '../seeds/001-init'

const TARGET = 16

const selfSigned = (overrides: Record<string, unknown> = {}) =>
    JSON.stringify({
        method: 'self_signed',
        issuer: 'http://issuer.local',
        audience: 'https://canton.network.global',
        scope: 'daml_ledger_api',
        clientId: 'ledger-api-user',
        clientSecret: 'unsafe',
        ...overrides,
    })

function parseJsonColumn(value: unknown): Record<string, unknown> {
    if (typeof value === 'string') {
        return JSON.parse(value) as Record<string, unknown>
    }

    if (typeof value === 'object' && value !== null) {
        return value as Record<string, unknown>
    }

    throw new Error(`Unexpected JSON column value: ${String(value)}`)
}

forEachDialect('migration 016 - add self signed key id', ({ getDb }) => {
    const readAuth = async (): Promise<
        Map<string, Record<string, unknown>>
    > => {
        const db = getDb()
        const rows = await sql<{ id: string; auth: unknown }>`
            SELECT id, auth FROM networks
        `.execute(db)
        return new Map(rows.rows.map((r) => [r.id, parseJsonColumn(r.auth)]))
    }

    test('backfills a distinct key id for every self_signed network', async () => {
        const db = getDb()
        await migrateUpToBefore(db, TARGET)

        await insertIdp(db, { id: 'idp1' })
        await insertNetwork(db, {
            id: 'net1',
            idpId: 'idp1',
            auth: selfSigned(),
        })
        await insertNetwork(db, {
            id: 'net2',
            idpId: 'idp1',
            auth: selfSigned(),
        })

        await migrateUpThrough(db, TARGET)

        const auth = await readAuth()
        const net1 = auth.get('net1')!
        const net2 = auth.get('net2')!

        expect(net1.keyId).toEqual(expect.any(String))
        expect(net2.keyId).toEqual(expect.any(String))
        expect(net1.keyId).not.toBe(net2.keyId)

        // the rest of the auth payload is untouched
        expect(net1).toMatchObject({
            method: 'self_signed',
            clientSecret: 'unsafe',
            audience: 'https://canton.network.global',
        })
    })

    test('leaves non self_signed networks and pre-existing key ids alone', async () => {
        const db = getDb()
        await migrateUpToBefore(db, TARGET)

        await insertIdp(db, { id: 'idp1' })
        await insertNetwork(db, {
            id: 'oauth',
            idpId: 'idp1',
            auth: JSON.stringify({
                method: 'authorization_code',
                audience: 'aud',
                scope: 'daml_ledger_api',
                clientId: 'operator',
            }),
        })
        await insertNetwork(db, {
            id: 'preset',
            idpId: 'idp1',
            auth: selfSigned({ keyId: 'already-set' }),
        })

        await migrateUpThrough(db, TARGET)

        const auth = await readAuth()
        expect(auth.get('oauth')).not.toHaveProperty('keyId')
        expect(auth.get('preset')!.keyId).toBe('already-set')
    })

    test('down strips the key id from self_signed networks', async () => {
        const db = getDb()
        await migrateUpToBefore(db, TARGET)

        await insertIdp(db, { id: 'idp1' })
        await insertNetwork(db, {
            id: 'net1',
            idpId: 'idp1',
            auth: selfSigned(),
        })

        await migrateUpThrough(db, TARGET)
        await migrateDownThrough(db, TARGET)

        const auth = await readAuth()
        expect(auth.get('net1')).not.toHaveProperty('keyId')
        expect(auth.get('net1')).toMatchObject({
            method: 'self_signed',
            clientSecret: 'unsafe',
        })
    })
})
