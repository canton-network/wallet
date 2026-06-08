// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJwt } from 'jose'
import { Auth } from './config/schema.js'

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
