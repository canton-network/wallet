// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Kysely } from 'kysely'
import { StoreSql } from './store-sql.ts'
import type { DB } from './schema.ts'

export async function bootstrap(db: Kysely<DB>): Promise<void> {
    new StoreSql(db)
}
