// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react'
import type {
    ActionItem,
    AllocationActionItem,
    TransferActionItem,
    TransferLegWithAllocation,
} from '@components/types'
import { isExpired } from '@utils/date-format'
import { useOfferItems, type OfferItemsResult } from './useOfferItems'

export type OfferDirection = 'incoming' | 'outgoing'
export type OfferCategory = 'transfers' | 'allocations'
export type OfferStatus =
    | 'Pending'
    | 'Action Required'
    | 'Allocated'
    | 'Expired'

export type TransferOfferItem = {
    id: string
    source: TransferActionItem
    direction: OfferDirection
    status: OfferStatus
}

export type AllocationOfferItem = {
    id: string
    source: AllocationActionItem
    status: OfferStatus
}

export type OfferItem = TransferOfferItem | AllocationOfferItem

export interface OffersResult extends Omit<OfferItemsResult, 'items'> {
    all: OfferItem[]
    transfers: OfferItem[]
    allocations: OfferItem[]
}

export function useOffers(): OffersResult {
    const offerItems = useOfferItems()
    const groupedOffers = useMemo(() => {
        const all = deriveOffers(offerItems.items)
        return {
            all,
            transfers: all.filter((offer) => offer.source.kind === 'transfer'),
            allocations: all.filter(
                (offer) => offer.source.kind === 'allocation'
            ),
        }
    }, [offerItems.items])

    return {
        ...groupedOffers,
        isLoading: offerItems.isLoading,
        isError: offerItems.isError,
        error: offerItems.error,
    }
}

function deriveOffers(items: ActionItem[]): OfferItem[] {
    const offers: OfferItem[] = []

    for (const item of items) {
        if (item.kind === 'transfer') {
            const offer = deriveTransferOffer(item)
            if (offer) offers.push(offer)
        } else {
            offers.push(deriveAllocationOffer(item))
        }
    }

    return offers
}

function deriveTransferOffer(
    item: TransferActionItem
): TransferOfferItem | null {
    const status = isExpired(item.expiry) ? 'Expired' : 'Pending'

    if (item.receiver === item.currentPartyId) {
        return {
            id: `${item.contractId}-incoming`,
            source: item,
            direction: 'incoming',
            status,
        }
    }

    if (item.sender === item.currentPartyId) {
        return {
            id: `${item.contractId}-outgoing`,
            source: item,
            direction: 'outgoing',
            status,
        }
    }

    return null
}

function deriveAllocationOffer(
    item: AllocationActionItem
): AllocationOfferItem {
    const isAllocated = areCurrentPartySenderLegsAllocated(item)
    const status = isAllocated
        ? 'Allocated'
        : isExpired(item.expiry)
          ? 'Expired'
          : 'Action Required'

    return {
        id: `${item.contractId}-allocation`,
        source: item,
        status,
    }
}

function areCurrentPartySenderLegsAllocated(item: AllocationActionItem) {
    const senderLegs = item.transferLegs.filter((leg) =>
        isCurrentPartySender(item.currentPartyId, leg)
    )

    return (
        senderLegs.length === 0 ||
        senderLegs.every((leg) => leg.allocations.length > 0)
    )
}

function isCurrentPartySender(
    currentPartyId: string,
    leg: TransferLegWithAllocation
) {
    return leg.transferLeg.sender === currentPartyId
}
