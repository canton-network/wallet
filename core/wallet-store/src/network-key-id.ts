// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateKeyId } from '@canton-network/core-wallet-auth'
import { Network } from './config/schema.js'

// Use after updates or creation of a network. It adds or updates auth.keyId when needed.
// TODO make sure that it also clears auth.keyId when needed, like when going from self-signed to oauth
export function ensureSelfSignedKeyId(
    network: Network,
    existing?: Network
): Network {
    const auth = network.auth
    if (auth.method !== 'self_signed') return network

    const previous =
        existing?.auth.method === 'self_signed' ? existing.auth : undefined

    const switchedToSelfSigned =
        existing !== undefined && existing.auth.method !== 'self_signed'

    // Changing secret or switching auth method to self_signed must generate a new key ID
    const secretRotated =
        switchedToSelfSigned ||
        (previous !== undefined && previous.clientSecret !== auth.clientSecret)

    // Keep the supplied key ID unless the auth method or secret changed
    if (
        auth.keyId &&
        !switchedToSelfSigned &&
        (!secretRotated || auth.keyId !== previous?.keyId)
    ) {
        return network
    }

    // Reuse the previous key ID when the secret hasn't changed
    if (!secretRotated && previous?.keyId) {
        return { ...network, auth: { ...auth, keyId: previous.keyId } }
    }

    return { ...network, auth: { ...auth, keyId: generateKeyId() } }
}
