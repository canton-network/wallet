// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TransferActionItem, TransferLegWithAllocation } from './types'

export const isReceiver = (item: TransferActionItem) => {
    return item.currentPartyId === item.receiver
}

export const getCounterparty = (item: TransferActionItem) => {
    if (isReceiver(item)) {
        return { label: 'Sender', value: item.sender }
    }
    return { label: 'Receiver', value: item.receiver }
}

export const isSenderOfLeg = (
    currentPartyId: string,
    leg: TransferLegWithAllocation
) => {
    return currentPartyId === leg.transferLeg.sender
}

export const isReceiverOfLeg = (
    currentPartyId: string,
    leg: TransferLegWithAllocation
) => {
    return currentPartyId === leg.transferLeg.receiver
}
