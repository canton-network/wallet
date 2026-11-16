// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type Kysely, sql } from 'kysely'

export async function isPostgres<T>(db: Kysely<T>): Promise<boolean> {
    try {
        // Try to query PostgreSQL system catalog
        await sql`SELECT 1 FROM pg_database LIMIT 1`.execute(db)
        return true
    } catch {
        return false
    }
}
