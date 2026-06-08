// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import {
    assertServiceAccountUserAllowed,
    isClientCredentialsNetworkAuth,
    isClientCredentialsToken,
    isServiceAccountRequest,
} from './service-account.js'

describe('service-account', () => {
    it('detects client credentials network auth', () => {
        expect(
            isClientCredentialsNetworkAuth({
                method: 'client_credentials',
                clientId: 'svc',
                clientSecret: 'secret',
                audience: 'aud',
                scope: 'scope',
            })
        ).toBe(true)
        expect(
            isClientCredentialsNetworkAuth({
                method: 'authorization_code',
                clientId: 'app',
                audience: 'aud',
                scope: 'scope',
            })
        ).toBe(false)
    })

    it('detects client credentials token grant type', () => {
        const header = Buffer.from(
            JSON.stringify({ alg: 'none', typ: 'JWT' })
        ).toString('base64url')
        const payload = Buffer.from(
            JSON.stringify({ gty: 'client_credentials', sub: 'svc' })
        ).toString('base64url')
        const token = `${header}.${payload}.`

        expect(isClientCredentialsToken(token)).toBe(true)
        expect(isClientCredentialsToken('not-a-jwt')).toBe(false)
    })

    it('combines network and token signals', () => {
        expect(
            isServiceAccountRequest(
                {
                    method: 'authorization_code',
                    clientId: 'app',
                    audience: 'aud',
                    scope: 'scope',
                },
                'not-a-jwt'
            )
        ).toBe(false)
    })

    it('enforces optional user allow-list', () => {
        expect(() => assertServiceAccountUserAllowed('alice', ['bob'])).toThrow(
            /not allowed/
        )
        expect(() =>
            assertServiceAccountUserAllowed('alice', ['alice', 'bob'])
        ).not.toThrow()
        expect(() =>
            assertServiceAccountUserAllowed('alice', undefined)
        ).not.toThrow()
    })
})
