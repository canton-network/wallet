// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const queryKeys = {
    getTransactionHistory: {
        all: ['getTransactionHistory'],
        forParty: (party: string | undefined) => [
            'getTransactionHistory',
            party,
        ],
    },

    listPendingTransfers: {
        all: ['listPendingTransfers'],
        forParty: (party: string | undefined) => [
            'listPendingTransfers',
            party,
        ],
    },

    listHoldings: {
        all: ['holdings'],
        forParty: (party: string | undefined) => ['holdings', party],
    },

    listAllocationRequests: {
        all: ['listAllocationRequests'],
        forParty: (party: string | undefined) => [
            'listAllocationRequests',
            party,
        ],
    },

    listAllocations: {
        all: ['listAllocations'],
        forParty: (party: string | undefined) => ['listAllocations', party],
    },

    isDevNet: {
        all: ['isDevNet'],
    },

    walletSdk: {
        all: ['walletSdk'],
        forConnection: (sessionToken: string | undefined) => [
            'walletSdk',
            sessionToken,
        ],
    },

    instruments: {
        all: ['instruments'],
        forRegistry: (party: string, url: string) => [
            'instruments',
            party,
            url,
        ],
    },

    registries: {
        all: ['registries'],
    },

    utilityOperators: {
        all: ['utilityOperators'],
        forRegistry: (registryPartyId: string, registryUrl: string) => [
            'utilityOperators',
            registryPartyId,
            registryUrl,
        ],
    },

    preapprovals: {
        all: ['preapprovals'],
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
        }) => ['preapprovals', party, kind, registryPartyId, instrumentId],
    },
}
