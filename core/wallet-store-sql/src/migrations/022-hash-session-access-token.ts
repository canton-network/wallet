// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto'

import { type Kysely, sql } from 'kysely'

import type { DB } from '../schema.ts'
import { isPostgres } from '../utils.ts'

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

// A self-issued message plus its signature is a full access token.
// Signed login messages only last a few minutes, so delete every such
// row. A login that was running during the upgrade has to be retried.
async function removeLeftoverSelfIssuedTokens(trx: Kysely<DB>): Promise<void> {
    await trx
        .deleteFrom('messagesRaw')
        .where('kind', '=', 'self-issued-token')
        .where('signature', 'is not', null)
        .execute()
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
        // alone.
        if (await hasColumn(trx, 'sessions', 'access_token')) {
            const sessions = await sql<{
                id: string
                accessToken: string | null
            }>`
                SELECT id, access_token FROM sessions
                WHERE access_token IS NOT NULL
            `.execute(trx)

            for (const { id, accessToken } of sessions.rows) {
                if (accessToken === null) {
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
