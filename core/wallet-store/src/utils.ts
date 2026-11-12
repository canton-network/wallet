// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Network } from './config/schema.js'

// Throws if the given network has a self-issued audience that is already used by another network.
export function assertUniqueSelfIssuedAudience(
    networks: Network[],
    candidate: Network,
    excludeNetworkId?: string
): void {
    if (candidate.auth.method !== 'self_issued') {
        return
    }

    const collision = networks.find(
        (network) =>
            network.id !== excludeNetworkId &&
            network.auth.method === 'self_issued' &&
            network.auth.audience === candidate.auth.audience
    )
    if (!collision) {
        return
    }

    throw new Error(
        `Self-issued audience "${candidate.auth.audience}" is already used by network "${collision.id}"`
    )
}

// Returns the self-issued network that matches any of the given audiences.
// Throws if there are multiple matches.
export function resolveSelfIssuedNetworkByAudiences(
    networks: Network[],
    audiences: string[]
): Network | undefined {
    const audienceSet = new Set(audiences)
    const matches = networks.filter(
        (network) =>
            network.auth.method === 'self_issued' &&
            audienceSet.has(network.auth.audience)
    )

    if (matches.length > 1) {
        throw new Error(
            `Multiple self-issued networks match token audience: ${matches
                .map((network) => network.id)
                .join(', ')}`
        )
    }

    return matches[0] ?? undefined
}

/**
 * Returns the hex-encoded SHA-256 digest of an access token. Stores keep this
 * digest instead of the raw token, and look sessions up by it. An unsalted
 * hash is enough because access tokens are signed JWTs with high entropy.
 */
export async function hashAccessToken(accessToken: string): Promise<string> {
    const digest = await globalThis.crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(accessToken)
    )
    return Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, '0')
    ).join('')
}
