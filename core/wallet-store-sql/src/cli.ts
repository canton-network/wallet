// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Command } from 'commander'
import { connection } from './store-sql.js'
import { migrator } from './migrator.js'
import type {
    StoreConfig,
    BootstrapConfig,
} from '@canton-network/core-wallet-store'
import { bootstrap, upsertIdpsAndNetworks } from './bootstrap.js'
import { getLogger } from '@logtape/logtape'

const logger = getLogger(['core', 'wallet-store-sql', 'cli'])

/**
 * @param bootstrapConfig IDPs and networks that are only inserted
 * @param configIdpsAndNetworks IDPs and networks that are inserted or updated
 */
export function createCLI(
    config: StoreConfig,
    bootstrapConfig: BootstrapConfig,
    configIdpsAndNetworks: BootstrapConfig
): Command {
    const program = new Command()

    program
        .command('up')
        .description('Run all pending migrations')
        .action(async () => {
            const db = connection(config)
            const umzug = migrator(db)
            await umzug.up()
            await db.destroy()
        })

    program
        .command('down')
        .description('Rollback last migration')
        .action(async () => {
            const db = connection(config)
            const umzug = migrator(db)
            await umzug.down()
            await db.destroy()
        })

    program
        .command('status')
        .description('Show executed and pending migrations')
        .action(async () => {
            const db = connection(config)
            const umzug = migrator(db)
            const executed = await umzug.executed()
            const pending = await umzug.pending()

            logger.info('Executed migrations: {executed}', { executed })
            logger.info('Pending migrations: {pending}', { pending })

            await db.destroy()
        })

    program
        .command('reset')
        .description('Rollback all migrations and reapply them')
        .action(async () => {
            const db = connection(config)
            const umzug = migrator(db)
            const executed = await umzug.executed()

            // Rollback all executed migrations in reverse order
            for (const migration of executed.reverse()) {
                await umzug.down({ to: migration.name })
            }

            // Reapply all migrations
            await umzug.up()
            await db.destroy()
        })

    program
        .command('bootstrap')
        .description('Bootstrap DB from config')
        .action(async () => {
            const db = connection(config)
            // Like on start, the deprecated bootstrap section is only written
            // to an empty database
            const idp = await db
                .selectFrom('idps')
                .select('id')
                .executeTakeFirst()
            const network = await db
                .selectFrom('networks')
                .select('id')
                .executeTakeFirst()
            if (idp || network) {
                logger.info(
                    'Skipping the bootstrap section, the database already contains identity providers or networks'
                )
            } else {
                await bootstrap(db, bootstrapConfig)
            }
            await upsertIdpsAndNetworks(db, configIdpsAndNetworks)
            await db.destroy()
        })

    return program
}
