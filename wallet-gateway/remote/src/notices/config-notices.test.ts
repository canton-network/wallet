// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { pino } from 'pino'
import { ConfigUtils } from '../config/ConfigUtils.js'
import {
    reportDeprecatedConfig,
    reportInlineSecrets,
} from './config-notices.js'
import { ServerNotices } from './server-notices.js'

describe('reportDeprecatedConfig', () => {
    const logger = pino({ level: 'silent' })
    const rawConfig = ConfigUtils.loadRawConfigFile('../test/config.json')

    it('reports nothing for a config without deprecated fields', () => {
        const notices = new ServerNotices(logger)
        reportDeprecatedConfig(rawConfig, notices)

        expect(notices.list()).toEqual([])
    })

    it('reports each deprecated field that is set', () => {
        const notices = new ServerNotices(logger)
        reportDeprecatedConfig(
            {
                ...rawConfig,
                server: { ...rawConfig.server, host: 'localhost', tls: false },
            },
            notices
        )

        expect(notices.list()).toEqual([
            expect.objectContaining({
                id: 'deprecated-config:server.host',
                severity: 'warning',
                configPath: 'server.host',
                message: expect.stringContaining(
                    'Config field server.host is deprecated.'
                ),
            }),
            expect.objectContaining({
                id: 'deprecated-config:server.tls',
                configPath: 'server.tls',
            }),
        ])
    })
})

describe('reportInlineSecrets', () => {
    const logger = pino({ level: 'silent' })
    const rawConfig = ConfigUtils.loadRawConfigFile('../test/config.json')

    it('reports inline secrets but not secrets read from env', () => {
        const notices = new ServerNotices(logger)
        reportInlineSecrets(
            {
                ...rawConfig,
                store: {
                    connection: {
                        type: 'postgres',
                        host: 'localhost',
                        port: 5432,
                        user: 'wallet',
                        password: 'inline',
                        database: 'wallet',
                    },
                },
                signingStore: {
                    connection: {
                        type: 'postgres',
                        host: 'localhost',
                        port: 5432,
                        user: 'wallet',
                        passwordEnv: 'SIGNING_DB_PASSWORD',
                        database: 'signing',
                    },
                },
                bootstrap: { idps: [], networks: [] },
            },
            notices
        )

        expect(notices.list()).toEqual([
            expect.objectContaining({
                id: 'inline-secret:store.connection.password',
                severity: 'warning',
                configPath: 'store.connection.password',
                message: expect.stringContaining('use passwordEnv'),
            }),
        ])
    })

    it('reports nothing for the test config, which reads secrets from env', () => {
        const notices = new ServerNotices(logger)
        reportInlineSecrets(rawConfig, notices)

        expect(notices.list()).toEqual([])
    })

    it('reports inline network client secrets', () => {
        const notices = new ServerNotices(logger)
        const [network] = rawConfig.bootstrap.networks
        reportInlineSecrets(
            {
                ...rawConfig,
                bootstrap: {
                    ...rawConfig.bootstrap,
                    networks: [
                        {
                            ...network,
                            adminAuth: {
                                method: 'client_credentials',
                                scope: 'daml_ledger_api',
                                audience: 'audience',
                                clientId: 'participant_admin',
                                clientSecret: 'inline',
                            },
                        },
                    ],
                },
            },
            notices
        )

        expect(notices.list().map((notice) => notice.configPath)).toEqual([
            'bootstrap.networks[0].adminAuth.clientSecret',
        ])
    })
})
