// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Alert, Box, Paper, Typography } from '@mui/material'
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
        <Box
            component={Paper}
            elevation={0}
            sx={{
                minHeight: 74,
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'background.paper',
                borderRadius: 1,
                px: 3,
                py: 3,
            }}
        >
            <Typography variant="body1" color="text.primary">
                This wallet is not holding any assets
            </Typography>
        </Box>
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
