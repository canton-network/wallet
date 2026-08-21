// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Idp, Auth } from '@canton-network/core-wallet-auth'
import { Network } from '@canton-network/core-wallet-store'
import { decodeJwt, JWTPayload } from 'jose'

function normalizeAudienceClaim(value: JWTPayload['aud']): string[] {
    if (typeof value === 'string') {
        return [value]
    }

    if (Array.isArray(value)) {
        return value
    }

    return []
}

function normalizeScopeClaim(
    value: JWTPayload['scope'] | JWTPayload['scp'] | Auth['scope']
): string[] {
    if (typeof value === 'string') {
        return value.split(/\s+/)
    }

    if (Array.isArray(value)) {
        return value
    }

    return []
}

function claimContainsRequestedScopes(
    tokenClaim: unknown,
    networkAuthScopes: string[]
): boolean {
    const claimScopes = normalizeScopeClaim(tokenClaim)
    // token claim scopes has same scopes as requested - pass
    // token claim scopes is superset of requested scopes - pass
    // token claim doesn't have requested scopes - fail
    return networkAuthScopes.every((scope) => claimScopes.includes(scope))
}

export function assertTokenClaimsMatchNetwork(
    accessToken: string,
    network: Network,
    idp: Idp
): void {
    const expectedIssuer = idp.issuer
    const tokenClaims: JWTPayload = decodeJwt(accessToken)
    const tokenIssuer = tokenClaims.iss
    if (tokenIssuer !== expectedIssuer) {
        throw new Error(`Token iss claim doesn't match IDP's issuer.`)
    }

    const tokenAudiences = normalizeAudienceClaim(tokenClaims.aud)
    if (!tokenAudiences.includes(network.auth.audience)) {
        throw new Error(
            `Token aud claim doesn't match network's auth audience.`
        )
    }

    // check client ID based on `azp` (Authorized Party) claim or `client_id` claim, only if present.
    const tokenClientId = tokenClaims.azp || tokenClaims.client_id
    if (tokenClientId && tokenClientId !== network.auth.clientId) {
        throw new Error(
            `Token client ID doesn't match network's auth clientId.`
        )
    }

    const requestedScopes = normalizeScopeClaim(network.auth.scope)
    const hasScopeClaim = tokenClaims.scope !== undefined
    const hasScpClaim = tokenClaims.scp !== undefined

    if (!hasScopeClaim && !hasScpClaim) {
        throw new Error(`Token scope and scp claims missing.`)
    }

    // Prefer scope claim. Test scp instead if scope is not present.
    if (hasScopeClaim) {
        if (!claimContainsRequestedScopes(tokenClaims.scope, requestedScopes)) {
            throw new Error(
                `Token scope claim doesn't match network's auth scope.`
            )
        }

        return
    }

    if (!claimContainsRequestedScopes(tokenClaims.scp, requestedScopes)) {
        throw new Error(`Token scp claim doesn't match network's auth scope.`)
    }
}
