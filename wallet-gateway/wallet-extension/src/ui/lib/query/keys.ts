// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Query key factory. Every TanStack Query key in the UI comes from here, so
// `invalidateQueries({ queryKey: queryKeys.wallets.all })` reaches every
// wallets query. Follows examples/portfolio/src/hooks/query-keys.ts.
// Add a key when the first query that needs it lands.

import { tokenQueryKeys } from '@canton-network/core-wallet-ui-components/react/token'

export const queryKeys = {
    vault: {
        all: ['vault'] as const,
        status: () => ['vault', 'status'] as const,
    },

    sessions: {
        all: ['sessions'] as const,
        list: () => ['sessions', 'list'] as const,
        status: () => ['sessions', 'status'] as const,
    },

    networks: {
        all: ['networks'] as const,
        list: () => ['networks', 'list'] as const,
    },

    idps: {
        all: ['idps'] as const,
        list: () => ['idps', 'list'] as const,
    },

    signingProviders: {
        all: ['signingProviders'] as const,
        list: () => ['signingProviders', 'list'] as const,
    },

    wallets: {
        all: ['wallets'] as const,
        // Of the current network, which the background resolves
        list: () => ['wallets', 'list'] as const,
        syncNeeded: () => ['wallets', 'syncNeeded'] as const,
    },

    siteApprovals: {
        all: ['siteApprovals'] as const,
        detail: (id: string) => ['siteApprovals', id] as const,
    },

    // Under the shared token keys, so that clearing `tokenQueryKeys.all`
    // also drops the previous network's assets.
    token: {
        assets: () => [...tokenQueryKeys.all, 'assets'] as const,
    },
}
