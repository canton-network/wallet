// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto'

import { type Kysely, sql } from 'kysely'
import { expect, test } from 'vitest'

import { down, up } from '../../../migrations/022-hash-session-access-token.ts'
import type { DB } from '../../../schema.ts'
import { connection } from '../../../store-sql.ts'
import { PG_ENV } from '../global-setup.ts'
import {
    forEachDialect,
    hasColumn,
    migrateDownThrough,
    migrateUpThrough,
    migrateUpToBefore,
} from '../helpers.ts'
import { insertSession } from '../seeds/019-make-session-access-token-nullable.ts'
import { insertMessageRaw } from '../seeds/021-add-message-kind.ts'

const TARGET = 22

const sha256Hex = (value: string) =>
    createHash('sha256').update(value, 'utf8').digest('hex')

const SIGNATURE = 'c2lnbmF0dXJl'

function accessTokenFrom(signingInput: string, signature = SIGNATURE): string {
    return `${signingInput}.${Buffer.from(signature, 'base64').toString('base64url')}`
}

// Must match SELF_ISSUED_LOGIN_EXPIRED in core-wallet-services.
const SELF_ISSUED_LOGIN_EXPIRED =
    'Self-issued access token expired before login could be completed.'

async function sessionHashes(db: Kysely<DB>) {
    const result = await sql<{ id: string; accessTokenHash: string | null }>`
        SELECT id, access_token_hash FROM sessions ORDER BY id
    `.execute(db)
    return result.rows
}

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

forEachDialect(
    'migration 022 - hash session access token',
    ({ getDb, dialect }) => {
        test('hashes existing access tokens in place and keeps tokenless sessions', async () => {
            const db = getDb()
            await migrateUpToBefore(db, TARGET)
            await seedSessions(db)

            await migrateUpThrough(db, TARGET)

            expect(await hasColumn(db, 'sessions', 'access_token_hash')).toBe(
                true
            )
            expect(await hasColumn(db, 'sessions', 'access_token')).toBe(false)
            expect(await sessionHashes(db)).toEqual([
                {
                    id: 'logged-in',
                    accessTokenHash: sha256Hex('header.payload.signature'),
                },
                { id: 'onboarding', accessTokenHash: null },
            ])
        })

        test('does not hash a token twice when it runs again', async () => {
            const db = getDb()
            await migrateUpToBefore(db, TARGET)
            await seedSessions(db)

            await migrateUpThrough(db, TARGET)
            const afterFirstRun = await sessionHashes(db)
            await up(db)

            expect(await sessionHashes(db)).toEqual(afterFirstRun)
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
                signature: SIGNATURE,
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
                status: string
                signature: string | null
                failureReason: string | null
            }>`
            SELECT id, status, signature, failure_reason
            FROM messages_raw
            ORDER BY id
        `.execute(db)
            expect(result.rows).toEqual([
                {
                    id: 'alice-failed',
                    status: 'failed',
                    signature: null,
                    failureReason: 'rejected',
                },
                {
                    id: 'alice-pending',
                    status: 'awaiting-signature',
                    signature: null,
                    failureReason: null,
                },
                {
                    id: 'alice-regular',
                    status: 'signed',
                    signature: SIGNATURE,
                    failureReason: null,
                },
                {
                    id: 'bob-expired',
                    status: 'failed',
                    signature: null,
                    failureReason: SELF_ISSUED_LOGIN_EXPIRED,
                },
                {
                    id: 'bob-unfinished',
                    status: 'signed',
                    signature: SIGNATURE,
                    failureReason: null,
                },
            ])
        })

        test('deletes a completed login message even when a tokenless session remains', async () => {
            const db = getDb()
            await migrateUpToBefore(db, TARGET)
            const completedInput = signingInput(() => nowSeconds() + 3600)
            const openInput = signingInput(() => nowSeconds() + 7200)
            await insertSession(db, {
                id: 'alice-logged-in',
                network: 'network-1',
                accessToken: accessTokenFrom(completedInput),
                userId: 'alice',
                origin: 'https://app.example',
            })
            await insertSession(db, {
                id: 'alice-login',
                network: 'network-1',
                userId: 'alice',
                origin: 'https://example.com',
            })
            const signedToken = {
                ...message,
                kind: 'self-issued-token',
                status: 'signed',
                signature: SIGNATURE,
            }
            await insertMessageRaw(db, {
                ...signedToken,
                id: 'alice-used',
                message: completedInput,
            })
            await insertMessageRaw(db, {
                ...signedToken,
                id: 'alice-open',
                message: openInput,
            })

            await migrateUpThrough(db, TARGET)

            const result = await sql<{ id: string }>`
            SELECT id FROM messages_raw ORDER BY id
        `.execute(db)
            expect(result.rows).toEqual([{ id: 'alice-open' }])
        })

        test('cleans up awaiting-signature rows that still have a signature', async () => {
            const db = getDb()
            await migrateUpToBefore(db, TARGET)
            const usedInput = signingInput(() => nowSeconds() + 3600)
            const openInput = signingInput(() => nowSeconds() + 7200)
            const expiredInput = signingInput(anHourAgo)
            await insertSession(db, {
                id: 'alice-logged-in',
                network: 'network-1',
                accessToken: accessTokenFrom(usedInput),
                userId: 'alice',
                origin: 'https://app.example',
            })
            await insertSession(db, {
                id: 'bob-login',
                network: 'network-1',
                userId: 'bob',
                origin: 'https://example.com',
            })
            const leftover = {
                ...message,
                kind: 'self-issued-token',
                status: 'awaiting-signature',
                signature: SIGNATURE,
            }
            await insertMessageRaw(db, {
                ...leftover,
                id: 'alice-used',
                message: usedInput,
            })
            await insertMessageRaw(db, {
                ...leftover,
                id: 'bob-open',
                userId: 'bob',
                message: openInput,
            })
            await insertMessageRaw(db, {
                ...leftover,
                id: 'bob-expired',
                userId: 'bob',
                message: expiredInput,
            })

            await migrateUpThrough(db, TARGET)

            const result = await sql<{
                id: string
                status: string
                signature: string | null
                failureReason: string | null
            }>`
                SELECT id, status, signature, failure_reason
                FROM messages_raw
                ORDER BY id
            `.execute(db)
            expect(result.rows).toEqual([
                {
                    id: 'bob-expired',
                    status: 'failed',
                    signature: null,
                    failureReason: SELF_ISSUED_LOGIN_EXPIRED,
                },
                {
                    id: 'bob-open',
                    status: 'awaiting-signature',
                    signature: SIGNATURE,
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

            expect(await hasColumn(db, 'sessions', 'access_token')).toBe(true)
            expect(await hasColumn(db, 'sessions', 'access_token_hash')).toBe(
                false
            )
            expect(await sessionTokens(db)).toEqual([
                { id: 'onboarding', accessToken: null },
            ])
        })

        test('down can be retried after a rename without the following delete', async () => {
            const db = getDb()
            await migrateUpToBefore(db, TARGET)
            await seedSessions(db)
            await migrateUpThrough(db, TARGET)

            await sql`
            ALTER TABLE sessions
            RENAME COLUMN access_token_hash TO access_token
        `.execute(db)
            await down(db)

            expect(await hasColumn(db, 'sessions', 'access_token')).toBe(true)
            expect(await hasColumn(db, 'sessions', 'access_token_hash')).toBe(
                false
            )
            expect(await sessionTokens(db)).toEqual([
                { id: 'onboarding', accessToken: null },
            ])
        })

        test.skipIf(dialect !== 'postgres')(
            'hashes sessions when the table is not in the public schema',
            async () => {
                const db = getDb()
                await migrateUpToBefore(db, TARGET)
                await seedSessions(db)

                const dbName = (
                    await sql<{ currentDatabase: string }>`
                    SELECT current_database()
                `.execute(db)
                ).rows[0]!.currentDatabase
                await sql`CREATE SCHEMA wallet`.execute(db)
                await sql`ALTER TABLE sessions SET SCHEMA wallet`.execute(db)
                await sql
                    .raw(
                        `ALTER DATABASE "${dbName.replaceAll('"', '')}" SET search_path TO wallet, public`
                    )
                    .execute(db)

                const peer = postgresPeer(dbName)
                try {
                    await up(peer)
                    const columns = await sql<{ columnName: string }>`
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_schema = 'wallet' AND table_name = 'sessions'
                `.execute(peer)
                    const names = columns.rows.map((row) =>
                        row.columnName.toLowerCase()
                    )
                    expect(names).toContain('access_token_hash')
                    expect(names).not.toContain('access_token')
                    expect(await sessionHashes(peer)).toEqual([
                        {
                            id: 'logged-in',
                            accessTokenHash: sha256Hex(
                                'header.payload.signature'
                            ),
                        },
                        { id: 'onboarding', accessTokenHash: null },
                    ])
                } finally {
                    await peer.destroy()
                }
            }
        )

        test.skipIf(dialect !== 'postgres')(
            'hashes a session inserted while the migration waits for its table lock',
            async () => {
                const db = getDb()
                await migrateUpToBefore(db, TARGET)
                await seedSessions(db)

                const dbName = (
                    await sql<{ currentDatabase: string }>`
                    SELECT current_database()
                `.execute(db)
                ).rows[0]!.currentDatabase
                const holder = postgresPeer(dbName)
                const watcher = postgresPeer(dbName)
                try {
                    const trx = await holder.startTransaction().execute()
                    await insertSession(trx, {
                        id: 'late',
                        network: 'network-1',
                        accessToken: 'late.header.payload.sig',
                        userId: 'carol',
                        origin: 'https://late.example',
                    })
                    const upPromise = up(db)
                    await waitUntilMigrationIsBlocked(watcher)
                    await trx.commit().execute()
                    await upPromise

                    expect(await sessionHashes(db)).toEqual([
                        {
                            id: 'late',
                            accessTokenHash: sha256Hex(
                                'late.header.payload.sig'
                            ),
                        },
                        {
                            id: 'logged-in',
                            accessTokenHash: sha256Hex(
                                'header.payload.signature'
                            ),
                        },
                        { id: 'onboarding', accessTokenHash: null },
                    ])
                } finally {
                    await holder.destroy()
                    await watcher.destroy()
                }
            }
        )
    }
)

function postgresPeer(database: string) {
    return connection({
        connection: {
            type: 'postgres',
            host: process.env[PG_ENV.HOST]!,
            port: Number(process.env[PG_ENV.PORT]),
            user: process.env[PG_ENV.USER]!,
            password: process.env[PG_ENV.PASSWORD]!,
            database,
        },
    })
}

async function waitUntilMigrationIsBlocked(
    db: Kysely<DB>,
    timeoutMs = 10_000
): Promise<void> {
    const started = Date.now()
    while (Date.now() - started < timeoutMs) {
        const res = await sql<{ n: number }>`
            SELECT count(*)::int AS n
            FROM pg_stat_activity
            WHERE datname = current_database()
              AND pid <> pg_backend_pid()
              AND wait_event_type = 'Lock'
        `.execute(db)
        if ((res.rows[0]?.n ?? 0) > 0) {
            return
        }
        await new Promise((resolve) => setTimeout(resolve, 50))
    }
    throw new Error(
        'timed out waiting for the migration to block on the sessions lock'
    )
}
