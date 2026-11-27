// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    getInstrumentKey,
    type PortfolioAssetView,
    type PortfolioAssetsResult,
} from '@canton-network/core-wallet-ui-components/react/token'
import {
    AssetBalanceCard,
    AssetBalanceCardSkeleton,
    AssetsPanel,
} from '@components/dashboard/asset-balance-card'
import { AssetViewDialog } from '@components/dashboard/asset-view-dialog'
import { Alert } from '@mui/material'
import { getInstrumentInitials } from '@utils/instrument-display'
import { useState } from 'react'

export function AllAssetsContent({
    assets,
    isLoading,
    isError,
    error,
}: PortfolioAssetsResult) {
    const [selectedAsset, setSelectedAsset] =
        useState<PortfolioAssetView | null>(null)

    const handleCloseAssetDialog = () => {
        setSelectedAsset(null)
    }

    if (isError) {
        return (
            <Alert severity="error">
                {error?.message ?? 'Unable to load assets across your wallets.'}
            </Alert>
        )
    }

    if (isLoading) {
        return (
            <AssetsPanel>
                {/* Render placeholder rows while balances load. */}
                {Array.from({ length: 5 }, (_, index) => (
                    <AssetBalanceCardSkeleton key={index} />
                ))}
            </AssetsPanel>
        )
    }

    if (assets.length === 0) {
        return (
            <Alert severity="info">
                There are currently no assets across your wallets.
            </Alert>
        )
    }

    return (
        <>
            <AssetsPanel>
                {assets.map((asset) => (
                    <AssetRow
                        key={getInstrumentKey(asset.instrumentId)}
                        asset={asset}
                        onClick={() => setSelectedAsset(asset)}
                    />
                ))}
            </AssetsPanel>
            {selectedAsset && (
                <AssetViewDialog
                    asset={selectedAsset}
                    onClose={handleCloseAssetDialog}
                />
            )}
        </>
    )
}

type AssetRowProps = {
    asset: PortfolioAssetView
    onClick: () => void
}

function AssetRow({ asset, onClick }: AssetRowProps) {
    const name = asset.instrument?.name ?? asset.instrumentId.id
    const symbol = asset.instrument?.symbol ?? asset.instrumentId.id
    const initials = getInstrumentInitials(name)

    return (
        <AssetBalanceCard
            name={name}
            symbol={symbol}
            totalAmount={asset.totalAmount}
            lockedAmount={asset.lockedAmount}
            unlockedAmount={asset.availableAmount}
            initials={initials}
            ariaLabel={`View ${name} holdings by wallet`}
            onClick={onClick}
        />
    )
}
