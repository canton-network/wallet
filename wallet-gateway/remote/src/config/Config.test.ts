// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { ConfigUtils } from './ConfigUtils.js'
import {
    configSchema,
    rawConfigSchema,
    signingProvidersConfigSchema,
} from './Config.js'

test('config from json file', async () => {
    const resp = ConfigUtils.loadConfigFile('../test/config.json').config
    expect(resp.networks[0].name).toBe('Local (OAuth IDP)')
    expect(resp.networks[0].ledgerApi.baseUrl).toBe('http://127.0.0.1:5003')
    expect(resp.networks[0].auth.method).toBe('authorization_code')
    if (resp.networks[0].auth.method === 'authorization_code') {
        expect(resp.networks[0].auth.clientId).toBe('operator')
    }
    expect(resp.networks[0].auth.scope).toBe(
        'openid email daml_ledger_api offline_access'
    )
    expect(resp.networks[2].auth.method).toBe('client_credentials')
    if (resp.networks[2].auth.method === 'client_credentials') {
        expect(resp.networks[2].auth.audience).toBe(
            'https://daml.com/jwt/aud/participant/participant1::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424'
        )
    }

    if (resp.networks[4].adminAuth?.method === 'client_credentials') {
        expect(resp.networks[4].adminAuth.clientSecret).toBe(
            'devnet_secret_testval'
        )
    }

    const selfIssuedNetwork = resp.networks.find(
        (network) => network.id === 'canton:local-self-issued'
    )
    expect(selfIssuedNetwork?.adminAuth).toMatchObject({
        method: 'client_credentials',
        identityProviderId: 'idp-mock-oauth',
    })
})

test('signingStore is optional', () => {
    const config = {
        ...ConfigUtils.loadConfigFile('../test/config.json').config,
    }
    delete config.signingStore
    const rawConfig = {
        ...JSON.parse(readFileSync('../test/config.json', 'utf-8')),
    }
    delete rawConfig.signingStore

    expect(configSchema.parse(config).signingStore).toBeUndefined()
    expect(rawConfigSchema.parse(rawConfig).signingStore).toBeUndefined()
})

test('signingProviders is optional and opt-in by presence', () => {
    const config = ConfigUtils.loadConfigFile('../test/config.json').config
    const rawConfig = JSON.parse(readFileSync('../test/config.json', 'utf-8'))

    expect(configSchema.parse(config).signingProviders).toBeUndefined()
    expect(rawConfigSchema.parse(rawConfig).signingProviders).toBeUndefined()
    expect(
        configSchema.parse({ ...config, signingProviders: {} }).signingProviders
    ).toEqual({})
    expect(
        configSchema.parse({
            ...config,
            signingProviders: { fireblocks: { apiPath: 'https://example' } },
        }).signingProviders
    ).toEqual({
        fireblocks: {
            apiPath: 'https://example',
            apiKeyEnv: 'FIREBLOCKS_API_KEY',
            secretEnv: 'FIREBLOCKS_SECRET',
        },
    })
    expect(
        configSchema.parse({
            ...config,
            signingProviders: {
                fireblocks: {
                    apiKeyEnv: 'MY_FIREBLOCKS_API_KEY',
                    secretEnv: 'MY_FIREBLOCKS_SECRET',
                },
            },
        }).signingProviders
    ).toEqual({
        fireblocks: {
            apiPath: 'https://api.fireblocks.io/v1',
            apiKeyEnv: 'MY_FIREBLOCKS_API_KEY',
            secretEnv: 'MY_FIREBLOCKS_SECRET',
        },
    })
})

test('blockdaemon caip2 accepts only supported networks', () => {
    expect(() =>
        signingProvidersConfigSchema.parse({
            blockdaemon: { caip2: 'canton:unknown' },
        })
    ).toThrow()
    expect(
        signingProvidersConfigSchema.parse({
            blockdaemon: { caip2: 'canton:mainnet' },
        }).blockdaemon?.caip2
    ).toBe('canton:mainnet')
    expect(
        signingProvidersConfigSchema.parse({ blockdaemon: {} }).blockdaemon
            ?.caip2
    ).toBe('canton:testnet')
})

test('dfns and securosys in config require non-secret settings', () => {
    expect(() => signingProvidersConfigSchema.parse({ dfns: {} })).toThrow()
    expect(() =>
        signingProvidersConfigSchema.parse({ securosys: {} })
    ).toThrow()
    expect(
        signingProvidersConfigSchema.parse({
            dfns: { orgId: 'org-id', credId: 'credential-id' },
            securosys: { baseUrl: 'https://securosys.example' },
        })
    ).toEqual({
        dfns: {
            orgId: 'org-id',
            baseUrl: 'https://api.dfns.io',
            credId: 'credential-id',
            privateKeyEnv: 'DFNS_PRIVATE_KEY',
            authTokenEnv: 'DFNS_AUTH_TOKEN',
        },
        securosys: {
            baseUrl: 'https://securosys.example',
            signatureAlgorithm: 'EDDSA',
            keyManagementApiKeyEnv: 'SECUROSYS_TSB_KEY_MANAGEMENT_API_KEY',
            keyOperationApiKeyEnv: 'SECUROSYS_TSB_KEY_OPERATION_API_KEY',
            bearerTokenEnv: 'SECUROSYS_TSB_BEARER_TOKEN',
            mtlsP12PasswordEnv: 'SECUROSYS_TSB_MTLS_P12_PASSWORD',
            keyPasswordEnv: 'SECUROSYS_TSB_KEY_PASSWORD',
        },
    })
})

describe('top-level idps and networks', () => {
    const rawConfig = JSON.parse(readFileSync('../test/config.json', 'utf-8'))
    const idp = {
        id: 'idp-config',
        type: 'oauth',
        issuer: 'https://issuer.example',
        configUrl: 'https://issuer.example/.well-known/openid-configuration',
    } as const
    const network = {
        id: 'canton:config',
        name: 'Config network',
        description: 'Managed by the config file',
        identityProviderId: 'idp-config',
        ledgerApi: { baseUrl: 'http://localhost:6865' },
        auth: {
            method: 'authorization_code',
            audience: 'audience',
            scope: 'openid',
            clientId: 'client',
        },
        adminAuth: {
            method: 'client_credentials',
            audience: 'audience',
            scope: 'daml_ledger_api',
            clientId: 'admin',
            clientSecretEnv: 'WG_TEST_ADMIN_CLIENT_SECRET',
        },
    } as const

    test('default to empty lists and make bootstrap optional', () => {
        const { config } = ConfigUtils.parseConfig({
            ...rawConfig,
            idps: undefined,
            networks: undefined,
        })

        expect(config.idps).toEqual([])
        expect(config.networks).toEqual([])
        expect(config.bootstrap).toEqual({ idps: [], networks: [] })
    })

    test('resolve network secrets from env', () => {
        const config = ConfigUtils.parseConfig({
            ...rawConfig,
            idps: [idp],
            networks: [network],
        }).config

        expect(config.networks[0].adminAuth).toEqual({
            method: 'client_credentials',
            audience: 'audience',
            scope: 'daml_ledger_api',
            clientId: 'admin',
            clientSecret: 'admin-client-secret',
        })
    })

    test('accept inline secrets', () => {
        const { adminAuth } = ConfigUtils.parseConfig({
            ...rawConfig,
            idps: [idp],
            networks: [
                {
                    ...network,
                    adminAuth: {
                        ...network.adminAuth,
                        clientSecretEnv: undefined,
                        clientSecret: 'inline',
                    },
                },
            ],
        }).config.networks[0]

        expect(adminAuth).toMatchObject({ clientSecret: 'inline' })
    })

    test('accept bootstrap copied to the top-level sections', () => {
        const { config } = ConfigUtils.parseConfig({
            ...rawConfig,
            bootstrap: { idps: rawConfig.idps, networks: rawConfig.networks },
        })

        expect(config.bootstrap.networks).toEqual(config.networks)
    })

    test('reject duplicate ids within a section', () => {
        expect(
            () =>
                ConfigUtils.parseConfig({
                    ...rawConfig,
                    idps: [idp, idp],
                    networks: [network],
                }).config
        ).toThrow(`Non-unique IDP IDs found in config file: idp-config`)
    })

    test('leave self-issued audiences across sections to the database', () => {
        const selfIssued = rawConfig.networks.find(
            (n: { auth: { method: string } }) => n.auth.method === 'self_issued'
        )
        // bootstrap is only written to an empty database, where the
        // upsert of networks rejects the duplicate audience
        expect(
            () =>
                ConfigUtils.parseConfig({
                    ...rawConfig,
                    bootstrap: {
                        idps: rawConfig.idps,
                        networks: [{ ...selfIssued, id: 'canton:other' }],
                    },
                }).config
        ).not.toThrow()
    })

    test('reject networks that reference an idp from bootstrap', () => {
        expect(
            () =>
                ConfigUtils.parseConfig({
                    ...rawConfig,
                    idps: [],
                    networks: [network],
                    bootstrap: { idps: [idp], networks: [] },
                }).config
        ).toThrow(
            'Network canton:config references unknown Identity Provider ID idp-config'
        )
    })
})
