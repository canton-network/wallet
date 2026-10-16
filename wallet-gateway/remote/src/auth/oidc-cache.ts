// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    fetchOidcDiscovery,
    fetchOidcUserInfo,
    IdpUnavailableError,
    type OidcDiscovery,
} from '@canton-network/core-wallet-auth'
import {
    createLocalJWKSet,
    createRemoteJWKSet,
    customFetch,
    type JSONWebKeySet,
    type JWTVerifyGetKey,
} from 'jose'
import type { Logger } from 'pino'

/**
 * How long discovery documents, JWKS and user emails are used before they are
 * fetched again. Matches jose's default `cacheMaxAge` for remote JWKS.
 */
export const CACHE_TTL_MS = 10 * 60 * 1000
/**
 * A failed IDP request isn't repeated for this long, the error is rethrown
 * instead. An outage or rate limit then doesn't lead to one IDP request per
 * gateway request.
 */
export const RETRY_AFTER_MS = 30 * 1000
/** Bounds each cache, the oldest entries are dropped first. */
export const MAX_ENTRIES = 10_000

/**
 * Fetches the JWKS for `createRemoteJWKSet`. jose reports a failed JWKS
 * request as a generic error, indistinguishable from a bad token, so fail with
 * IdpUnavailableError instead.
 */
async function requestJwks(
    url: string,
    options: {
        headers: Headers
        method: 'GET'
        redirect: 'manual'
        signal: AbortSignal
    }
): Promise<Response> {
    let response: Response
    try {
        response = await fetch(url, options)
    } catch (error) {
        throw new IdpUnavailableError(
            `Failed to fetch JWKS: ${error instanceof Error ? error.message : String(error)}`,
            { cause: error }
        )
    }
    // Exactly 200, not any 2xx: jose's own JWKS fetch requires it (and OIDC
    // Discovery 4.2 does for the discovery document). Anything else would
    // surface from jose as a generic error and be mistaken for a bad token.
    if (response.status !== 200) {
        throw new IdpUnavailableError(
            `Failed to fetch JWKS: ${response.status} ${response.statusText}`
        )
    }

    let jwks: unknown
    try {
        jwks = await response.json()
    } catch (error) {
        throw new IdpUnavailableError('JWKS response is not valid JSON', {
            cause: error,
        })
    }
    // Validate here rather than letting jose throw JWKSInvalid later, so a
    // malformed response is a failure of this request and isn't repeated
    try {
        createLocalJWKSet(jwks as JSONWebKeySet)
    } catch (error) {
        throw new IdpUnavailableError(
            `JWKS response is not a valid JSON Web Key Set: ${error instanceof Error ? error.message : String(error)}`,
            { cause: error }
        )
    }
    // The original headers (content-length, content-encoding) don't describe
    // the re-serialized body
    return Response.json(jwks)
}

function parseJwksUri(jwksUri: string): URL {
    try {
        return new URL(jwksUri)
    } catch (error) {
        throw new IdpUnavailableError(
            `OIDC discovery document has an invalid jwks_uri: ${jwksUri}`,
            { cause: error }
        )
    }
}

/**
 * Caches the outcome of one IDP request per key. Concurrent callers share the
 * pending request, a result is reused for {@link CACHE_TTL_MS} and a failure
 * for {@link RETRY_AFTER_MS}.
 */
function createCache<T>() {
    const entries = new Map<string, { result: Promise<T>; expiresAt: number }>()

    return (key: string, load: () => Promise<T>): Promise<T> => {
        const cached = entries.get(key)
        if (cached && Date.now() < cached.expiresAt) {
            return cached.result
        }

        const entry = { result: load(), expiresAt: Date.now() + CACHE_TTL_MS }
        entry.result.catch(() => {
            entry.expiresAt = Date.now() + RETRY_AFTER_MS
        })
        // Maps iterate in insertion order, so this drops the oldest entry
        entries.delete(key)
        entries.set(key, entry)
        if (entries.size > MAX_ENTRIES) {
            entries.delete(entries.keys().next().value!)
        }
        return entry.result
    }
}

/**
 * Caches what token verification needs from OIDC identity providers, so the
 * IDP isn't contacted on every request:
 *
 * - discovery documents, keyed by config URL
 * - one jose remote JWKS per `jwks_uri`, so jose's key cache is kept (it
 *   refetches after {@link CACHE_TTL_MS} and early for an unknown `kid`)
 * - user emails from the userinfo endpoint, for tokens without an email claim
 *
 * Failed requests aren't repeated for {@link RETRY_AFTER_MS}. Nothing is used
 * past {@link CACHE_TTL_MS}, while the IDP is unavailable verification fails.
 */
export function createOidcCache(logger: Logger) {
    const discoveries = createCache<OidcDiscovery>()
    const userEmails = createCache<string | undefined>()
    const remoteJwks = new Map<string, JWTVerifyGetKey>()

    function fetchDiscovery(configUrl: string): Promise<OidcDiscovery> {
        return discoveries(configUrl, () => fetchOidcDiscovery(configUrl))
    }

    /**
     * Returns the key resolver for `jwtVerify`, it fetches the JWKS as needed.
     */
    function fetchJwks(jwksUri: string): JWTVerifyGetKey {
        let getKey = remoteJwks.get(jwksUri)
        if (getKey) {
            return getKey
        }

        // jose keeps its key set when a refetch fails, it only lacks the
        // retry delay of createCache
        let failure: { error: unknown; retryAt: number } | undefined
        getKey = createRemoteJWKSet(parseJwksUri(jwksUri), {
            cacheMaxAge: CACHE_TTL_MS,
            [customFetch]: async (url, options) => {
                if (failure && Date.now() < failure.retryAt) {
                    throw failure.error
                }
                try {
                    return await requestJwks(url, options)
                } catch (error) {
                    failure = { error, retryAt: Date.now() + RETRY_AFTER_MS }
                    throw error
                }
            },
        })
        remoteJwks.set(jwksUri, getKey)
        return getKey
    }

    /**
     * Resolves the email of an already verified user from the userinfo
     * endpoint. Failures are logged and resolve to undefined, the email is
     * optional.
     */
    async function fetchUserEmail(
        configUrl: string,
        userId: string,
        accessToken: string
    ): Promise<string | undefined> {
        try {
            // Keyed by IDP and subject: any valid token of the user yields the same claims
            return await userEmails(
                JSON.stringify([configUrl, userId]),
                async () => {
                    const config = await fetchDiscovery(configUrl)
                    if (!config.userinfo_endpoint) {
                        return undefined
                    }
                    const userInfo = await fetchOidcUserInfo(
                        config.userinfo_endpoint,
                        accessToken
                    )
                    return userInfo.email || undefined
                }
            )
        } catch (error) {
            logger.warn(
                { err: error },
                'Failed to resolve user email from OIDC userinfo'
            )
            return undefined
        }
    }

    return { fetchDiscovery, fetchJwks, fetchUserEmail }
}

export type OidcCache = ReturnType<typeof createOidcCache>
