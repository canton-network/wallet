// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react'
import { useOffers, type OfferItem } from './useOffers'

export interface ActionRequiredItemsResult {
    items: OfferItem[]
    isLoading: boolean
    isError: boolean
    error: Error | null
}

export function useActionRequiredItems(): ActionRequiredItemsResult {
    const offers = useOffers()
    const items = useMemo(
        () =>
            offers.all.filter(
                (offer) =>
                    offer.status === 'Pending' ||
                    offer.status === 'Action Required'
            ),
        [offers.all]
    )

    return {
        isLoading: offers.isLoading,
        isError: offers.isError,
        error: offers.error,
        items,
    }
}
