// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateKeyId } from '@canton-network/core-wallet-auth'
import { Kysely } from 'kysely'
import { DB } from '../schema.js'

// Backfills network.auth.keyId on every network using self_signed auth

export async function up(db: Kysely<DB>): Promise<void> {
    console.log('Backfilling keyId for self_signed networks')

    const networks = await db
        .selectFrom('networks')
        .select(['id', 'auth'])
        .execute()

    for (const network of networks) {
        const auth = JSON.parse(network.auth)
        if (auth.method !== 'self_signed' || auth.keyId) continue

        await db
            .updateTable('networks')
            .set({ auth: JSON.stringify({ ...auth, keyId: generateKeyId() }) })
            .where('id', '=', network.id)
            .execute()
    }
}

export async function down(db: Kysely<DB>): Promise<void> {
    const networks = await db
        .selectFrom('networks')
        .select(['id', 'auth'])
        .execute()

    for (const network of networks) {
        const { keyId, ...auth } = JSON.parse(network.auth)
        if (auth.method !== 'self_signed' || !keyId) continue

        await db
            .updateTable('networks')
            .set({ auth: JSON.stringify(auth) })
            .where('id', '=', network.id)
            .execute()
    }
}
