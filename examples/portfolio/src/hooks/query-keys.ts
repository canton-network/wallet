// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { tokenQueryKeys } from '@canton-network/core-wallet-ui-components/react/token'
import type { QueryClient } from '@tanstack/react-query'

const walletConnection = ['walletConnection'] as const

export const queryKeys = {
    walletConnection: {
        all: walletConnection,

        walletSdk: {
            all: [...walletConnection, 'walletSdk'] as const,
            forConfig: ({
                tokenVersion,
                registryUrls,
            }: {
                tokenVersion: number
                registryUrls: readonly string[]
            }) =>
                [
                    ...walletConnection,
                    'walletSdk',
                    tokenVersion,
                    registryUrls,
                ] as const,
        },

        allocations: {
            all: [...walletConnection, 'allocations'] as const,
            forParty: (party: string | undefined) =>
                [...walletConnection, 'allocations', party] as const,
        },

        allocationRequests: {
            all: [...walletConnection, 'allocationRequests'] as const,
            forParty: (party: string | undefined) =>
                [...walletConnection, 'allocationRequests', party] as const,
        },

        allocationsV2: {
            forParty: (party: string | undefined) =>
                [...walletConnection, 'allocations', 'v2', party] as const,
        },

        allocationRequestsV2: {
            forParty: (party: string | undefined) =>
                [
                    ...walletConnection,
                    'allocationRequests',
                    'v2',
                    party,
                ] as const,
        },
        allocationInstructionsV2: {
            forParty: (party: string | undefined) =>
                [
                    ...walletConnection,
                    'allocationInstructions',
                    'v2',
                    party,
                ] as const,
        },
        transactionHistory: {
            all: [...walletConnection, 'transactionHistory'] as const,
            forParty: (party: string | undefined) =>
                [...walletConnection, 'transactionHistory', party] as const,
        },

        transactionHistoryService: {
            all: [...walletConnection, 'transactionHistoryService'] as const,
            forParty: (party: string) =>
                [
                    ...walletConnection,
                    'transactionHistoryService',
                    party,
                ] as const,
        },

        preapprovals: {
            all: [...walletConnection, 'preapprovals'] as const,
            status: ({
                party,
                kind,
                registryPartyId,
                instrumentId,
            }: {
                party: string | undefined
                kind: string
                registryPartyId: string
                instrumentId: string
            }) =>
                [
                    ...walletConnection,
                    'preapprovals',
                    'status',
                    party,
                    kind,
                    registryPartyId,
                    instrumentId,
                ] as const,
        },
    },

    isDevNet: {
        forValidator: (validatorUrl: string) =>
            ['isDevNet', validatorUrl] as const,
        all: ['isDevNet'] as const,
    },

    instruments: {
        all: ['instruments'] as const,
        forRegistry: (party: string, url: string) =>
            ['instruments', party, url] as const,
    },

    registries: {
        all: ['registries'] as const,
    },

    registryInfo: {
        all: ['registryInfo'] as const,
        forRegistry: (url: string) => ['registryInfo', url] as const,
    },

    utilityOperators: {
        all: ['utilityOperators'] as const,
        forRegistry: (registryPartyId: string, registryUrl: string) =>
            ['utilityOperators', registryPartyId, registryUrl] as const,
    },
}

export function invalidateAllocationQueries(
    queryClient: QueryClient,
    party: string
) {
    const keys = queryKeys.walletConnection
    return Promise.all(
        [
            // V1
            keys.allocationRequests.forParty(party),
            keys.allocations.forParty(party),
            // V2 (version before party: ['…', 'v2', party])
            keys.allocationRequestsV2.forParty(party),
            keys.allocationsV2.forParty(party),
            keys.allocationInstructionsV2.forParty(party),
            // Effects of any allocation action
            tokenQueryKeys.holdings.all,
            keys.transactionHistory.all,
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey }))
    )
}
