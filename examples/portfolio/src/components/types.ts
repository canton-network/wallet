// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PrettyContract } from '@canton-network/core-tx-parser'
import type {
    AllocationView,
    SettlementInfo,
    TransferLeg,
} from '@canton-network/core-token-standard'
import type {
    AllocationSpecification,
    AllocationView as AllocationViewV2,
    SettlementInfo as SettlementInfoV2,
    Account,
    TransferInstructionView as TransferInstructionViewV2,
    AllocationRequestView as AllocationRequestViewV2,
    AllocationInstruction,
} from '@canton-network/core-token-standard-v2'
import type { TokenStandardVersion } from '../types/instruments'

interface ActionItemBase {
    contractId: string
    currentPartyId: string
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
    expiry: string
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
    expiry: string
}

export type ActionItem =
    | TransferActionItem
    | AllocationActionItem
    | AllocationRequestV2ActionItem
    | AllocationV2ActionItem
    | AllocationInstructionV2ActionItem

export interface AllocationRequestV2ActionItem extends ActionItemBase {
    kind: 'allocation-request-v2'
    versions: TokenStandardVersion[]
    settlement: SettlementInfoV2
    requestedAt: string
    settleAt: string | null
    ownSpecs: AllocationSpecification[]
    allSpecs: AllocationSpecification[]
    availableActions: AllocationRequestViewV2['availableActions']
    meta: AllocationRequestViewV2['meta']
    expiry: string | null
}

export interface AllocationV2ActionItem extends ActionItemBase {
    kind: 'allocation-v2'
    versions: TokenStandardVersion[]
    settlement: SettlementInfoV2
    allocation: AllocationSpecification
    holdingCids: string[]
    createdAt: string
    expiresAt: string | null
    numIterations: number
    availableActions: AllocationViewV2['availableActions']
    meta: AllocationViewV2['meta']
    expiry: string | null
}

export interface AllocationInstructionV2ActionItem extends ActionItemBase {
    kind: 'allocation-instruction-v2'
    versions: TokenStandardVersion[]
    settlement: SettlementInfoV2
    originalInstructionCid: string | null
    allocation: AllocationSpecification
    requestedAt: string
    expiresAt: string | null
    availableActions: AllocationInstruction['availableActions']
    meta: AllocationInstruction['meta']
    expiry: string | null
}
