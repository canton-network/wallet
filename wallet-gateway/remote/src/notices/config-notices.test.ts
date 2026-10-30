// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { pino } from 'pino'
import { ConfigUtils } from '../config/ConfigUtils.js'
import { reportDeprecatedConfig } from './config-notices.js'
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
