// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Idp } from '@canton-network/core-wallet-auth'
import type { Network } from '@canton-network/core-wallet-store'
import { decodeJwt, decodeProtectedHeader, type JWTPayload } from 'jose'

import { Env } from '../env.ts'

// Escape hatch for deployments whose IDP issues tokens with an `azp`/`client_id`
// that differs from the network's configured clientId. Weakens token validation.
export const DISABLE_CLIENT_ID_CHECK_ENV =
    'WALLET_GATEWAY_DANGEROUSLY_DISABLE_CLIENT_ID_CHECK'

function isClientIdCheckDisabled(): boolean {
    return Env.get(DISABLE_CLIENT_ID_CHECK_ENV)?.toLowerCase() === 'true'
}

function normalizeAudienceClaim(value: JWTPayload['aud']): string[] {
    if (typeof value === 'string') {
        return [value]
    }

    if (Array.isArray(value)) {
        return value
    }

    return []
}

export function assertTokenClaimsMatchNetwork(
    accessToken: string,
    network: Network,
    idp: Idp
): void {
    const tokenClaims: JWTPayload = decodeJwt(accessToken)
    if (idp.type !== 'self_issued') {
        if (tokenClaims.iss !== idp.issuer) {
            throw new Error(`Token iss claim doesn't match IDP's issuer.`)
        }
    }

    const tokenAudiences = normalizeAudienceClaim(tokenClaims.aud)
    if (!tokenAudiences.includes(network.auth.audience)) {
        throw new Error(
            `Token aud claim doesn't match network's auth audience.`
        )
    }

    // check client ID based on `azp` (Authorized Party) claim or `client_id` claim, only if present.
    if ('clientId' in network.auth && !isClientIdCheckDisabled()) {
        const tokenClientId = tokenClaims.azp || tokenClaims.client_id
        if (tokenClientId && tokenClientId !== network.auth.clientId) {
            throw new Error(
                `Token client ID doesn't match network's auth clientId.`
            )
        }
    }

    if (idp.type === 'self_signed') {
        const { kid } = decodeProtectedHeader(accessToken)
        if (!kid) {
            throw new Error('Self-signed JWT does not contain a kid header.')
        }

        if (kid !== network.id) {
            throw new Error(`Token kid does not match the selected network id.`)
        }
    }
}
