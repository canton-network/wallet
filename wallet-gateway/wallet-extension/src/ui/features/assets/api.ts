// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Wallet } from '@canton-network/core-wallet-user-rpc-client'
import type {
    TokenInstrument,
    TokenInstruments,
    TokenWallet,
} from '@canton-network/core-wallet-ui-components/react/token'
import { queryOptions } from '@tanstack/react-query'
import type { TokenAsset } from '@/background/token/service'
import { queryKeys } from '@/ui/lib/query/keys'
import { getTokenClient } from '@/ui/lib/token-client'

/**
 * The registries' instruments, keyed by their admin party. Amounts are shown
 * as the ledger's decimal strings, so there are no decimals.
 */
export function toTokenInstruments(assets: TokenAsset[]): TokenInstruments {
    const instruments = new Map<string, TokenInstrument[]>()
    for (const asset of assets) {
        const forAdmin = instruments.get(asset.admin) ?? []
        forAdmin.push({
            id: asset.id,
            name: asset.displayName,
            symbol: asset.symbol,
        })
        instruments.set(asset.admin, forAdmin)
    }
    return instruments
}

export const tokenInstrumentsQuery = () =>
    queryOptions({
        queryKey: queryKeys.token.assets(),
        queryFn: () => getTokenClient().token.assets(),
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
