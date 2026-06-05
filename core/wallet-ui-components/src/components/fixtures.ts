// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    Idp,
    PublicNetwork,
} from '@canton-network/core-wallet-user-rpc-client'

export function makePublicNetwork(
    overrides: Partial<PublicNetwork> = {}
): PublicNetwork {
    return {
        id: 'net-1',
        name: 'Test Network',
        description: 'Test network description',
        authMethod: 'authorization_code',
        synchronizerId: 'sync::id',
        identityProviderId: 'idp-1',
        ledgerApi: 'https://ledger.example',
        clientId: 'client-1',
        ...overrides,
    }
}

export function makeIdp(overrides: Partial<Idp> = {}): Idp {
    return {
        id: 'idp-1',
        type: 'oauth',
        issuer: 'https://issuer.example',
        configUrl: 'https://issuer.example/.well-known',
        ...overrides,
    }
}
