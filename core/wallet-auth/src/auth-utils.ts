// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJwt } from 'jose'
import { AuthContext } from './auth-service'
import { providerErrors } from '@canton-network/core-rpc-errors'
import { Logger } from '@canton-network/core-types'
import { Auth, AuthType, Idp } from './config/schema.js'

export function assertConnected(
    authContext: AuthContext | undefined
): AuthContext {
    if (!authContext) {
        throw providerErrors.unauthorized({
            message: 'User is not connected',
        })
    }
    return authContext
}

/**
 * Extract a User ID from the `sub` claim of a JWT. Throws if `sub` is missing.
 *
 * @param token a base64 encoded JWT token
 * @returns
 */
export function jwtUserId(token: string): string {
    const { sub } = decodeJwt(token)

    if (!sub) {
        throw new Error('token did not contain a subject field')
    }

    return sub
}

/**
 * Extract the optional `email` claim from a JWT.
 *
 * @param token a base64 encoded JWT token
 * @returns email when present, otherwise undefined
 */
export function jwtUserEmail(token: string): string | undefined {
    const { email } = decodeJwt(token)

    if (typeof email !== 'string' || email.length === 0) {
        return undefined
    }

    return email
}

/**
 * Standard OIDC UserInfo claims as defined by OpenID Connect Core 1.0.
 * https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
 */
export interface OidcUserInfo {
    sub: string
    name?: string
    given_name?: string
    family_name?: string
    middle_name?: string
    nickname?: string
    preferred_username?: string
    profile?: string
    picture?: string
    website?: string
    email?: string
    email_verified?: boolean
    gender?: string
    birthdate?: string
    zoneinfo?: string
    locale?: string
    phone_number?: string
    phone_number_verified?: boolean
    updated_at?: number
    address?: Record<string, string>
    [key: string]: unknown
}

/**
 * Fetches user claims from the OIDC UserInfo endpoint.
 * Discovers the endpoint via the OIDC discovery document at configUrl.
 *
 * @param configUrl   - The OIDC discovery document URL (/.well-known/openid-configuration)
 * @param accessToken - The user's bearer access token
 * @returns The UserInfo claims, or undefined if the IDP does not expose a userinfo endpoint
 * @throws If any network request fails
 */
export async function fetchOidcUserInfo(
    configUrl: string,
    accessToken: string
): Promise<OidcUserInfo | undefined> {
    const configResponse = await fetch(configUrl)
    if (!configResponse.ok) {
        throw new Error(
            `Failed to fetch OIDC discovery document: ${configResponse.status} ${configResponse.statusText}`
        )
    }

    const config = (await configResponse.json()) as {
        userinfo_endpoint?: string
    }
    if (!config.userinfo_endpoint) {
        return undefined
    }

    const userInfoResponse = await fetch(config.userinfo_endpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!userInfoResponse.ok) {
        throw new Error(
            `Failed to fetch OIDC userinfo: ${userInfoResponse.status} ${userInfoResponse.statusText}`
        )
    }

    return (await userInfoResponse.json()) as OidcUserInfo
}

/**
 * Resolve the user email from the OIDC userinfo endpoint.
 *
 * @param authContext - The authentication context
 * @param idp - The IDP configuration
 * @param logger - The logger
 * @returns The user email, or undefined if the email is not found
 */
export async function resolveUserEmail(
    authContext: AuthContext,
    idp: Idp,
    logger?: Logger
): Promise<string | undefined> {
    if (authContext.email) {
        return authContext.email
    }

    try {
        if (idp.type !== 'oauth') {
            return undefined
        }

        const userInfo = await fetchOidcUserInfo(
            idp.configUrl,
            authContext.accessToken
        )
        return userInfo?.email
    } catch (error) {
        logger?.warn(error, 'Failed to resolve user email from OIDC userinfo')
        return undefined
    }
}

/**
 * Determine if a given JWT is still valid based on its expiry time.
 *
 * @param token a base64 encoded JWT token
 * @returns true if the token is expired, false if not
 */
export function jwtExpired(token: string): boolean {
    try {
        const payload = decodeJwt(token)
        const now = Math.floor(Date.now() / 1000)
        return typeof payload.exp === 'number' && payload.exp <= now
    } catch {
        return true
    }
}

/**
 * Returns true when the network is configured for machine-to-machine OAuth
 * (client credentials), which triggers the service account workflow.
 */
export function isClientCredentialsNetworkAuth(auth: Auth): boolean {
    return auth.method === 'client_credentials'
}

/**
 * Returns true when the access token was issued via the client credentials grant.
 * OIDC providers typically set the `gty` (grant type) claim accordingly.
 */
export function isClientCredentialsToken(accessToken: string): boolean {
    try {
        const { gty } = decodeJwt(accessToken)
        return gty === 'client_credentials'
    } catch {
        return false
    }
}

/**
 * Records how a Gateway session token was obtained for persistence and
 * automation session selection.
 */
export function resolveSessionAuthType(
    accessToken: string,
    networkAuth: Auth
): AuthType {
    if (isClientCredentialsToken(accessToken)) {
        return 'client_credentials'
    }
    return networkAuth.method
}

/**
 * Detects automation (service account) requests from network auth config and/or token claims.
 */
export function isServiceAccountRequest(
    networkAuth: Auth,
    accessToken: string
): boolean {
    return (
        isClientCredentialsNetworkAuth(networkAuth) ||
        isClientCredentialsToken(accessToken)
    )
}

/**
 * Optional allow-list of ledger user IDs that service accounts may act as.
 * When omitted or empty, all authenticated users are allowed.
 */
export function assertServiceAccountUserAllowed(
    userId: string,
    allowedUsers: string[] | undefined
): void {
    if (!allowedUsers || allowedUsers.length === 0) {
        return
    }
    if (!allowedUsers.includes(userId)) {
        throw new Error(
            `User "${userId}" is not allowed for service account automation`
        )
    }
}
