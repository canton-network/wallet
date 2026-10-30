// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { rawConfigSchema } from './Config.js'
import { ConfigUtils } from './ConfigUtils.js'
import { isSecretKey, REDACTED, toDisplayConfig } from './display-config.js'

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

describe('toDisplayConfig', () => {
    it('redacts every config field that looks like a secret', () => {
        const names = collectPropertyNames(
            z.toJSONSchema(rawConfigSchema, { io: 'input' })
        )
        const secretLike = [...names].filter((name) =>
            /secret|password|key|token|cert/i.test(name)
        )

        // Fails if a new secret-like field is neither an `*Env` reference nor
        // redacted, extend the pattern in display-config.ts in that case.
        expect(
            secretLike.filter(
                (name) => !name.endsWith('Env') && !isSecretKey(name)
            )
        ).toEqual([])
        expect(secretLike.filter(isSecretKey).sort()).toEqual([
            'clientSecret',
            'password',
        ])
    })

    it('redacts inline secrets but keeps env variable names', () => {
        const rawConfig = ConfigUtils.loadRawConfigFile('../test/config.json')
        const [network] = rawConfig.bootstrap.networks
        const display = toDisplayConfig({
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
                            clientSecret: 'inline-client-secret',
                        },
                    },
                ],
            },
            store: {
                connection: {
                    type: 'postgres',
                    host: 'localhost',
                    port: 5432,
                    user: 'wallet',
                    passwordEnv: 'DB_PASSWORD',
                    database: 'wallet',
                    ssl: { ca: 'ca-cert', key: 'private-key' },
                },
            },
        })

        expect(display.store).toEqual({
            connection: {
                type: 'postgres',
                host: 'localhost',
                port: 5432,
                user: 'wallet',
                passwordEnv: 'DB_PASSWORD',
                database: 'wallet',
                ssl: { ca: 'ca-cert', key: REDACTED },
            },
        })
        expect(JSON.stringify(display)).not.toContain('inline-client-secret')
        expect(JSON.stringify(display)).toContain(REDACTED)
    })
})
