// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react'
import type {
    ActionItem,
    AllocationActionItem,
    AllocationInstructionV2ActionItem,
    AllocationRequestV2ActionItem,
    AllocationV2ActionItem,
    TransferActionItem,
} from '@components/types'
import { isExpired } from '@utils/date-format'
import { useOfferItems, type OfferItemsResult } from './useOfferItems'
import {
    getAllocationRequestActions,
    needsUserAction,
} from '@utils/v2-allocation-items'

export type OfferDirection = 'incoming' | 'outgoing'
export type OfferCategory = 'transfers' | 'allocations'
export type OfferStatus =
    | 'Pending'
    | 'Action Required'
    | 'Partially Allocated'
    | 'Allocated'
    | 'Expired'
    | 'Awaiting Settlement'
    | 'Awaiting Approval'

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

export type AllocationV2OfferItem = {
    id: string
    source: AllocationV2ActionItem
    status: OfferStatus
}

export type AllocationRequestV2OfferItem = {
    id: string
    source: AllocationRequestV2ActionItem
    status: OfferStatus
}

export type AllocationInstructionV2OfferItem = {
    id: string
    source: AllocationInstructionV2ActionItem
    status: OfferStatus
}

export type OfferItem =
    | TransferOfferItem
    | AllocationOfferItem
    | AllocationV2OfferItem
    | AllocationRequestV2OfferItem
    | AllocationInstructionV2OfferItem

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
                (offer) => offer.source.kind !== 'transfer' //all allocations, v1 and v2
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
        switch (item.kind) {
            case 'transfer':
                const offer = deriveTransferOffer(item)
                if (offer) offers.push(offer)
                break
            case 'allocation':
                offers.push(deriveAllocationOffer(item))
                break
            case 'allocation-instruction-v2':
                offers.push({
                    id: `${item.contractId}-allocation-instruction-v2`,
                    source: item,
                    status: needsUserAction(item)
                        ? 'Action Required'
                        : 'Awaiting Approval',
                })
                break
            case 'allocation-request-v2':
                offers.push({
                    id: `${item.contractId}-allocation-request-v2`,
                    source: item,
                    status: deriveAllocationRequestV2Status(item),
                })
                break
            case 'allocation-v2':
                offers.push({
                    id: `${item.contractId}-allocation-v2`,
                    source: item,
                    status: isPast(item.expiry)
                        ? 'Expired'
                        : 'Awaiting Settlement',
                })
                break
            default: {
                const unhandled: never = item
                throw new Error(
                    `Unhandled offer item: ${JSON.stringify(unhandled)}`
                )
            }
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
    return {
        id: `${item.contractId}-allocation`,
        source: item,
        status: deriveAllocationStatus(item),
    }
}

function deriveAllocationStatus(item: AllocationActionItem): OfferStatus {
    const senderLegs = item.transferLegs.filter(
        (leg) => leg.transferLeg.sender === item.currentPartyId
    )
    const allocatedSenderLegCount = senderLegs.filter(
        (leg) => leg.allocations.length > 0
    ).length

    if (
        senderLegs.length === 0 ||
        allocatedSenderLegCount === senderLegs.length
    ) {
        return 'Allocated'
    }
    if (allocatedSenderLegCount > 0) return 'Partially Allocated'
    if (isExpired(item.expiry)) return 'Expired'
    return 'Action Required'
}

const isPast = (expiry: string | null) => expiry !== null && isExpired

function deriveAllocationRequestV2Status(
    item: AllocationRequestV2ActionItem
): OfferStatus {
    if (isPast(item.expiry)) return 'Expired'
    const accept = getAllocationRequestActions(item).find(
        (a) => a.action === 'Accept'
    )
    if (accept?.status === 'available') return 'Action Required'
    return 'Pending'
}
