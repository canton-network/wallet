// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { pino } from 'pino'
import { z } from 'zod'
import { rawConfigSchema } from './Config.js'
import { ConfigUtils, SECRET_CONFIG_KEYS } from './ConfigUtils.js'
import { ServerNotices } from '../notices/server-notices.js'

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
    const [network, ...networks] = config.bootstrap.networks
    return {
        ...config,
        bootstrap: {
            ...config.bootstrap,
            networks: [{ ...network, adminAuth: inlineAdminAuth }, ...networks],
        },
    }
}

function collectPropertyNames(schema: unknown, names = new Set<string>()) {
    if (Array.isArray(schema)) {
        schema.forEach((entry) => collectPropertyNames(entry, names))
    } else if (schema !== null && typeof schema === 'object') {
        for (const [key, value] of Object.entries(schema)) {
            if (key === 'properties' && value && typeof value === 'object') {
                Object.keys(value).forEach((name) => names.add(name))
            }
            collectPropertyNames(value, names)
        }
    }
    return names
}

describe('ConfigUtils.parseConfig notices', () => {
    const logger = pino({ level: 'silent' })

    function reportedNotices(config: unknown) {
        const notices = new ServerNotices(logger)
        ConfigUtils.parseConfig(config, notices)
        return notices.list()
    }

    it('reports nothing for the test config', () => {
        expect(reportedNotices(testConfig)).toEqual([])
    })

    it('reports server.host and server.tls with the action to take', () => {
        const notices = reportedNotices({
            ...testConfig,
            server: { ...testConfig.server, host: 'localhost', tls: false },
        })

        expect(notices).toEqual([
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

    it('reports inline secrets with the env field to use', () => {
        const notices = reportedNotices({
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

        expect(notices).toEqual([
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
})

describe('ConfigUtils.parseConfig displayConfig', () => {
    it('covers every secret field of the config schema', () => {
        const names = collectPropertyNames(
            z.toJSONSchema(rawConfigSchema, { io: 'input' })
        )
        // Fails if a new secret-like field is neither an `*Env` reference nor
        // listed in SECRET_CONFIG_KEYS, extend the list in that case.
        const unredacted = [...names].filter(
            (name) =>
                /secret|password|key|token|cert/i.test(name) &&
                !name.endsWith('Env') &&
                !SECRET_CONFIG_KEYS.has(name)
        )
        expect(unredacted).toEqual([])
    })

    it('redacts inline secrets but keeps env variable names', () => {
        const { displayConfig } = ConfigUtils.parseConfig({
            ...withInlineAdminSecret(testConfig),
            store: {
                connection: {
                    ...postgresConnection,
                    passwordEnv: 'WG_TEST_POSTGRES_PASSWORD',
                    ssl: { ca: 'ca-cert', key: 'private-key' },
                },
            },
        })

        expect(displayConfig.store).toEqual({
            connection: {
                ...postgresConnection,
                passwordEnv: 'WG_TEST_POSTGRES_PASSWORD',
                ssl: { ca: 'ca-cert', key: '*****' },
            },
        })
        const serialized = JSON.stringify(displayConfig)
        expect(serialized).not.toContain('inline-client-secret')
        expect(serialized).toContain('WG_TEST_ADMIN_CLIENT_SECRET')
    })
})
