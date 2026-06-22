// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Alert } from '@mui/material'
import type { WalletHoldingsResult } from '@hooks/useWalletHoldings'
import { getInstrumentInitials } from '@utils/instrument-display'
import {
    AssetBalanceCard,
    AssetBalanceCardSkeleton,
    AssetsPanel,
} from '@components/dashboard/asset-balance-card'
import {
    getInstrumentKey,
    type AggregatedHolding,
} from '@utils/aggregate-holdings'
import { DashboardEmptyState } from './dashboard-empty-state'

export function WalletAssetsContent({
    instruments,
    isLoading,
    isError,
    error,
}: WalletHoldingsResult) {
    if (isError) {
        return (
            <Alert severity="error">
                {error?.message ?? 'Unable to load assets for this wallet.'}
            </Alert>
        )
    }

    if (isLoading) {
        return (
            <AssetsPanel grid>
                {Array.from({ length: 6 }, (_, index) => (
                    <AssetBalanceCardSkeleton key={index} />
                ))}
            </AssetsPanel>
        )
    }

    if (instruments.length === 0) {
        return <WalletAssetsEmptyState />
    }

    return (
        <AssetsPanel grid>
            {instruments.map((asset) => (
                <WalletAssetCard
                    key={getInstrumentKey(asset.instrumentId)}
                    asset={asset}
                />
            ))}
        </AssetsPanel>
    )
}

function WalletAssetsEmptyState() {
    return (
        <DashboardEmptyState>
            This wallet is not holding any assets
        </DashboardEmptyState>
    )
}

type WalletAssetCardProps = {
    asset: AggregatedHolding
}

function WalletAssetCard({ asset }: WalletAssetCardProps) {
    const name = asset.instrument?.name ?? asset.instrumentId.id
    const symbol = asset.instrument?.symbol ?? asset.instrumentId.id
    const initials = getInstrumentInitials(name)

    return (
        <AssetBalanceCard
            name={name}
            symbol={symbol}
            amount={asset.totalAmount}
            initials={initials}
        />
    )
}
