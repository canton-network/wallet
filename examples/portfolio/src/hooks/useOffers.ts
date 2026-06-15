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
export type OfferStatus =
    | 'Pending'
    | 'Action Required'
    | 'Allocated'
    | 'Expired'

export type OfferItem = {
    id: string
    source: ActionItem
    direction: OfferDirection
    status: OfferStatus
}

export interface OffersResult extends Omit<OfferItemsResult, 'items'> {
    all: OfferItem[]
    incoming: OfferItem[]
    outgoing: OfferItem[]
}

export function useOffers(): OffersResult {
    const offerItems = useOfferItems()
    const groupedOffers = useMemo(() => {
        const all = deriveOffers(offerItems.items)
        return {
            all,
            incoming: all.filter((offer) => offer.direction === 'incoming'),
            outgoing: all.filter((offer) => offer.direction === 'outgoing'),
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
    return items.flatMap((item) => {
        if (item.kind === 'transfer') {
            const offer = deriveTransferOffer(item)
            return offer ? [offer] : []
        }
        return deriveAllocationOffers(item)
    })
}

function deriveTransferOffer(item: TransferActionItem): OfferItem | null {
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

function deriveAllocationOffers(item: AllocationActionItem): OfferItem[] {
    const directions = new Set<OfferDirection>()

    for (const leg of item.transferLegs) {
        if (isCurrentPartyReceiver(item.currentPartyId, leg)) {
            directions.add('incoming')
        }
        if (isCurrentPartySender(item.currentPartyId, leg)) {
            directions.add('outgoing')
        }
    }

    const isAllocated = areCurrentPartySenderLegsAllocated(item)
    const status = isAllocated
        ? 'Allocated'
        : isExpired(item.expiry)
          ? 'Expired'
          : 'Action Required'

    return Array.from(directions).map((direction) => ({
        id: `${item.contractId}-${direction}`,
        source: item,
        direction,
        status,
    }))
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

function isCurrentPartyReceiver(
    currentPartyId: string,
    leg: TransferLegWithAllocation
) {
    return leg.transferLeg.receiver === currentPartyId
}
