// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto'
import type { Kysely } from 'kysely'
import type { DB } from '../schema.js'

// A raw token is a JWT and always contains dots, so a value of this form has
// already been hashed. Skipping those keeps the migration safe to re-run.
const SHA256_HEX = /^[0-9a-f]{64}$/

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

// A signed self-issued message plus its signature is a full access token.
// Failed logins never use it, so their signatures are cleared. Signed ones
// are deleted unless the login can still finish: the token hasn't expired
// and the user still has a tokenless login session on that network.
async function removeLeftoverSelfIssuedTokens(trx: Kysely<DB>): Promise<void> {
    await trx
        .updateTable('messagesRaw')
        .set({ signature: null })
        .where('kind', '=', 'self-issued-token')
        .where('status', '=', 'failed')
        .execute()

    const signed = await trx
        .selectFrom('messagesRaw')
        .select(['id', 'userId', 'networkId', 'message'])
        .where('kind', '=', 'self-issued-token')
        .where('status', '=', 'signed')
        .execute()
    const loginSessions = await trx
        .selectFrom('sessions')
        .select(['userId', 'network'])
        .where('accessToken', 'is', null)
        .execute()
    const unfinished = new Set(
        loginSessions.map((s) => JSON.stringify([s.userId, s.network]))
    )
    const nowSeconds = Math.floor(Date.now() / 1000)

    for (const message of signed) {
        const loginOpen = unfinished.has(
            JSON.stringify([message.userId, message.networkId])
        )
        if (loginOpen && !isExpired(message.message, nowSeconds)) {
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
        const sessions = await trx
            .selectFrom('sessions')
            .select(['id', 'accessToken'])
            .where('accessToken', 'is not', null)
            .execute()

        for (const { id, accessToken } of sessions) {
            if (accessToken === null || SHA256_HEX.test(accessToken)) {
                continue
            }
            await trx
                .updateTable('sessions')
                .set({
                    accessToken: createHash('sha256')
                        .update(accessToken, 'utf8')
                        .digest('hex'),
                })
                .where('id', '=', id)
                .execute()
        }

        await removeLeftoverSelfIssuedTokens(trx)
    })
}

// Hashes can't be reversed, and older code looks sessions up by the raw
// token, so hashed sessions are dropped and their users log in again.
export async function down(db: Kysely<DB>): Promise<void> {
    await db
        .deleteFrom('sessions')
        .where('accessToken', 'is not', null)
        .execute()
}
