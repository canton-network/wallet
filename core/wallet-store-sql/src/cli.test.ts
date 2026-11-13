// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import type {
    BootstrapConfig,
    StoreConfig,
} from '@canton-network/core-wallet-store'
import { createCLI } from './cli.js'
import { connection } from './store-sql.js'

const idp = {
    id: 'idp-1',
    type: 'self_signed',
    issuer: 'issuer',
} as const

const network = (id: string, name = id) =>
    ({
        id,
        name,
        description: name,
        identityProviderId: idp.id,
        ledgerApi: { baseUrl: 'http://localhost:6865' },
        auth: {
            method: 'self_signed',
            issuer: 'issuer',
            audience: 'aud',
            scope: 'scope',
            clientId: 'cid',
            clientSecret: 'secret',
        },
    }) as const

describe('db bootstrap command', () => {
    let dir: string
    let config: StoreConfig

    beforeEach(() => {
        dir = mkdtempSync(path.join(tmpdir(), 'wallet-store-cli-'))
        config = {
            connection: {
                type: 'sqlite',
                database: path.join(dir, 'store.sqlite'),
            },
        }
    })

    afterEach(() => {
        rmSync(dir, { recursive: true, force: true })
    })

    async function run(
        command: string,
        bootstrapConfig: BootstrapConfig,
        configIdpsAndNetworks: BootstrapConfig
    ) {
        await createCLI(config, bootstrapConfig, configIdpsAndNetworks)
            .exitOverride()
            .parseAsync(['node', 'cli', command])
    }

    async function networkNames() {
        const db = connection(config)
        try {
            return await db
                .selectFrom('networks')
                .select(['id', 'name'])
                .orderBy('id')
                .execute()
        } finally {
            await db.destroy()
        }
    }

    test('seeds bootstrap once and applies the top-level sections every time', async () => {
        const bootstrap = { idps: [idp], networks: [network('net-bootstrap')] }
        await run('up', bootstrap, { idps: [], networks: [] })

        await run('bootstrap', bootstrap, {
            idps: [idp],
            networks: [network('net-config')],
        })
        expect(await networkNames()).toEqual([
            { id: 'net-bootstrap', name: 'net-bootstrap' },
            { id: 'net-config', name: 'net-config' },
        ])

        // A second run skips bootstrap, which would fail for the existing
        // idp, and updates the network from the top-level sections
        await run(
            'bootstrap',
            { idps: [idp], networks: [network('net-other')] },
            { idps: [idp], networks: [network('net-config', 'Changed')] }
        )
        expect(await networkNames()).toEqual([
            { id: 'net-bootstrap', name: 'net-bootstrap' },
            { id: 'net-config', name: 'Changed' },
        ])
    })
})
