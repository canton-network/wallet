// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from 'vitest'
import { z } from 'zod'
import { ConfigUtils } from './ConfigUtils.js'
import { configSchema, rawConfigSchema } from './Config.js'

test('config from json file', async () => {
    const resp = ConfigUtils.loadConfigFile('../test/config.json')
    expect(resp.bootstrap.networks[0].name).toBe('Local (OAuth IDP)')
    expect(resp.bootstrap.networks[0].ledgerApi.baseUrl).toBe(
        'http://127.0.0.1:5003'
    )
    expect(resp.bootstrap.networks[0].auth.clientId).toBe('operator')
    expect(resp.bootstrap.networks[0].auth.scope).toBe(
        'openid email daml_ledger_api offline_access'
    )
    expect(resp.bootstrap.networks[0].auth.method).toBe('authorization_code')
    expect(resp.bootstrap.networks[2].auth.method).toBe('client_credentials')
    if (resp.bootstrap.networks[2].auth.method === 'client_credentials') {
        expect(resp.bootstrap.networks[2].auth.audience).toBe(
            'https://daml.com/jwt/aud/participant/participant1::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424'
        )
    }

    if (resp.bootstrap.networks[4].adminAuth?.method === 'client_credentials') {
        expect(resp.bootstrap.networks[4].adminAuth.clientSecret).toBe(
            'devnet_secret_testval'
        )
    }
})

test('signingStore is optional', () => {
    const config = { ...ConfigUtils.loadConfigFile('../test/config.json') }
    delete config.signingStore

    expect(configSchema.parse(config).signingStore).toBeUndefined()
    expect(rawConfigSchema.parse(config).signingStore).toBeUndefined()
})

test('generated input schema keeps defaulted signing provider config optional', () => {
    const schema = z.toJSONSchema(rawConfigSchema, { io: 'input' })
    const signingProvidersSchema = schema.properties?.signingProviders as {
        required?: string[]
    }

    expect(schema.required).not.toContain('signingProviders')
    expect(signingProvidersSchema.required).toBeUndefined()
})
