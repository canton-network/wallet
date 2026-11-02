// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import type { Kysely } from 'kysely'
import type { BootstrapConfig } from '@canton-network/core-wallet-store'
import { bootstrap, upsertIdpsAndNetworks } from './bootstrap.js'
import { migrator } from './migrator.js'
import { connection } from './store-sql.js'
import type { DB } from './schema.js'

const bootstrapConfig: BootstrapConfig = {
    idps: [
        {
            id: 'idp-1',
            type: 'oauth',
            issuer: 'https://issuer.example',
            configUrl:
                'https://issuer.example/.well-known/openid-configuration',
        },
        {
            id: 'idp-2',
            type: 'self_signed',
            issuer: 'unsafe-auth',
        },
    ],
    networks: [
        {
            id: 'net-1',
            name: 'Devnet',
            description: 'Bootstrap network',
            identityProviderId: 'idp-1',
            ledgerApi: { baseUrl: 'http://localhost:6865' },
            auth: {
                method: 'client_credentials',
                audience: 'aud',
                scope: 'scope',
                clientId: 'cid',
                clientSecret: 'secret',
            },
        },
    ],
}

describe('bootstrap', () => {
    let db: Kysely<DB>

    beforeEach(async () => {
        db = connection({
            connection: { type: 'memory' },
        })
        await migrator(db).up()
    })

    afterEach(async () => {
        await db.destroy()
    })

    test('loads configured idps and networks into the store', async () => {
        await bootstrap(db, bootstrapConfig)

        const idps = await db.selectFrom('idps').selectAll().execute()
        const networks = await db.selectFrom('networks').selectAll().execute()

        expect(idps.map((row) => row.id).sort()).toEqual(['idp-1', 'idp-2'])
        expect(networks).toHaveLength(1)
        expect(networks[0]?.id).toBe('net-1')
        expect(networks[0]?.ledgerApiBaseUrl).toBe('http://localhost:6865')
    })
})

describe('upsertIdpsAndNetworks', () => {
    let db: Kysely<DB>

    beforeEach(async () => {
        db = connection({
            connection: { type: 'memory' },
        })
        await migrator(db).up()
    })

    afterEach(async () => {
        await db.destroy()
    })

    test('inserts missing idps and networks', async () => {
        await upsertIdpsAndNetworks(db, bootstrapConfig)

        const idps = await db.selectFrom('idps').selectAll().execute()
        const networks = await db.selectFrom('networks').selectAll().execute()

        expect(idps.map((row) => row.id).sort()).toEqual(['idp-1', 'idp-2'])
        expect(networks.map((row) => row.id)).toEqual(['net-1'])
    })

    test('rejects a self-issued audience used by another network', async () => {
        const selfIssuedNetwork = {
            id: 'net-self-issued',
            name: 'Self-issued',
            description: 'Self-issued network',
            identityProviderId: 'idp-self-issued',
            ledgerApi: { baseUrl: 'http://localhost:6865' },
            auth: {
                method: 'self_issued',
                audience: 'shared-audience',
                scope: 'daml_ledger_api',
            },
        } as const
        const idps = [{ id: 'idp-self-issued', type: 'self_issued' } as const]
        await bootstrap(db, { idps, networks: [selfIssuedNetwork] })

        await expect(
            upsertIdpsAndNetworks(db, {
                idps,
                networks: [{ ...selfIssuedNetwork, id: 'net-config' }],
            })
        ).rejects.toThrow(
            'Self-issued audience "shared-audience" is already used by network "net-self-issued"'
        )
        // The update of the same network is fine
        await upsertIdpsAndNetworks(db, { idps, networks: [selfIssuedNetwork] })
    })

    test('updates existing rows and keeps rows not in the config', async () => {
        await bootstrap(db, bootstrapConfig)
        await db
            .insertInto('networks')
            .values({
                ...(await db
                    .selectFrom('networks')
                    .selectAll()
                    .where('id', '=', 'net-1')
                    .executeTakeFirstOrThrow()),
                id: 'net-ui',
                name: 'Added via UI',
            })
            .execute()

        const [network] = bootstrapConfig.networks
        await db
            .updateTable('networks')
            .set({ adminAuth: JSON.stringify(network.auth) })
            .where('id', '=', 'net-1')
            .execute()
        await upsertIdpsAndNetworks(db, {
            idps: [
                {
                    id: 'idp-1',
                    type: 'oauth',
                    issuer: 'https://new-issuer.example',
                    configUrl:
                        'https://new-issuer.example/.well-known/openid-configuration',
                },
            ],
            networks: [
                {
                    ...network,
                    ledgerApi: { baseUrl: 'http://localhost:7575' },
                },
            ],
        })

        const idp = await db
            .selectFrom('idps')
            .selectAll()
            .where('id', '=', 'idp-1')
            .executeTakeFirstOrThrow()
        const networks = await db
            .selectFrom('networks')
            .selectAll()
            .orderBy('id')
            .execute()

        expect(idp.issuer).toBe('https://new-issuer.example')
        expect(networks.map((row) => [row.id, row.ledgerApiBaseUrl])).toEqual([
            ['net-1', 'http://localhost:7575'],
            ['net-ui', 'http://localhost:6865'],
        ])
        expect(networks[0]?.adminAuth).toBeNull()
    })

    test('keeps wallets and sessions of networks it takes over', async () => {
        await bootstrap(db, bootstrapConfig)
        await db
            .insertInto('wallets')
            .values({
                primary: 1,
                partyId: 'party::1',
                hint: 'hint',
                publicKey: 'pk',
                namespace: 'ns',
                networkId: 'net-1',
                signingProviderId: 'internal',
                userId: 'alice',
                externalTxId: null,
                topologyTransactions: null,
                status: null,
                disabled: 0,
                reason: null,
                isAuthParty: 0,
            })
            .execute()
        await db
            .insertInto('sessions')
            .values({
                id: 'session-1',
                origin: 'http://localhost',
                network: 'net-1',
                accessToken: 'token',
                userId: 'alice',
            })
            .execute()

        const [network] = bootstrapConfig.networks
        const changed = { ...network, name: 'Changed by config' }
        // Twice, like two starts with the same config
        await upsertIdpsAndNetworks(db, {
            ...bootstrapConfig,
            networks: [changed],
        })
        await upsertIdpsAndNetworks(db, {
            ...bootstrapConfig,
            networks: [changed],
        })

        const wallets = await db
            .selectFrom('wallets')
            .select('partyId')
            .execute()
        const sessions = await db.selectFrom('sessions').select('id').execute()
        const networks = await db
            .selectFrom('networks')
            .select(['id', 'name'])
            .execute()
        expect(wallets).toEqual([{ partyId: 'party::1' }])
        expect(sessions).toEqual([{ id: 'session-1' }])
        expect(networks).toEqual([{ id: 'net-1', name: 'Changed by config' }])
    })
})
