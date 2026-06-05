// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Idp } from '@canton-network/core-wallet-user-rpc-client'

export function makeIdp(overrides: Partial<Idp> = {}): Idp {
    return {
        id: 'idp-1',
        type: 'oauth',
        issuer: 'https://issuer.example',
        configUrl: 'https://issuer.example/.well-known',
        ...overrides,
    }
}
