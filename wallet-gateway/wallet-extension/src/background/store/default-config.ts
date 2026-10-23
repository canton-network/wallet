// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { StoreInternalConfig } from '@canton-network/core-wallet-store-inmemory'

/**
 * The local network and mock IdP that a new vault starts with. This is a
 * function so each store gets its own copy, because `StoreInternal` edits
 * these arrays in place.
 */
export function defaultConfig(): StoreInternalConfig {
    return {
        idps: [
            {
                id: 'idp-mock-oauth',
                type: 'oauth',
                issuer: 'http://127.0.0.1:8889',
                configUrl:
                    'http://127.0.0.1:8889/.well-known/openid-configuration',
            },
        ],
        networks: [
            {
                id: 'canton:local-oauth',
                name: 'Local (OAuth IDP)',
                description: 'Mock OAuth IDP',
                synchronizerId:
                    'wallet::1220e7b23ea52eb5c672fb0b1cdbc916922ffed3dd7676c223a605664315e2d43edd',
                identityProviderId: 'idp-mock-oauth',
                auth: {
                    method: 'authorization_code',
                    clientId: 'operator',
                    scope: 'openid email daml_ledger_api offline_access',
                    audience:
                        'https://daml.com/jwt/aud/participant/participant1::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424',
                },
                adminAuth: {
                    method: 'client_credentials',
                    scope: 'daml_ledger_api',
                    audience:
                        'https://daml.com/jwt/aud/participant/participant1::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424',
                    clientId: 'participant_admin',
                    clientSecret: 'admin-client-secret',
                },
                serviceAccountAuth: {
                    method: 'client_credentials',
                    scope: 'daml_ledger_api',
                    audience:
                        'https://daml.com/jwt/aud/participant/participant1::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424',
                    clientId: 'service_account',
                    clientSecret: 'service-account-secret',
                },
                ledgerApi: {
                    baseUrl: 'http://127.0.0.1:5003',
                },
            },
        ],
    }
}
