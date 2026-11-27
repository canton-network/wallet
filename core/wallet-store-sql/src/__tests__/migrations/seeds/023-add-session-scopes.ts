// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type Kysely, sql } from 'kysely'

import type { DB } from '../../../schema.ts'

export async function insertSession(
    db: Kysely<DB>,
    row: {
        id: string
        network: string
        accessTokenHash?: string
        userId: string
        origin: string
        scopes?: string
    }
): Promise<void> {
    await sql`
        INSERT INTO sessions (id, network, access_token_hash, user_id, origin, scopes)
        VALUES (
            ${row.id},
            ${row.network},
            ${row.accessTokenHash ?? null},
            ${row.userId},
            ${row.origin},
            ${row.scopes ?? null}
        )
    `.execute(db)
}
