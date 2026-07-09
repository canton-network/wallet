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

function claimContainsRequiredScopes(
    tokenClaim: unknown,
    networkAuthScopes: string[]
): boolean {
    const claimScopes = normalizeScopeClaim(tokenClaim)
    return (
        claimScopes.length === networkAuthScopes.length &&
        networkAuthScopes.every((scope) => claimScopes.includes(scope))
    )
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

    const tokenSubject = tokenClaims.sub
    if (tokenSubject !== network.auth.clientId) {
        throw new Error(
            `Token sub claim doesn't match network's auth clientId.`
        )
    }

    const requiredScopes = normalizeScopeClaim(network.auth.scope)
    const hasScopeClaim = tokenClaims.scope !== undefined
    const hasScpClaim = tokenClaims.scp !== undefined

    if (!hasScopeClaim && !hasScpClaim) {
        throw new Error(`Token scope and scp claims missing.`)
    }

    if (
        hasScopeClaim &&
        !claimContainsRequiredScopes(tokenClaims.scope, requiredScopes)
    ) {
        throw new Error(`Token scope claim doesn't match network's auth scope.`)
    }

    if (
        hasScpClaim &&
        !claimContainsRequiredScopes(tokenClaims.scp, requiredScopes)
    ) {
        throw new Error(`Token scp claim doesn't match network's auth scope.`)
    }
}
