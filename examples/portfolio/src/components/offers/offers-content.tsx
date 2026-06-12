// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Alert, Box, Skeleton } from '@mui/material'
import { OfferRowGrid, OfferRowShell } from './offer-row-layout'
import type { OfferDirection, OfferItem } from '@hooks/useOffers'
import { OfferRow } from './offer-row'

interface OffersContentProps {
    offers: OfferItem[]
    direction: OfferDirection
    isLoading: boolean
    isError: boolean
    error: Error | null
    hasSearchQuery: boolean
    onOfferClick: (offer: OfferItem) => void
}

export function OffersContent({
    offers,
    direction,
    isLoading,
    isError,
    error,
    hasSearchQuery,
    onOfferClick,
}: OffersContentProps) {
    if (isError) {
        return (
            <Alert severity="error">
                {error?.message ?? 'Unable to load offers.'}
            </Alert>
        )
    }

    if (isLoading) {
        return (
            <Box sx={{ display: 'grid', gap: 2 }}>
                {Array.from({ length: 5 }, (_, index) => (
                    <OfferRowSkeleton key={index} />
                ))}
            </Box>
        )
    }

    if (offers.length === 0) {
        return (
            <Alert severity="info">
                {hasSearchQuery
                    ? 'No offers match your search.'
                    : `There are currently no ${direction} offers.`}
            </Alert>
        )
    }

    return (
        <Box sx={{ display: 'grid', gap: 2 }}>
            {offers.map((offer) => (
                <OfferRow
                    key={offer.id}
                    offer={offer}
                    onClick={() => onOfferClick(offer)}
                />
            ))}
        </Box>
    )
}

function OfferRowSkeleton() {
    return (
        <OfferRowShell>
            <OfferRowGrid columns={6}>
                {Array.from({ length: 6 }, (_, index) => (
                    <Box key={index} sx={{ minWidth: 0 }}>
                        <Skeleton variant="text" width={96} />
                        <Skeleton variant="text" width="75%" />
                    </Box>
                ))}
            </OfferRowGrid>
        </OfferRowShell>
    )
}
