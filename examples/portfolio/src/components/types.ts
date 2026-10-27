// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PrettyContract } from '@canton-network/core-tx-parser'
import type {
    AllocationView,
    SettlementInfo,
    TransferLeg,
} from '@canton-network/core-token-standard'
import type {
    Account,
    TransferInstructionView as TransferInstructionViewV2,
} from '@canton-network/core-token-standard-v2'
import type { TokenStandardVersion } from '../types/instruments'

interface ActionItemBase {
    contractId: string
    currentPartyId: string
    expiry: string
}

export interface TransferActionItem extends ActionItemBase {
    kind: 'transfer'
    versions: TokenStandardVersion[]
    tag: string | undefined
    type: string
    date: string
    message: string
    sender: string
    receiver: string
    instrumentId: { admin: string; id: string }
    amount: string
    senderAccount?: Account
    receiverAccount?: Account
    availableActions?: TransferInstructionViewV2['availableActions']
}

export interface TransferLegWithAllocation {
    transferLegId: string
    transferLeg: TransferLeg
    allocations: PrettyContract<AllocationView>[]
}

// Allocation-specific action item (grouped by settlement)
export interface AllocationActionItem extends ActionItemBase {
    kind: 'allocation'
    settlement: SettlementInfo
    transferLegs: TransferLegWithAllocation[]
}

export type ActionItem = TransferActionItem | AllocationActionItem
