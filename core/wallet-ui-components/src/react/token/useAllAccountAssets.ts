// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useQueries } from '@tanstack/react-query'
import Decimal from 'decimal.js'
import { useCallback, useMemo } from 'react'

import {
    aggregateHoldings,
    enrichWithInstrumentInfo,
    type AggregatedAccountBalance,
    type AggregatedHolding,
} from './aggregate-holdings.ts'
import type { PortfolioHolding } from './holdings.ts'
import { holdingsQueryOptions } from './query-options.ts'
import { useTokenContext } from './TokenProvider.tsx'

export interface TokenWallet {
    partyId: string
    hint: string
    primary: boolean
}

export interface PortfolioAssetWalletBalanceView {
    id: string //wallet partyId
    walletName: string
    isPrimary: boolean
    amount: string
    accounts: AggregatedAccountBalance[] //party id can have multiple accounts
}

export interface PortfolioAssetView extends Omit<
    AggregatedHolding,
    'accountBalances'
> {
    walletBalances: PortfolioAssetWalletBalanceView[]
}

export interface PortfolioAssetsResult {
    assets: PortfolioAssetView[]
    isLoading: boolean
    isError: boolean
    error: Error | null
    refetch: () => void
}

export const useAllAccountAssets = (
    wallets: readonly TokenWallet[]
): PortfolioAssetsResult => {
    const {
        client,
        instruments: registryInstruments,
        isLoading: isClientLoading,
        error: clientError,
    } = useTokenContext()

    const holdingsQueries = useQueries({
        queries: wallets.map((wallet) =>
            holdingsQueryOptions({ partyId: wallet.partyId, client })
        ),
    })

    const holdings = useMemo(() => {
        const byCid = new Map<string, PortfolioHolding>()
        for (const query of holdingsQueries) {
            if (!query.data || query.isError) continue
            for (const holding of query.data)
                byCid.set(holding.contractId, holding)
        }
        return [...byCid.values()]
    }, [holdingsQueries])

    const assets = useMemo(() => {
        const walletByParty = new Map(
            wallets.map((wallet) => [wallet.partyId, wallet])
        )

        return enrichWithInstrumentInfo(
            aggregateHoldings(holdings),
            registryInstruments
        ).map(({ accountBalances, ...asset }) => ({
            ...asset,
            walletBalances: toWalletBalances(accountBalances, walletByParty),
        }))
    }, [wallets, holdings, registryInstruments])

    const refetch = useCallback(() => {
        void Promise.all(holdingsQueries.map((query) => query.refetch()))
    }, [holdingsQueries])

    const queryError = holdingsQueries.find((query) => query.error)?.error
    const error = clientError ?? queryError

    return {
        assets,
        isLoading:
            isClientLoading || holdingsQueries.some((query) => query.isLoading),
        isError:
            !!clientError || holdingsQueries.some((query) => query.isError),
        error: error instanceof Error ? error : null,
        refetch,
    }
}

export function toWalletBalances(
    accountBalances: AggregatedAccountBalance[],
    walletByParty: ReadonlyMap<string, TokenWallet>
): PortfolioAssetWalletBalanceView[] {
    const byOwner = new Map<string, AggregatedAccountBalance[]>()

    for (const b of accountBalances) {
        const owner = b.account.owner
        if (!owner) continue
        byOwner.set(owner, [...(byOwner.get(owner) ?? []), b])
    }

    return [...byOwner.entries()]
        .map(([owner, accounts]) => {
            const wallet = walletByParty.get(owner)
            return {
                id: owner,
                walletName: wallet?.hint ?? owner,
                isPrimary: Boolean(wallet?.primary),
                amount: accounts
                    .reduce((sum, a) => sum.plus(a.totalAmount), new Decimal(0))
                    .toString(),
                accounts,
            }
        })
        .sort(
            (a, b) =>
                Number(b.isPrimary) - Number(a.isPrimary) ||
                a.walletName.localeCompare(b.walletName)
        )
}
