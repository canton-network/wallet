// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest'
import { authSchema, idpSchema } from './schema'

describe('schemas', () => {
    it('should properly parse the idp schema', () => {
        const validIdpSelfSigned = {
            id: 'test1',
            type: 'self_signed',
            issuer: 'unsafe-auth',
        }

        expect(idpSchema.safeParse(validIdpSelfSigned).success).toBe(true)

        const validIdpClientOauth = {
            id: 'test1',
            type: 'oauth',
            issuer: 'unsafe-auth',
            configUrl: 'http://idp/.well-known/openid-configuration',
        }

        expect(idpSchema.safeParse(validIdpClientOauth).success).toBe(true)

        const invalidIdp = {
            id: 'test1',
            type: 'badtype',
            issuer: 'unsafe-auth',
        }

        expect(idpSchema.safeParse(invalidIdp).success).toBe(false)
        const missingFieldIdp = {
            id: 'test1',
            type: 'self_signed',
        }
        expect(idpSchema.safeParse(missingFieldIdp).success).toBe(false)
    })

    it('should properly parse the auth schema', () => {
        const validAuthSelfSigned = {
            method: 'self_signed',
            issuer: 'unsafe-auth',
            clientId: 'ledger-api-user',
            clientSecret: 'unsafe',
            audience: 'https://canton.network.global',
            scope: '',
        }
        expect(authSchema.safeParse(validAuthSelfSigned).success).toBe(true)

        const validAuthClientCredentials = {
            method: 'client_credentials',
            clientId: 'ledger-api-user',
            clientSecret: 'unsafe',
            audience: 'https://canton.network.global',
            scope: '',
        }
        expect(authSchema.safeParse(validAuthClientCredentials).success).toBe(
            true
        )

        const validAuthCode = {
            method: 'authorization_code',
            clientId: 'ledger-api-user',
            audience: 'https://canton.network.global',
            scope: '',
        }

        expect(authSchema.safeParse(validAuthCode).success).toBe(true)

        const invalidTypeAuth = {
            method: 'bad',
            issuer: 'unsafe-auth',
            clientId: 'ledger-api-user',
            clientSecret: 'unsafe',
            audience: 'https://canton.network.global',
            scope: '',
        }

        expect(authSchema.safeParse(invalidTypeAuth).success).toBe(false)

        const missingFieldAuth = {
            method: 'self_signed',
            clientSecret: 'unsafe',
            audience: 'https://canton.network.global',
            scope: '',
        }

        expect(authSchema.safeParse(missingFieldAuth).success).toBe(false)
    })
})
