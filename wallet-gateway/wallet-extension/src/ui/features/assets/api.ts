// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    RegistryInstrument,
    TokenInstruments,
    TokenWallet,
} from '@canton-network/core-wallet-ui-components/react/token'
import type { Wallet } from '@canton-network/core-wallet-user-rpc-client'
import { queryOptions } from '@tanstack/react-query'

import { queryKeys } from '@/ui/lib/query/keys.ts'
import { getTokenClient } from '@/ui/lib/token-client.ts'

/** The registries' instruments, keyed by their admin party. */
export function toTokenInstruments(
    list: RegistryInstrument[]
): TokenInstruments {
    const instruments = new Map<string, RegistryInstrument[]>()
    for (const instrument of list) {
        const forAdmin = instruments.get(instrument.admin) ?? []
        forAdmin.push(instrument)
        instruments.set(instrument.admin, forAdmin)
    }
    return instruments
}

export const tokenInstrumentsQuery = () =>
    queryOptions({
        queryKey: queryKeys.token.instruments(),
        queryFn: () => getTokenClient().token.instruments(),
        select: toTokenInstruments,
    })

/**
 * The wallets whose holdings to show. A party that isn't allocated yet has
 * none, and the ledger rejects a query for it.
 */
export function toTokenWallets(wallets: readonly Wallet[]): TokenWallet[] {
    return wallets
        .filter((wallet) => wallet.status === 'allocated')
        .map(({ partyId, hint, primary }) => ({ partyId, hint, primary }))
}
