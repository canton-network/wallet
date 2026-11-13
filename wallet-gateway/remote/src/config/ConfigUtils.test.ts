// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ConfigUtils } from './ConfigUtils.js'

const testConfig = JSON.parse(readFileSync('../test/config.json', 'utf-8'))

const postgresConnection = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    user: 'wallet',
    database: 'wallet',
}

const inlineAdminAuth = {
    method: 'client_credentials',
    scope: 'daml_ledger_api',
    audience: 'audience',
    clientId: 'participant_admin',
    clientSecret: 'inline-client-secret',
}

function withInlineAdminSecret(config: typeof testConfig) {
    const [network] = config.networks
    const idp = config.idps.find(
        (idp: { id: string }) => idp.id === network.identityProviderId
    )
    return {
        ...config,
        // Only the deprecated bootstrap section is used for inline secrets here
        bootstrap: {
            idps: [{ ...idp, id: 'bootstrap-idp' }],
            networks: [
                {
                    ...network,
                    id: 'bootstrap-network',
                    identityProviderId: 'bootstrap-idp',
                    adminAuth: inlineAdminAuth,
                },
            ],
        },
    }
}

describe('ConfigUtils.parseConfig warnings', () => {
    const warnings = (config: unknown) =>
        ConfigUtils.parseConfig(config).warnings
    const inlineSecretWarnings = (config: unknown) =>
        warnings(config).filter((warning) =>
            warning.id.startsWith('inline-secret:')
        )

    it('returns no warnings for the test config', () => {
        expect(warnings(testConfig)).toEqual([])
    })

    it('warns about bootstrap with the migration to take', () => {
        expect(
            warnings({ ...testConfig, bootstrap: { idps: [], networks: [] } })
        ).toEqual([
            expect.objectContaining({
                id: 'deprecated-config:bootstrap',
                severity: 'warning',
                message: expect.stringContaining(
                    'Move bootstrap.idps to idps and bootstrap.networks to networks'
                ),
            }),
        ])
    })

    it('warns about server.host and server.tls with the action to take', () => {
        expect(
            warnings({
                ...testConfig,
                server: { ...testConfig.server, host: 'localhost', tls: false },
            })
        ).toEqual([
            expect.objectContaining({
                id: 'deprecated-config:server.host',
                severity: 'warning',
                message: expect.stringContaining(
                    'Remove server.host from the config file.'
                ),
            }),
            expect.objectContaining({
                id: 'deprecated-config:server.tls',
                severity: 'warning',
                message: expect.stringContaining(
                    'Remove server.tls from the config file.'
                ),
            }),
        ])
    })

    it('warns about inline secrets with the env field to use', () => {
        expect(
            inlineSecretWarnings({
                ...withInlineAdminSecret(testConfig),
                store: {
                    connection: { ...postgresConnection, password: 'inline' },
                },
                signingStore: {
                    connection: {
                        ...postgresConnection,
                        passwordEnv: 'WG_TEST_POSTGRES_PASSWORD',
                    },
                },
            })
        ).toEqual([
            expect.objectContaining({
                id: 'inline-secret:store.connection.password',
                severity: 'warning',
                message: expect.stringContaining('Prefer passwordEnv'),
            }),
            expect.objectContaining({
                id: 'inline-secret:bootstrap.networks[0].adminAuth.clientSecret',
                severity: 'warning',
                message: expect.stringContaining('Prefer clientSecretEnv'),
            }),
        ])
    })

    it('warns about inline secrets of config-managed networks', () => {
        const [network, ...networks] = testConfig.networks

        expect(
            warnings({
                ...testConfig,
                networks: [
                    { ...network, adminAuth: inlineAdminAuth },
                    ...networks,
                ],
            }).map((warning) => warning.id)
        ).toEqual(['inline-secret:networks[0].adminAuth.clientSecret'])
    })
})
