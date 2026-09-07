// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Idp } from '@canton-network/core-wallet-auth'
import { Network, Store } from '@canton-network/core-wallet-store'
import { decodeJwt, decodeProtectedHeader, JWTPayload } from 'jose'

function normalizeAudienceClaim(value: JWTPayload['aud']): string[] {
    if (typeof value === 'string') {
        return [value]
    }

    if (Array.isArray(value)) {
        return value
    }

    return []
}

export async function assertTokenClaimsMatchNetwork(
    store: Store,
    accessToken: string,
    network: Network,
    idp: Idp
): Promise<void> {
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

    if (idp.type === 'self_signed') {
        const { kid } = decodeProtectedHeader(accessToken)
        if (!kid) {
            throw new Error('Self-signed JWT does not contain a kid header.')
        }

        const tokenNetwork = await store.getNetworkByKeyId(kid)
        if (!tokenNetwork) {
            throw new Error('No self-signed network uses this JWT key id.')
        }

        if (tokenNetwork.id !== network.id) {
            throw new Error(
                `Token kid does not match the selected network's key id.`
            )
        }
    }
}
