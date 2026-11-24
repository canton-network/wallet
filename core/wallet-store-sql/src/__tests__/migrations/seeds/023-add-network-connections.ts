// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type Kysely, sql } from 'kysely'

import type { DB } from '../../../schema.ts'

export async function insertNetworkConnection(
    db: Kysely<DB>,
    row: {
        id: string
        sessionId: string
        authMethod: string
        userId: string
        payload: unknown
        expiresAt?: string
        createdAt: string
    }
): Promise<void> {
    await sql`
        INSERT INTO network_connections
            (id, session_id, auth_method, user_id, payload, expires_at, created_at)
        VALUES (
            ${row.id},
            ${row.sessionId},
            ${row.authMethod},
            ${row.userId},
            ${JSON.stringify(row.payload)},
            ${row.expiresAt ?? null},
            ${row.createdAt}
        )
    `.execute(db)
}
