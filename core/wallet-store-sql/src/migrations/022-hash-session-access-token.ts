// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto'

import { type Kysely, sql } from 'kysely'

import type { DB } from '../schema.ts'
import { isPostgres } from '../utils.ts'

// A raw token is a JWT and always contains dots, so a value of this form has
// already been hashed. Skipping those keeps the migration safe to re-run.
const SHA256_HEX = /^[0-9a-f]{64}$/

async function hasColumn(
    db: Kysely<DB>,
    table: string,
    column: string
): Promise<boolean> {
    if (await isPostgres(db)) {
        // Resolve the table through search_path so a sessions table that
        // isn't in public still hashes and renames the same column.
        const res = await sql<{ exists: boolean }>`
            SELECT EXISTS (
                SELECT 1
                FROM pg_attribute a
                WHERE a.attrelid = to_regclass(${table})::oid
                  AND a.attname = ${column}
                  AND a.attnum > 0
                  AND NOT a.attisdropped
            ) AS exists
        `.execute(db)
        return res.rows[0]?.exists ?? false
    }
    const res = await sql<{ name: string }>`
        SELECT name FROM pragma_table_info(${table}) WHERE name = ${column}
    `.execute(db)
    return res.rows.length > 0
}

// The signing input is `header.payload` of a JWT. Anything without a
// readable `exp` counts as expired, the same as at login.
function isExpired(signingInput: string, nowSeconds: number): boolean {
    try {
        const payload = JSON.parse(
            Buffer.from(signingInput.split('.')[1] ?? '', 'base64url').toString(
                'utf8'
            )
        ) as { exp?: unknown }
        return typeof payload.exp !== 'number' || payload.exp <= nowSeconds
    } catch {
        return true
    }
}

// Must match SELF_ISSUED_LOGIN_EXPIRED in core-wallet-services so a
// status poll after the migration shows the same expired-login error.
const SELF_ISSUED_LOGIN_EXPIRED =
    'Self-issued access token expired before login could be completed.'

function sha256Hex(value: string): string {
    return createHash('sha256').update(value, 'utf8').digest('hex')
}

// Rebuilds the JWT the same way SelfIssuedTokenService.appendJwtSignature
// does: the stored signature is standard base64, the JWT uses base64url.
function reconstructAccessToken(
    signingInput: string,
    signature: string | null
): string | null {
    if (!signature) {
        return null
    }
    try {
        const signatureBytes = Buffer.from(signature, 'base64')
        if (signatureBytes.length === 0) {
            return null
        }
        return `${signingInput}.${signatureBytes.toString('base64url')}`
    } catch {
        return null
    }
}

// A signed self-issued message plus its signature is a full access token.
// Failed logins never use it, so their signatures are cleared. Signed ones
// that rebuild a token already stored on an authenticated session are
// deleted. Remaining signed ones are kept only if the login can still
// finish: the token hasn't expired and the user still has a tokenless
// login session on that network. If that login is open but the token has
// expired, the message is marked failed so a status poll can show why.
async function removeLeftoverSelfIssuedTokens(trx: Kysely<DB>): Promise<void> {
    await trx
        .updateTable('messagesRaw')
        .set({ signature: null })
        .where('kind', '=', 'self-issued-token')
        .where('status', '=', 'failed')
        .execute()

    const signed = await trx
        .selectFrom('messagesRaw')
        .select(['id', 'userId', 'networkId', 'message', 'signature'])
        .where('kind', '=', 'self-issued-token')
        .where('status', '=', 'signed')
        .execute()
    const sessions = await trx
        .selectFrom('sessions')
        .select(['userId', 'network', 'accessTokenHash'])
        .execute()
    const unfinished = new Set(
        sessions
            .filter((s) => s.accessTokenHash === null)
            .map((s) => JSON.stringify([s.userId, s.network]))
    )
    const authenticatedHashes = new Set(
        sessions
            .filter((s) => s.accessTokenHash !== null)
            .map((s) =>
                JSON.stringify([s.userId, s.network, s.accessTokenHash])
            )
    )
    const nowSeconds = Math.floor(Date.now() / 1000)

    for (const message of signed) {
        const token = reconstructAccessToken(message.message, message.signature)
        const matchesAuthenticatedSession =
            token !== null &&
            authenticatedHashes.has(
                JSON.stringify([
                    message.userId,
                    message.networkId,
                    sha256Hex(token),
                ])
            )
        if (matchesAuthenticatedSession) {
            await trx
                .deleteFrom('messagesRaw')
                .where('id', '=', message.id)
                .execute()
            continue
        }

        const loginOpen = unfinished.has(
            JSON.stringify([message.userId, message.networkId])
        )
        if (loginOpen && !isExpired(message.message, nowSeconds)) {
            continue
        }
        if (loginOpen) {
            await trx
                .updateTable('messagesRaw')
                .set({
                    status: 'failed',
                    signature: null,
                    failureReason: SELF_ISSUED_LOGIN_EXPIRED,
                })
                .where('id', '=', message.id)
                .execute()
            continue
        }
        await trx
            .deleteFrom('messagesRaw')
            .where('id', '=', message.id)
            .execute()
    }
}

export async function up(db: Kysely<DB>): Promise<void> {
    await db.transaction().execute(async (trx) => {
        if (await isPostgres(trx)) {
            // Hold the table so another gateway cannot insert a raw
            // token after the SELECT and have it renamed unhashed.
            await sql`LOCK TABLE sessions IN ACCESS EXCLUSIVE MODE`.execute(trx)
        }
        // First run hashes values in access_token and then renames the
        // column. A second run finds the new name and leaves the hashes
        // alone, including values that were already 64-character hex.
        if (await hasColumn(trx, 'sessions', 'access_token')) {
            const sessions = await sql<{
                id: string
                accessToken: string | null
            }>`
                SELECT id, access_token FROM sessions
                WHERE access_token IS NOT NULL
            `.execute(trx)

            for (const { id, accessToken } of sessions.rows) {
                if (accessToken === null || SHA256_HEX.test(accessToken)) {
                    continue
                }
                const accessTokenHash = createHash('sha256')
                    .update(accessToken, 'utf8')
                    .digest('hex')
                await sql`
                    UPDATE sessions
                    SET access_token = ${accessTokenHash}
                    WHERE id = ${id}
                `.execute(trx)
            }

            await sql`
                ALTER TABLE sessions
                RENAME COLUMN access_token TO access_token_hash
            `.execute(trx)
        }

        await removeLeftoverSelfIssuedTokens(trx)
    })
}

// Hashes can't be reversed, and older code looks sessions up by the raw
// token, so hashed sessions are dropped and their users log in again.
export async function down(db: Kysely<DB>): Promise<void> {
    await db.transaction().execute(async (trx) => {
        // Both statements have to commit together so a retry still works
        // if rollback is interrupted after the rename. hasColumn lets a
        // retry skip the rename when it already happened.
        if (await hasColumn(trx, 'sessions', 'access_token_hash')) {
            await sql`
                ALTER TABLE sessions
                RENAME COLUMN access_token_hash TO access_token
            `.execute(trx)
        }
        await sql`
            DELETE FROM sessions WHERE access_token IS NOT NULL
        `.execute(trx)
    })
}
