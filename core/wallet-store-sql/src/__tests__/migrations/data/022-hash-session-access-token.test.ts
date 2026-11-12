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

const nowSeconds = () => Math.floor(Date.now() / 1000)
const inOneHour = () => nowSeconds() + 3600
const anHourAgo = () => nowSeconds() - 3600

function signingInput(exp: () => number): string {
    const encode = (value: unknown) =>
        Buffer.from(JSON.stringify(value)).toString('base64url')
    return `${encode({ alg: 'EdDSA', typ: 'JWT' })}.${encode({ exp: exp() })}`
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

    test('cleans up self-issued token messages but keeps unfinished logins', async () => {
        const db = getDb()
        await migrateUpToBefore(db, TARGET)
        // bob has a tokenless login session, so his login is still open
        await insertSession(db, {
            id: 'bob-login',
            network: 'network-1',
            userId: 'bob',
            origin: 'https://example.com',
        })
        const signedToken = {
            ...message,
            kind: 'self-issued-token',
            status: 'signed',
            signature: 'c2lnbmF0dXJl',
        }
        await insertMessageRaw(db, {
            ...signedToken,
            id: 'alice-completed',
            message: signingInput(inOneHour),
        })
        await insertMessageRaw(db, {
            ...signedToken,
            id: 'bob-unfinished',
            userId: 'bob',
            message: signingInput(inOneHour),
        })
        await insertMessageRaw(db, {
            ...signedToken,
            id: 'bob-expired',
            userId: 'bob',
            message: signingInput(anHourAgo),
        })
        await insertMessageRaw(db, {
            ...signedToken,
            id: 'alice-failed',
            status: 'failed',
            failureReason: 'rejected',
        })
        await insertMessageRaw(db, {
            ...message,
            id: 'alice-pending',
            kind: 'self-issued-token',
            status: 'awaiting-signature',
        })
        await insertMessageRaw(db, {
            ...signedToken,
            id: 'alice-regular',
            kind: 'regular',
        })

        await migrateUpThrough(db, TARGET)

        const result = await sql<{
            id: string
            signature: string | null
            failureReason: string | null
        }>`
            SELECT id, signature, failure_reason FROM messages_raw ORDER BY id
        `.execute(db)
        expect(result.rows).toEqual([
            { id: 'alice-failed', signature: null, failureReason: 'rejected' },
            { id: 'alice-pending', signature: null, failureReason: null },
            {
                id: 'alice-regular',
                signature: 'c2lnbmF0dXJl',
                failureReason: null,
            },
            {
                id: 'bob-unfinished',
                signature: 'c2lnbmF0dXJl',
                failureReason: null,
            },
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
