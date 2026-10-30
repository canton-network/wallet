// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { rawConfigSchema } from './Config.js'
import { collectFieldNames, REDACTED, redactSecrets } from './redact-secrets.js'

const testConfig = JSON.parse(readFileSync('../test/config.json', 'utf-8'))

describe('redactSecrets', () => {
    it('finds every secret-like field of the config schema marked as secret', () => {
        const { known, secret } = collectFieldNames(
            z.toJSONSchema(rawConfigSchema, { io: 'input' })
        )
        // Fails if a secret-like config field is neither an `*Env` reference
        // nor marked with `.meta({ secret: true })` where it is defined
        const unmarked = [...known].filter(
            (name) =>
                /secret|password|key|token|cert/i.test(name) &&
                !name.endsWith('Env') &&
                !secret.has(name)
        )
        expect(unmarked).toEqual([])
    })

    it('redacts fields marked as secret in any union branch', () => {
        const schema = z.object({
            auth: z.discriminatedUnion('method', [
                z.object({
                    method: z.literal('inline'),
                    clientSecret: z.string().meta({ secret: true }),
                }),
                z.object({
                    method: z.literal('env'),
                    clientSecretEnv: z.string(),
                }),
            ]),
        })

        expect(
            redactSecrets(schema, {
                auth: { method: 'inline', clientSecret: 'secret' },
            })
        ).toEqual({ auth: { method: 'inline', clientSecret: REDACTED } })
        expect(
            redactSecrets(schema, {
                auth: { method: 'env', clientSecretEnv: 'MY_SECRET' },
            })
        ).toEqual({ auth: { method: 'env', clientSecretEnv: 'MY_SECRET' } })
    })

    it('keeps fields of union array items', () => {
        const schema = z.object({
            idps: z.array(
                z.discriminatedUnion('type', [
                    z.object({ type: z.literal('a'), issuer: z.string() }),
                    z.object({ type: z.literal('b'), configUrl: z.string() }),
                ])
            ),
        })
        const value = {
            idps: [
                { type: 'a', issuer: 'issuer' },
                { type: 'b', configUrl: 'url' },
            ],
        }

        expect(redactSecrets(schema, value)).toEqual(value)
    })

    it('redacts fields the schema does not describe', () => {
        const schema = z.looseObject({ host: z.string() })

        expect(
            redactSecrets(schema, {
                host: 'localhost',
                ssl: { key: 'private-key' },
            })
        ).toEqual({ host: 'localhost', ssl: REDACTED })
    })

    it('redacts inline secrets in the config but keeps env variable names', () => {
        const [network, ...networks] = testConfig.bootstrap.networks
        const rawConfig = rawConfigSchema.parse({
            ...testConfig,
            bootstrap: {
                ...testConfig.bootstrap,
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
                    ...networks,
                ],
            },
            store: {
                connection: {
                    type: 'postgres',
                    host: 'localhost',
                    port: 5432,
                    user: 'wallet',
                    password: 'inline-password',
                    database: 'wallet',
                    ssl: { ca: 'ca-cert', key: 'private-key' },
                },
            },
        })

        const redacted = redactSecrets(rawConfigSchema, rawConfig)

        expect(redacted.bootstrap).toMatchObject({
            idps: rawConfig.bootstrap.idps,
        })

        expect(redacted.store).toEqual({
            connection: {
                type: 'postgres',
                host: 'localhost',
                port: 5432,
                user: 'wallet',
                password: REDACTED,
                database: 'wallet',
                ssl: REDACTED,
            },
        })
        const serialized = JSON.stringify(redacted)
        expect(serialized).not.toContain('inline-client-secret')
        expect(serialized).toContain('WG_TEST_ADMIN_CLIENT_SECRET')
        expect(serialized).toContain('"kernel"')
    })
})
