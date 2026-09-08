// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    vi,
    describe,
    it,
    expect,
    beforeAll,
    beforeEach,
    afterEach,
} from 'vitest'
import { getLogger } from '@logtape/logtape'
import { pino, Logger } from 'pino'
import { sink } from 'pino-test'
import {
    createLocalJWKSet,
    exportJWK,
    generateKeyPair,
    SignJWT,
    type JWK,
    type KeyLike,
} from 'jose'
import { AuthContext } from '@canton-network/core-wallet-auth'
import { Network } from '@canton-network/core-wallet-store'
import { StoreInternal } from '@canton-network/core-wallet-store-inmemory'
import { jwtAuthService } from './jwt-auth-service.js'

const mockFetch = vi.hoisted(() => vi.fn())
const mockCreateRemoteJWKSet = vi.hoisted(() => vi.fn())

vi.mock('jose', async (importOriginal) => {
    const actual = await importOriginal<typeof import('jose')>()
    return {
        ...actual,
        createRemoteJWKSet: mockCreateRemoteJWKSet,
    }
})

const authContext: AuthContext = {
    userId: 'test-user-id',
    accessToken: 'test-access-token',
}

const SELF_SIGNED_ISSUER = 'unsafe-auth'
const SELF_SIGNED_AUDIENCE = 'self-signed-audience'
const SELF_SIGNED_SECRET = 'test-secret'
const SELF_SIGNED_KEY_ID = 'self-signed-key'
const OAUTH_ISSUER = 'https://oauth.example.com'
const OAUTH_JWKS_URI = 'https://oauth.example.com/jwks'
const OAUTH_KEY_ID = 'oauth-test-key'

async function hs256BearerToken(
    claims: Record<string, unknown>,
    secret = SELF_SIGNED_SECRET,
    keyId: string | null = SELF_SIGNED_KEY_ID
): Promise<string> {
    const jwt = await new SignJWT(claims)
        .setProtectedHeader({
            alg: 'HS256',
            ...(keyId ? { kid: keyId } : {}),
        })
        .sign(new TextEncoder().encode(secret))
    return `Bearer ${jwt}`
}

async function rs256BearerToken(
    claims: Record<string, unknown>,
    privateKey: KeyLike
): Promise<string> {
    const jwt = await new SignJWT(claims)
        .setProtectedHeader({ alg: 'RS256', kid: OAUTH_KEY_ID })
        .sign(privateKey)
    return `Bearer ${jwt}`
}

const createOAuthNetwork = (
    id: string,
    identityProviderId: string,
    audience = 'test-audience'
): Network => ({
    id,
    name: `Network ${id}`,
    synchronizerId: `${id}-sync`,
    identityProviderId,
    description: `Test Network ${id}`,
    ledgerApi: { baseUrl: `http://${id}` },
    auth: {
        method: 'authorization_code' as const,
        clientId: 'cid',
        scope: 'openid',
        audience,
    },
})

const createSelfSignedNetwork = (
    id: string,
    audience: string,
    clientSecret: string,
    keyId = SELF_SIGNED_KEY_ID
): Network => ({
    id,
    name: `Network ${id}`,
    synchronizerId: `${id}-sync`,
    identityProviderId: 'idp-self',
    description: `Test Network ${id}`,
    ledgerApi: { baseUrl: `http://${id}` },
    auth: {
        method: 'self_signed',
        issuer: SELF_SIGNED_ISSUER,
        audience,
        scope: 'openid',
        clientId: 'cid',
        clientSecret,
        keyId,
    },
})

describe('jwtAuthService', () => {
    let mockLogger: Logger
    let store: StoreInternal

    beforeEach(async () => {
        mockLogger = pino(sink())
        store = new StoreInternal(
            { idps: [], networks: [] },
            getLogger('mock'),
            authContext
        )
        vi.stubGlobal('fetch', mockFetch)
        mockFetch.mockReset()
        mockCreateRemoteJWKSet.mockReset()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('returns undefined when access token is missing', async () => {
        const service = jwtAuthService(store, mockLogger)
        await expect(service.verifyToken(undefined)).resolves.toBeUndefined()
    })

    it('returns undefined when authorization header is not Bearer', async () => {
        const service = jwtAuthService(store, mockLogger)
        await expect(service.verifyToken('Basic abc')).resolves.toBeUndefined()
    })

    it('returns undefined when JWT has no issuer', async () => {
        const service = jwtAuthService(store, mockLogger)
        const token = await hs256BearerToken({ sub: 'user-1', scope: 'openid' })
        await expect(service.verifyToken(token)).resolves.toBeUndefined()
    })

    it('returns undefined when no identity provider matches issuer', async () => {
        await store.addIdp({
            id: 'idp-self',
            type: 'self_signed',
            issuer: SELF_SIGNED_ISSUER,
        })

        const service = jwtAuthService(store, mockLogger)
        const token = await hs256BearerToken({
            iss: 'unknown-issuer',
            sub: 'user-1',
            scope: 'openid',
        })
        await expect(service.verifyToken(token)).resolves.toBeUndefined()
    })

    it('returns undefined when JWT has no scope or scp claim', async () => {
        await store.addIdp({
            id: 'idp-self',
            type: 'self_signed',
            issuer: SELF_SIGNED_ISSUER,
        })

        const service = jwtAuthService(store, mockLogger)
        const token = await hs256BearerToken({
            iss: SELF_SIGNED_ISSUER,
            sub: 'user-1',
        })
        await expect(service.verifyToken(token)).resolves.toBeUndefined()
    })

    describe('self_signed identity provider', () => {
        beforeEach(async () => {
            await store.addIdp({
                id: 'idp-self',
                type: 'self_signed',
                issuer: SELF_SIGNED_ISSUER,
            })
        })

        it('returns auth context for a valid self-signed token', async () => {
            await store.addNetwork(
                createSelfSignedNetwork(
                    'network-self',
                    SELF_SIGNED_AUDIENCE,
                    SELF_SIGNED_SECRET
                )
            )

            const service = jwtAuthService(store, mockLogger)
            const token = await hs256BearerToken({
                iss: SELF_SIGNED_ISSUER,
                sub: 'user-1',
                aud: SELF_SIGNED_AUDIENCE,
                scope: 'openid',
            })

            const result = await service.verifyToken(token)
            expect(result).toEqual({
                userId: 'user-1',
                accessToken: token.split(' ')[1],
            })
        })

        it('accepts scp claim instead of scope', async () => {
            await store.addNetwork(
                createSelfSignedNetwork(
                    'network-self',
                    SELF_SIGNED_AUDIENCE,
                    SELF_SIGNED_SECRET
                )
            )

            const service = jwtAuthService(store, mockLogger)
            const token = await hs256BearerToken({
                iss: SELF_SIGNED_ISSUER,
                sub: 'user-1',
                aud: SELF_SIGNED_AUDIENCE,
                scp: 'openid',
            })

            const result = await service.verifyToken(token)
            expect(result?.userId).toBe('user-1')
        })

        it('includes email when present in token', async () => {
            await store.addNetwork(
                createSelfSignedNetwork(
                    'network-self',
                    SELF_SIGNED_AUDIENCE,
                    SELF_SIGNED_SECRET
                )
            )

            const service = jwtAuthService(store, mockLogger)
            const token = await hs256BearerToken({
                iss: SELF_SIGNED_ISSUER,
                sub: 'user-1',
                aud: SELF_SIGNED_AUDIENCE,
                scope: 'openid',
                email: 'user@example.com',
            })

            const result = await service.verifyToken(token)
            expect(result).toEqual({
                userId: 'user-1',
                accessToken: token.split(' ')[1],
                email: 'user@example.com',
            })
        })

        it('accepts a token whose audience is an array containing a matching network', async () => {
            await store.addNetwork(
                createSelfSignedNetwork(
                    'network-self',
                    SELF_SIGNED_AUDIENCE,
                    SELF_SIGNED_SECRET
                )
            )

            const service = jwtAuthService(store, mockLogger)
            const token = await hs256BearerToken({
                iss: SELF_SIGNED_ISSUER,
                sub: 'user-1',
                aud: ['other-audience', SELF_SIGNED_AUDIENCE],
                scope: 'openid',
            })

            const result = await service.verifyToken(token)
            expect(result?.userId).toBe('user-1')
        })

        it('returns undefined when JWT has no subject', async () => {
            await store.addNetwork(
                createSelfSignedNetwork(
                    'network-self',
                    SELF_SIGNED_AUDIENCE,
                    SELF_SIGNED_SECRET
                )
            )

            const service = jwtAuthService(store, mockLogger)
            const token = await hs256BearerToken({
                iss: SELF_SIGNED_ISSUER,
                aud: SELF_SIGNED_AUDIENCE,
                scope: 'openid',
            })
            await expect(service.verifyToken(token)).resolves.toBeUndefined()
        })

        it('returns undefined when JWT has no key id', async () => {
            await store.addNetwork(
                createSelfSignedNetwork(
                    'network-self',
                    SELF_SIGNED_AUDIENCE,
                    SELF_SIGNED_SECRET
                )
            )

            const service = jwtAuthService(store, mockLogger)
            const token = await hs256BearerToken(
                {
                    iss: SELF_SIGNED_ISSUER,
                    sub: 'user-1',
                    aud: SELF_SIGNED_AUDIENCE,
                    scope: 'openid',
                },
                SELF_SIGNED_SECRET,
                null
            )
            await expect(service.verifyToken(token)).resolves.toBeUndefined()
        })

        it('returns undefined when no network has the JWT key id', async () => {
            await store.addNetwork(
                createSelfSignedNetwork(
                    'network-self',
                    SELF_SIGNED_AUDIENCE,
                    SELF_SIGNED_SECRET
                )
            )

            const service = jwtAuthService(store, mockLogger)
            const token = await hs256BearerToken(
                {
                    iss: SELF_SIGNED_ISSUER,
                    sub: 'user-1',
                    aud: SELF_SIGNED_AUDIENCE,
                    scope: 'openid',
                },
                SELF_SIGNED_SECRET,
                'unknown-key'
            )
            await expect(service.verifyToken(token)).resolves.toBeUndefined()
        })

        it('returns undefined when JWT has no audience', async () => {
            await store.addNetwork(
                createSelfSignedNetwork(
                    'network-self',
                    SELF_SIGNED_AUDIENCE,
                    SELF_SIGNED_SECRET
                )
            )

            const service = jwtAuthService(store, mockLogger)
            const token = await hs256BearerToken({
                iss: SELF_SIGNED_ISSUER,
                sub: 'user-1',
                scope: 'openid',
            })
            await expect(service.verifyToken(token)).resolves.toBeUndefined()
        })

        it('returns undefined when audience does not match any network', async () => {
            await store.addNetwork(
                createSelfSignedNetwork(
                    'network-self',
                    SELF_SIGNED_AUDIENCE,
                    SELF_SIGNED_SECRET
                )
            )

            const service = jwtAuthService(store, mockLogger)
            const token = await hs256BearerToken({
                iss: SELF_SIGNED_ISSUER,
                sub: 'user-1',
                aud: 'unknown-audience',
                scope: 'openid',
            })
            await expect(service.verifyToken(token)).resolves.toBeUndefined()
        })

        it('returns undefined when the signature does not match any candidate secret', async () => {
            await store.addNetwork(
                createSelfSignedNetwork(
                    'network-self',
                    SELF_SIGNED_AUDIENCE,
                    SELF_SIGNED_SECRET
                )
            )

            const service = jwtAuthService(store, mockLogger)
            const token = await hs256BearerToken(
                {
                    iss: SELF_SIGNED_ISSUER,
                    sub: 'user-1',
                    aud: SELF_SIGNED_AUDIENCE,
                    scope: 'openid',
                },
                'wrong-secret'
            )
            await expect(service.verifyToken(token)).resolves.toBeUndefined()
        })

        it('returns undefined when the token is expired', async () => {
            await store.addNetwork(
                createSelfSignedNetwork(
                    'network-self',
                    SELF_SIGNED_AUDIENCE,
                    SELF_SIGNED_SECRET
                )
            )

            const service = jwtAuthService(store, mockLogger)
            const token = await hs256BearerToken({
                iss: SELF_SIGNED_ISSUER,
                sub: 'user-1',
                aud: SELF_SIGNED_AUDIENCE,
                scope: 'openid',
                exp: Math.floor(Date.now() / 1000) - 60,
            })
            await expect(service.verifyToken(token)).resolves.toBeUndefined()
        })

        describe('multiple networks', () => {
            const AUD_A = 'audience-a'
            const AUD_B = 'audience-b'
            const SECRET_A = 'secret-a'
            const SECRET_B = 'secret-b'
            const KEY_A = 'key-a'
            const KEY_B = 'key-b'

            const claims = (aud: string): Record<string, unknown> => ({
                iss: SELF_SIGNED_ISSUER,
                sub: 'user-1',
                aud,
                scope: 'openid',
            })

            it('accepts tokens only when kid, secret, and audience belong to the same network', async () => {
                await store.addNetwork(
                    createSelfSignedNetwork('network-a', AUD_A, SECRET_A, KEY_A)
                )
                await store.addNetwork(
                    createSelfSignedNetwork('network-b', AUD_B, SECRET_B, KEY_B)
                )

                const service = jwtAuthService(store, mockLogger)

                await expect(
                    service.verifyToken(
                        await hs256BearerToken(claims(AUD_A), SECRET_A, KEY_A)
                    )
                ).resolves.toMatchObject({ userId: 'user-1' })
                await expect(
                    service.verifyToken(
                        await hs256BearerToken(claims(AUD_B), SECRET_B, KEY_B)
                    )
                ).resolves.toMatchObject({ userId: 'user-1' })
            })

            it('does not fall back to another network secret when the kid-selected secret rejects the token', async () => {
                await store.addNetwork(
                    createSelfSignedNetwork('network-a', AUD_A, SECRET_A, KEY_A)
                )
                await store.addNetwork(
                    createSelfSignedNetwork('network-b', AUD_A, SECRET_B, KEY_B)
                )

                const service = jwtAuthService(store, mockLogger)
                const tokenSignedWithNetworkBSecret = await hs256BearerToken(
                    claims(AUD_A),
                    SECRET_B,
                    KEY_A
                )

                await expect(
                    service.verifyToken(tokenSignedWithNetworkBSecret)
                ).resolves.toBeUndefined()
            })

            it('does not accept another network audience when networks share a secret', async () => {
                await store.addNetwork(
                    createSelfSignedNetwork('network-a', AUD_A, SECRET_A, KEY_A)
                )
                await store.addNetwork(
                    createSelfSignedNetwork('network-b', AUD_B, SECRET_A, KEY_B)
                )

                const service = jwtAuthService(store, mockLogger)
                const tokenForNetworkBAudience = await hs256BearerToken(
                    claims(AUD_B),
                    SECRET_A,
                    KEY_A
                )

                await expect(
                    service.verifyToken(tokenForNetworkBAudience)
                ).resolves.toBeUndefined()
            })

            it('rejects changing a valid token kid to another network key id', async () => {
                await store.addNetwork(
                    createSelfSignedNetwork('network-a', AUD_A, SECRET_A, KEY_A)
                )
                await store.addNetwork(
                    createSelfSignedNetwork('network-b', AUD_B, SECRET_B, KEY_B)
                )

                const service = jwtAuthService(store, mockLogger)
                const networkATokenWithNetworkBKid = await hs256BearerToken(
                    claims(AUD_A),
                    SECRET_A,
                    KEY_B
                )

                await expect(
                    service.verifyToken(networkATokenWithNetworkBKid)
                ).resolves.toBeUndefined()
            })
        })
    })

    describe('oauth identity provider', () => {
        const configUrl =
            'https://oauth.example.com/.well-known/openid-configuration'

        let oauthPrivateKey: KeyLike
        let oauthPublicJwk: JWK

        beforeAll(async () => {
            const { publicKey, privateKey } = await generateKeyPair('RS256')
            oauthPrivateKey = privateKey
            oauthPublicJwk = {
                ...(await exportJWK(publicKey)),
                kid: OAUTH_KEY_ID,
                alg: 'RS256',
                use: 'sig',
            }
        })

        beforeEach(async () => {
            await store.addIdp({
                id: 'idp-oauth',
                type: 'oauth',
                issuer: OAUTH_ISSUER,
                configUrl,
            })
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({ jwks_uri: OAUTH_JWKS_URI }),
            } as Response)
            mockCreateRemoteJWKSet.mockImplementation(() =>
                createLocalJWKSet({ keys: [oauthPublicJwk] })
            )
        })

        it('returns auth context when JWT verifies and audience matches', async () => {
            await store.addNetwork(
                createOAuthNetwork('network-1', 'idp-oauth', 'ledger-audience')
            )

            const service = jwtAuthService(store, mockLogger)
            const token = await rs256BearerToken(
                {
                    iss: OAUTH_ISSUER,
                    sub: 'oauth-user',
                    aud: 'ledger-audience',
                    scope: 'openid',
                    email: 'oauth@example.com',
                },
                oauthPrivateKey
            )
            const rawJwt = token.split(' ')[1]

            const result = await service.verifyToken(token)

            expect(mockFetch).toHaveBeenCalledWith(configUrl)
            expect(mockCreateRemoteJWKSet).toHaveBeenCalledWith(
                new URL(OAUTH_JWKS_URI)
            )
            expect(result).toEqual({
                userId: 'oauth-user',
                accessToken: rawJwt,
                email: 'oauth@example.com',
            })
        })

        it('returns undefined when no networks are configured for the IDP', async () => {
            const service = jwtAuthService(store, mockLogger)
            const token = await rs256BearerToken(
                {
                    iss: OAUTH_ISSUER,
                    sub: 'oauth-user',
                    aud: 'ledger-audience',
                    scope: 'openid',
                },
                oauthPrivateKey
            )

            await expect(service.verifyToken(token)).resolves.toBeUndefined()
        })

        it('returns undefined when audience does not match configured networks', async () => {
            await store.addNetwork(
                createOAuthNetwork(
                    'network-1',
                    'idp-oauth',
                    'expected-audience'
                )
            )

            const service = jwtAuthService(store, mockLogger)
            const token = await rs256BearerToken(
                {
                    iss: OAUTH_ISSUER,
                    sub: 'oauth-user',
                    aud: 'other-audience',
                    scope: 'openid',
                },
                oauthPrivateKey
            )

            await expect(service.verifyToken(token)).resolves.toBeUndefined()
        })

        it('returns undefined when verified JWT has no audience', async () => {
            await store.addNetwork(
                createOAuthNetwork(
                    'network-1',
                    'idp-oauth',
                    'expected-audience'
                )
            )

            const service = jwtAuthService(store, mockLogger)
            const token = await rs256BearerToken(
                {
                    iss: OAUTH_ISSUER,
                    sub: 'oauth-user',
                    scope: 'openid',
                },
                oauthPrivateKey
            )

            await expect(service.verifyToken(token)).resolves.toBeUndefined()
        })

        it('returns undefined when verified JWT has no subject', async () => {
            await store.addNetwork(
                createOAuthNetwork(
                    'network-1',
                    'idp-oauth',
                    'expected-audience'
                )
            )

            const service = jwtAuthService(store, mockLogger)
            const token = await rs256BearerToken(
                {
                    iss: OAUTH_ISSUER,
                    aud: 'expected-audience',
                    scope: 'openid',
                },
                oauthPrivateKey
            )

            await expect(service.verifyToken(token)).resolves.toBeUndefined()
        })

        it('returns undefined when JWT verification fails', async () => {
            await store.addNetwork(
                createOAuthNetwork(
                    'network-1',
                    'idp-oauth',
                    'expected-audience'
                )
            )

            const service = jwtAuthService(store, mockLogger)
            const token = await hs256BearerToken({
                iss: OAUTH_ISSUER,
                sub: 'oauth-user',
                aud: 'expected-audience',
                scope: 'openid',
            })

            await expect(service.verifyToken(token)).resolves.toBeUndefined()
        })
    })
})
