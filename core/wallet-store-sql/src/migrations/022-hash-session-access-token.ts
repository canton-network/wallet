// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto'
import type { Kysely } from 'kysely'
import type { DB } from '../schema.js'

// A raw token is a JWT and always contains dots, so a value of this form has
// already been hashed. Skipping those keeps the migration safe to re-run.
const SHA256_HEX = /^[0-9a-f]{64}$/

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

        // Signed self-issued tokens left behind by logins that already completed.
        await trx
            .deleteFrom('messagesRaw')
            .where('kind', '=', 'self-issued-token')
            .where('status', '=', 'signed')
            .execute()
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
