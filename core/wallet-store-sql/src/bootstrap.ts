// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Kysely } from 'kysely'
import { StoreSql } from './store-sql.js'
import {
    assertUniqueSelfIssuedAudience,
    type BootstrapConfig,
} from '@canton-network/core-wallet-store'
import { fromIdp, fromNetwork, toNetwork, type DB } from './schema'

export async function bootstrap(
    db: Kysely<DB>,
    config: BootstrapConfig
): Promise<void> {
    const store = new StoreSql(db)

    // Load all IDPs from config into the store
    await Promise.all(config.idps.map((idp) => store.addIdp(idp)))

    // Load all networks from config into the store
    await Promise.all(
        config.networks.map((network) => store.addNetwork(network))
    )
}

/**
 * Inserts or updates the given IDPs and networks, so the store matches the
 * config on every start. Rows not mentioned in the config are left untouched.
 */
export async function upsertIdpsAndNetworks(
    db: Kysely<DB>,
    config: BootstrapConfig
): Promise<void> {
    await db.transaction().execute(async (trx) => {
        for (const idp of config.idps) {
            const row = fromIdp(idp)
            await trx
                .insertInto('idps')
                .values(row)
                .onConflict((oc) => oc.column('id').doUpdateSet(row))
                .execute()
        }

        // Networks from the config are unique among themselves, but may
        // collide with other networks that exist in the database
        const configNetworkIds = new Set(config.networks.map((n) => n.id))
        const otherNetworks = (
            await trx.selectFrom('networks').selectAll().execute()
        )
            .map(toNetwork)
            .filter((network) => !configNetworkIds.has(network.id))
        for (const network of config.networks) {
            assertUniqueSelfIssuedAudience(otherNetworks, network)
        }

        for (const network of config.networks) {
            const row = fromNetwork(network)
            await trx
                .insertInto('networks')
                .values(row)
                .onConflict((oc) => oc.column('id').doUpdateSet(row))
                .execute()
        }
    })
}
