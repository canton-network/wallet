// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PageHeader } from '@canton-network/core-wallet-ui-components/react'
import {
    getInstrumentKey,
    useAllAccountAssets,
    type PortfolioAssetView,
} from '@canton-network/core-wallet-ui-components/react/token'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { PageLoader } from '@/ui/components/feedback.tsx'
import { walletsQuery } from '@/ui/features/parties/index.ts'

import { tokenInstrumentsQuery, toTokenWallets } from './api.ts'

export function AssetsPage() {
    const wallets = useQuery(walletsQuery())
    const instruments = useQuery(tokenInstrumentsQuery())
    const tokenWallets = useMemo(
        () => toTokenWallets(wallets.data ?? []),
        [wallets.data]
    )
    const assets = useAllAccountAssets(tokenWallets)

    return (
        <>
            <PageHeader heading="Assets" />

            {instruments.isError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Couldn't load the asset names from the registries.{' '}
                    {instruments.error.message}
                </Alert>
            )}

            {wallets.isError ? (
                <Alert severity="error">
                    Couldn't load the parties. {wallets.error.message}
                </Alert>
            ) : assets.isError ? (
                <Alert
                    severity="error"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={assets.refetch}
                        >
                            Retry
                        </Button>
                    }
                >
                    Couldn't load the holdings. {assets.error?.message}
                </Alert>
            ) : wallets.isPending || assets.isLoading ? (
                <PageLoader />
            ) : assets.assets.length === 0 ? (
                <Alert severity="info">
                    Your parties don't hold any assets.
                </Alert>
            ) : (
                <Stack spacing={2}>
                    {assets.assets.map((asset) => (
                        <AssetCard
                            key={getInstrumentKey(asset.instrumentId)}
                            asset={asset}
                        />
                    ))}
                </Stack>
            )}
        </>
    )
}

function AssetCard({ asset }: { asset: PortfolioAssetView }) {
    const name = asset.instrument?.name ?? asset.instrumentId.id
    const symbol = asset.instrument?.symbol ?? asset.instrumentId.id
    // The amounts come from Decimal.toString(), which writes zero as '0'.
    const hasLocked = asset.lockedAmount !== '0'

    return (
        <Card variant="outlined">
            <CardContent>
                <Stack
                    direction="row"
                    sx={{ justifyContent: 'space-between', gap: 2 }}
                >
                    <Typography variant="subtitle1" component="h2">
                        {name}
                    </Typography>
                    <Typography variant="subtitle1">
                        {asset.totalAmount} {symbol}
                    </Typography>
                </Stack>
                {hasLocked && (
                    <Typography variant="body2" color="text.secondary">
                        {asset.availableAmount} available, {asset.lockedAmount}{' '}
                        locked
                    </Typography>
                )}
                <Divider sx={{ my: 1 }} />
                <Stack spacing={0.5}>
                    {asset.walletBalances.map((wallet) => (
                        <Stack
                            key={wallet.id}
                            direction="row"
                            sx={{ justifyContent: 'space-between', gap: 2 }}
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: 'center', minWidth: 0 }}
                            >
                                <Typography variant="body2" noWrap>
                                    {wallet.walletName}
                                </Typography>
                                {wallet.isPrimary && (
                                    <Chip label="Primary" size="small" />
                                )}
                            </Stack>
                            <Typography variant="body2">
                                {wallet.amount} {symbol}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    )
}
