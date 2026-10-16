// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import { pino } from 'pino'
import { sink } from 'pino-test'
import { IdpUnavailableError } from '@canton-network/core-wallet-auth'
import { exportJWK, generateKeyPair, jwtVerify, SignJWT, type JWK } from 'jose'
import {
    createOidcCache,
    CACHE_TTL_MS,
    MAX_ENTRIES,
    RETRY_AFTER_MS,
} from './oidc-cache.js'

const CONFIG_URL = 'https://idp.example.com/.well-known/openid-configuration'
const JWKS_URI = 'https://idp.example.com/jwks'
const DISCOVERY = {
    issuer: 'https://idp.example.com',
    jwks_uri: JWKS_URI,
}

describe('createOidcCache', () => {
    const logger = pino({ level: 'silent' }, sink())
    const fetchMock = vi.fn<typeof fetch>()

    let privateKey: CryptoKey
    let publicJwk: JWK

    beforeAll(async () => {
        const pair = await generateKeyPair('RS256')
        privateKey = pair.privateKey
        publicJwk = { ...(await exportJWK(pair.publicKey)), kid: 'key-1' }
    })

    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.unstubAllGlobals()
    })

    const advance = (ms: number) => vi.setSystemTime(Date.now() + ms)

    const callsTo = (url: string) =>
        fetchMock.mock.calls.filter(([input]) => String(input) === url).length

    describe('fetchDiscovery', () => {
        it('fetches the discovery document once while it is fresh', async () => {
            fetchMock.mockImplementation(async () => Response.json(DISCOVERY))
            const cache = createOidcCache(logger)

            await expect(cache.fetchDiscovery(CONFIG_URL)).resolves.toEqual(
                DISCOVERY
            )
            advance(CACHE_TTL_MS - 1)
            await cache.fetchDiscovery(CONFIG_URL)

            expect(callsTo(CONFIG_URL)).toBe(1)
        })

        it('fetches it again after the TTL', async () => {
            fetchMock.mockImplementation(async () => Response.json(DISCOVERY))
            const cache = createOidcCache(logger)

            await cache.fetchDiscovery(CONFIG_URL)
            advance(CACHE_TTL_MS)
            await cache.fetchDiscovery(CONFIG_URL)

            expect(callsTo(CONFIG_URL)).toBe(2)
        })

        it('shares one request between concurrent callers', async () => {
            fetchMock.mockImplementation(async () => Response.json(DISCOVERY))
            const cache = createOidcCache(logger)

            await Promise.all([
                cache.fetchDiscovery(CONFIG_URL),
                cache.fetchDiscovery(CONFIG_URL),
                cache.fetchDiscovery(CONFIG_URL),
            ])

            expect(callsTo(CONFIG_URL)).toBe(1)
        })

        it('does not contact the IDP again for RETRY_AFTER_MS after a failure', async () => {
            fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'))
            fetchMock.mockImplementation(async () => Response.json(DISCOVERY))
            const cache = createOidcCache(logger)

            await expect(
                cache.fetchDiscovery(CONFIG_URL)
            ).rejects.toBeInstanceOf(IdpUnavailableError)
            advance(RETRY_AFTER_MS - 1)
            await expect(
                cache.fetchDiscovery(CONFIG_URL)
            ).rejects.toBeInstanceOf(IdpUnavailableError)
            expect(callsTo(CONFIG_URL)).toBe(1)

            advance(1)
            await expect(cache.fetchDiscovery(CONFIG_URL)).resolves.toEqual(
                DISCOVERY
            )
            expect(callsTo(CONFIG_URL)).toBe(2)
        })

        it('does not use the last document after the TTL when the IDP is unavailable', async () => {
            fetchMock.mockImplementationOnce(async () =>
                Response.json(DISCOVERY)
            )
            fetchMock.mockRejectedValue(new TypeError('fetch failed'))
            const cache = createOidcCache(logger)

            await cache.fetchDiscovery(CONFIG_URL)
            advance(CACHE_TTL_MS)
            await expect(
                cache.fetchDiscovery(CONFIG_URL)
            ).rejects.toBeInstanceOf(IdpUnavailableError)
        })
    })

    describe('fetchJwks', () => {
        const token = (kid = 'key-1') =>
            new SignJWT({ sub: 'user' })
                .setProtectedHeader({ alg: 'RS256', kid })
                .sign(privateKey)

        const verify = async (
            cache: ReturnType<typeof createOidcCache>,
            jwt: string
        ) => jwtVerify(jwt, cache.fetchJwks(JWKS_URI))

        it('reuses the key set across verifications', async () => {
            fetchMock.mockImplementation(async () =>
                Response.json({ keys: [publicJwk] })
            )
            const cache = createOidcCache(logger)

            await verify(cache, await token())
            await verify(cache, await token())

            expect(cache.fetchJwks(JWKS_URI)).toBe(cache.fetchJwks(JWKS_URI))
            expect(callsTo(JWKS_URI)).toBe(1)
        })

        it('fails after the TTL while the IDP is unavailable, retrying after RETRY_AFTER_MS', async () => {
            fetchMock.mockImplementationOnce(async () =>
                Response.json({ keys: [publicJwk] })
            )
            fetchMock.mockRejectedValue(new TypeError('fetch failed'))
            const cache = createOidcCache(logger)
            const jwt = await token()

            await verify(cache, jwt)
            advance(CACHE_TTL_MS)
            await expect(verify(cache, jwt)).rejects.toBeInstanceOf(
                IdpUnavailableError
            )
            await expect(verify(cache, jwt)).rejects.toBeInstanceOf(
                IdpUnavailableError
            )
            expect(callsTo(JWKS_URI)).toBe(2)

            fetchMock.mockImplementation(async () =>
                Response.json({ keys: [publicJwk] })
            )
            advance(RETRY_AFTER_MS)
            await expect(verify(cache, jwt)).resolves.toMatchObject({
                payload: { sub: 'user' },
            })
            expect(callsTo(JWKS_URI)).toBe(3)
        })

        it('refetches for an unknown key and keeps the key set when that fails', async () => {
            fetchMock.mockImplementationOnce(async () =>
                Response.json({ keys: [publicJwk] })
            )
            fetchMock.mockRejectedValue(new TypeError('fetch failed'))
            const cache = createOidcCache(logger)
            await verify(cache, await token())
            advance(RETRY_AFTER_MS)

            await expect(
                verify(cache, await token('rotated-key'))
            ).rejects.toBeInstanceOf(IdpUnavailableError)
            expect(callsTo(JWKS_URI)).toBe(2)
            await expect(verify(cache, await token())).resolves.toMatchObject({
                payload: { sub: 'user' },
            })
        })

        it('does not repeat a request that returned no key set for RETRY_AFTER_MS', async () => {
            fetchMock.mockImplementation(async () =>
                Response.json({ error: 'maintenance' })
            )
            const cache = createOidcCache(logger)
            const jwt = await token()

            await expect(verify(cache, jwt)).rejects.toBeInstanceOf(
                IdpUnavailableError
            )
            await expect(verify(cache, jwt)).rejects.toBeInstanceOf(
                IdpUnavailableError
            )
            expect(callsTo(JWKS_URI)).toBe(1)
        })

        it('throws IdpUnavailableError without a previously fetched key set', async () => {
            fetchMock.mockRejectedValue(new TypeError('fetch failed'))
            const cache = createOidcCache(logger)

            await expect(verify(cache, await token())).rejects.toBeInstanceOf(
                IdpUnavailableError
            )
        })

        it('rejects an invalid jwks_uri as IdpUnavailableError', () => {
            const cache = createOidcCache(logger)

            expect(() => cache.fetchJwks('not a url')).toThrow(
                IdpUnavailableError
            )
        })
    })

    describe('fetchUserEmail', () => {
        const USERINFO_URL = 'https://idp.example.com/userinfo'

        const mockIdp = (
            userinfo: (auth: string | null) => Promise<Response>,
            discovery: object = {
                ...DISCOVERY,
                userinfo_endpoint: USERINFO_URL,
            }
        ) =>
            fetchMock.mockImplementation(async (input, init) =>
                String(input) === CONFIG_URL
                    ? Response.json(discovery)
                    : userinfo(new Headers(init?.headers).get('Authorization'))
            )

        it('caches the email per user', async () => {
            mockIdp(async () =>
                Response.json({ sub: 'alice', email: 'alice@example.com' })
            )
            const cache = createOidcCache(logger)

            for (const token of ['token-1', 'token-2']) {
                await expect(
                    cache.fetchUserEmail(CONFIG_URL, 'alice', token)
                ).resolves.toBe('alice@example.com')
            }

            expect(callsTo(USERINFO_URL)).toBe(1)
            expect(callsTo(CONFIG_URL)).toBe(1)
        })

        it('does not share emails between users', async () => {
            mockIdp(async (auth) =>
                Response.json(
                    auth === 'Bearer bob-token'
                        ? { sub: 'bob', email: 'bob@example.com' }
                        : { sub: 'alice', email: 'alice@example.com' }
                )
            )
            const cache = createOidcCache(logger)

            await cache.fetchUserEmail(CONFIG_URL, 'alice', 'alice-token')
            await expect(
                cache.fetchUserEmail(CONFIG_URL, 'bob', 'bob-token')
            ).resolves.toBe('bob@example.com')
        })

        it('fetches the email again after the TTL', async () => {
            mockIdp(async () =>
                Response.json({ sub: 'alice', email: 'alice@example.com' })
            )
            const cache = createOidcCache(logger)

            await cache.fetchUserEmail(CONFIG_URL, 'alice', 'token')
            advance(CACHE_TTL_MS)
            await cache.fetchUserEmail(CONFIG_URL, 'alice', 'token')

            expect(callsTo(USERINFO_URL)).toBe(2)
        })

        it('caches a missing email or userinfo endpoint as well', async () => {
            mockIdp(async () => Response.json({ sub: 'alice' }))
            const cache = createOidcCache(logger)

            await cache.fetchUserEmail(CONFIG_URL, 'alice', 'token')
            await expect(
                cache.fetchUserEmail(CONFIG_URL, 'alice', 'token')
            ).resolves.toBeUndefined()
            expect(callsTo(USERINFO_URL)).toBe(1)

            mockIdp(async () => Response.json({}), DISCOVERY)
            const withoutUserinfo = createOidcCache(logger)
            await expect(
                withoutUserinfo.fetchUserEmail(CONFIG_URL, 'alice', 'token')
            ).resolves.toBeUndefined()
        })

        it('resolves failures to undefined and retries after RETRY_AFTER_MS', async () => {
            mockIdp(async () => new Response(null, { status: 500 }))
            const cache = createOidcCache(logger)

            for (let i = 0; i < 2; i++) {
                await expect(
                    cache.fetchUserEmail(CONFIG_URL, 'alice', 'token')
                ).resolves.toBeUndefined()
            }
            expect(callsTo(USERINFO_URL)).toBe(1)

            mockIdp(async () =>
                Response.json({ sub: 'alice', email: 'alice@example.com' })
            )
            advance(RETRY_AFTER_MS)
            await expect(
                cache.fetchUserEmail(CONFIG_URL, 'alice', 'token')
            ).resolves.toBe('alice@example.com')
        })

        it(`keeps at most ${MAX_ENTRIES} emails, dropping the oldest`, async () => {
            mockIdp(async () =>
                Response.json({ sub: 'user', email: 'user@example.com' })
            )
            const cache = createOidcCache(logger)

            for (let i = 0; i <= MAX_ENTRIES; i++) {
                await cache.fetchUserEmail(CONFIG_URL, `user-${i}`, 'token')
            }
            expect(callsTo(USERINFO_URL)).toBe(MAX_ENTRIES + 1)

            // The newest is still cached, the oldest was dropped
            await cache.fetchUserEmail(
                CONFIG_URL,
                `user-${MAX_ENTRIES}`,
                'token'
            )
            expect(callsTo(USERINFO_URL)).toBe(MAX_ENTRIES + 1)
            await cache.fetchUserEmail(CONFIG_URL, 'user-0', 'token')
            expect(callsTo(USERINFO_URL)).toBe(MAX_ENTRIES + 2)
        })
    })
})
