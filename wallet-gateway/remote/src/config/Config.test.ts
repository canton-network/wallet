// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from 'vitest'
import { ConfigUtils } from './ConfigUtils.js'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

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

test('normalizes host-only or partial ledgerApi.baseUrl values', async () => {
    const config = JSON.parse(readFileSync('../test/config.json', 'utf-8'))

    const inputToExpected: Array<[string, string]> = [
        ['127.0.0.1', 'http://127.0.0.1:80'],
        ['http://127.0.0.1', 'http://127.0.0.1:80'],
        ['https://127.0.0.1', 'https://127.0.0.1:443'],
        ['127.0.0.1:5003', 'http://127.0.0.1:5003'],
    ]

    for (const [input, expected] of inputToExpected) {
        const tempConfig = structuredClone(config)
        tempConfig.bootstrap.networks[0].ledgerApi.baseUrl = input

        const tempDir = mkdtempSync(join(tmpdir(), 'wg-config-'))
        const tempFile = join(tempDir, 'config.json')
        writeFileSync(tempFile, JSON.stringify(tempConfig), 'utf-8')

        const loaded = ConfigUtils.loadConfigFile(tempFile)
        expect(loaded.bootstrap.networks[0].ledgerApi.baseUrl).toBe(expected)
    }
})

test('normalizes host-only or partial OAuth IDP issuer values', async () => {
    const config = JSON.parse(readFileSync('../test/config.json', 'utf-8'))

    const inputToExpected: Array<[string, string]> = [
        ['127.0.0.1', 'http://127.0.0.1:80'],
        ['http://127.0.0.1', 'http://127.0.0.1:80'],
        ['https://127.0.0.1', 'https://127.0.0.1:443'],
        ['127.0.0.1:5003', 'http://127.0.0.1:5003'],
    ]

    for (const [input, expected] of inputToExpected) {
        const tempConfig = structuredClone(config)
        tempConfig.bootstrap.idps[0].issuer = input

        const tempDir = mkdtempSync(join(tmpdir(), 'wg-config-'))
        const tempFile = join(tempDir, 'config.json')
        writeFileSync(tempFile, JSON.stringify(tempConfig), 'utf-8')

        const loaded = ConfigUtils.loadConfigFile(tempFile)
        expect(loaded.bootstrap.idps[0].issuer).toBe(expected)
    }
})

test('keeps non-url self-signed IDP issuer unchanged', async () => {
    const config = JSON.parse(readFileSync('../test/config.json', 'utf-8'))
    const expectedIssuer = 'unsafe-auth'

    const tempConfig = structuredClone(config)
    tempConfig.bootstrap.idps[2].issuer = expectedIssuer

    const tempDir = mkdtempSync(join(tmpdir(), 'wg-config-'))
    const tempFile = join(tempDir, 'config.json')
    writeFileSync(tempFile, JSON.stringify(tempConfig), 'utf-8')

    const loaded = ConfigUtils.loadConfigFile(tempFile)
    expect(loaded.bootstrap.idps[2].issuer).toBe(expectedIssuer)
})
