// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest'
import type { Idp } from '@canton-network/core-wallet-auth'
import type { Network } from '@canton-network/core-wallet-store'
import { assertTokenClaimsMatchNetwork } from './token-network-matching.js'

const ISSUER = 'unsafe-auth'
const AUDIENCE = 'https://canton.network.global'
const NETWORK_ID = 'network-self-signed'

const selfSignedIdp: Idp = {
    id: 'idp-self',
    type: 'self_signed',
    issuer: ISSUER,
}

const oauthIdp: Idp = {
    id: 'idp-oauth',
    type: 'oauth',
    issuer: ISSUER,
    configUrl: 'https://oauth.example.com/.well-known/openid-configuration',
}

const selfSignedNetwork: Network = {
    id: NETWORK_ID,
    name: 'Self Signed Network',
    description: 'Test network',
    synchronizerId: 'sync-1',
    identityProviderId: selfSignedIdp.id,
    ledgerApi: { baseUrl: 'http://localhost:7575' },
    auth: {
        method: 'self_signed',
        issuer: ISSUER,
        audience: AUDIENCE,
        scope: 'openid',
        clientId: 'cid',
        clientSecret: 'unsafe',
    },
    adminAuth: undefined,
    serviceAccountAuth: undefined,
}

const oauthNetwork: Network = {
    ...selfSignedNetwork,
    identityProviderId: oauthIdp.id,
    auth: {
        method: 'authorization_code',
        audience: AUDIENCE,
        scope: 'openid',
        clientId: 'cid',
    },
}

// The function only decodes the token, so an unsigned JWT is enough.
function createJwt(
    claims: Record<string, unknown> = {},
    header: Record<string, unknown> = {}
): string {
    const encode = (value: Record<string, unknown>): string =>
        Buffer.from(JSON.stringify(value)).toString('base64url')

    return [
        encode({ alg: 'HS256', typ: 'JWT', ...header }),
        encode({ iss: ISSUER, aud: AUDIENCE, sub: 'user-1', ...claims }),
        'signature',
    ].join('.')
}

describe('self_signed identity provider', () => {
    it('rejects a token without a kid header', () => {
        expect(() =>
            assertTokenClaimsMatchNetwork(
                createJwt(),
                selfSignedNetwork,
                selfSignedIdp
            )
        ).toThrow('Self-signed JWT does not contain a kid header.')
    })

    it('rejects a token whose kid names a different network', () => {
        expect(() =>
            assertTokenClaimsMatchNetwork(
                createJwt({}, { kid: 'some-other-network' }),
                selfSignedNetwork,
                selfSignedIdp
            )
        ).toThrow('Token kid does not match the selected network id.')
    })
})

it('does not require a kid for an oauth identity provider', () => {
    expect(() =>
        assertTokenClaimsMatchNetwork(createJwt(), oauthNetwork, oauthIdp)
    ).not.toThrow()
})
