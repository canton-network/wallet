// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto'
import { expect, test } from 'vitest'
import { type Kysely, sql } from 'kysely'

import type { DB } from '../../../schema.js'
import { up } from '../../../migrations/022-hash-session-access-token'
import {
    forEachDialect,
    migrateDownThrough,
    migrateUpThrough,
    migrateUpToBefore,
} from '../helpers'
import { insertSession } from '../seeds/019-make-session-access-token-nullable'
import { insertMessageRaw } from '../seeds/021-add-message-kind'

const TARGET = 22

const sha256Hex = (value: string) =>
    createHash('sha256').update(value, 'utf8').digest('hex')

async function sessionTokens(db: Kysely<DB>) {
    const result = await sql<{ id: string; accessToken: string | null }>`
        SELECT id, access_token FROM sessions ORDER BY id
    `.execute(db)
    return result.rows
}

async function seedSessions(db: Kysely<DB>) {
    await insertSession(db, {
        id: 'logged-in',
        network: 'network-1',
        accessToken: 'header.payload.signature',
        userId: 'alice',
        origin: 'https://example.com',
    })
    await insertSession(db, {
        id: 'onboarding',
        network: 'network-1',
        userId: 'bob',
        origin: 'https://example.com',
    })
}

const message = {
    partyId: 'party::1',
    publicKey: 'pk-1',
    message: 'header.payload',
    userId: 'alice',
    networkId: 'network-1',
    createdAt: '2026-11-12T10:00:00.000Z',
}

forEachDialect('migration 022 - hash session access token', ({ getDb }) => {
    test('hashes existing access tokens in place and keeps tokenless sessions', async () => {
        const db = getDb()
        await migrateUpToBefore(db, TARGET)
        await seedSessions(db)

        await migrateUpThrough(db, TARGET)

        expect(await sessionTokens(db)).toEqual([
            {
                id: 'logged-in',
                accessToken: sha256Hex('header.payload.signature'),
            },
            { id: 'onboarding', accessToken: null },
        ])
    })

    test('does not hash a token twice when it runs again', async () => {
        const db = getDb()
        await migrateUpToBefore(db, TARGET)
        await seedSessions(db)

        await migrateUpThrough(db, TARGET)
        const afterFirstRun = await sessionTokens(db)
        await up(db)

        expect(await sessionTokens(db)).toEqual(afterFirstRun)
    })

    test('deletes signed self-issued token messages and keeps the rest', async () => {
        const db = getDb()
        await migrateUpToBefore(db, TARGET)
        await insertMessageRaw(db, {
            ...message,
            id: 'signed-token',
            kind: 'self-issued-token',
            status: 'signed',
            signature: 'c2lnbmF0dXJl',
        })
        await insertMessageRaw(db, {
            ...message,
            id: 'pending-token',
            kind: 'self-issued-token',
            status: 'awaiting-signature',
        })
        await insertMessageRaw(db, {
            ...message,
            id: 'signed-regular',
            kind: 'regular',
            status: 'signed',
            signature: 'c2lnbmF0dXJl',
        })

        await migrateUpThrough(db, TARGET)

        const result = await sql<{ id: string }>`
            SELECT id FROM messages_raw ORDER BY id
        `.execute(db)
        expect(result.rows).toEqual([
            { id: 'pending-token' },
            { id: 'signed-regular' },
        ])
    })

    test('down drops sessions with a hashed token and keeps tokenless ones', async () => {
        const db = getDb()
        await migrateUpToBefore(db, TARGET)
        await seedSessions(db)
        await migrateUpThrough(db, TARGET)

        await migrateDownThrough(db, TARGET)

        expect(await sessionTokens(db)).toEqual([
            { id: 'onboarding', accessToken: null },
        ])
    })
})
