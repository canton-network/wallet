// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PartyId } from '@canton-network/core-types'

// PortfolioService is a fat interface that tries to capture everything our
// portflio can do.  Separating the interface from the implementation will
// hopefully help us when we port the codebase to use web components instead
// of react.
export interface PortfolioService {
    // Network info
    isDevNet: (_: {
        sessionToken: string
        validatorUrl: string
    }) => Promise<boolean>

    // Tap
    tap: (_: {
        registryUrls: ReadonlyMap<PartyId, string>
        party: string
        sessionToken: string
        validatorUrl: string
        instrumentId: { admin: string; id: string }
        amount: number
    }) => Promise<void>
}
