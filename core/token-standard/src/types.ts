// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Splice } from '@daml.js/token-standard-models-1.0.0'
import { PartyId } from '@canton-network/core-types'

export * from './interface-ids.const.js'

export const TransferInstructionV1 = Splice.Api.Token.TransferInstructionV1
export const AllocationInstructionV1 = Splice.Api.Token.AllocationInstructionV1
export const AllocationRequestV1 = Splice.Api.Token.AllocationRequestV1
export const AllocationV1 = Splice.Api.Token.AllocationV1
export const HoldingV1 = Splice.Api.Token.HoldingV1
export const MetadataV1 = Splice.Api.Token.MetadataV1

export type {
    Holding,
    HoldingView,
    Lock,
    InstrumentId,
    HoldingInterface,
} from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/HoldingV1/module.js'

export type {
    Transfer,
    TransferInstructionView,
    TransferInstruction_Accept,
    TransferInstruction_Reject,
    TransferInstruction_Withdraw,
    TransferInstruction_Update,
    TransferFactoryView,
    TransferFactory_PublicFetch,
    TransferFactory_Transfer,
    TransferInstructionResult,
    TransferInstructionResult_Output,
    TransferInstructionStatus,
    TransferFactoryInterface,
    TransferInstructionInterface,
} from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/TransferInstructionV1/module.js'

// Export companion objects as values (needed for accessing choice names at runtime)
export {
    TransferInstruction,
    TransferFactory,
} from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/TransferInstructionV1/module.js'

export type {
    AllocationFactory_Allocate,
    AllocationFactoryView,
    AllocationFactory_PublicFetch,
    AllocationInstruction_Update,
    AllocationInstruction_Withdraw,
    AllocationInstructionView,
    AllocationInstructionResult,
    AllocationInstructionResult_Output,
    AllocationFactoryInterface,
    AllocationInstructionInterface,
} from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/AllocationInstructionV1/module.js'

// Export companion objects as values (needed for accessing choice names at runtime)
export {
    AllocationFactory,
    AllocationInstruction,
} from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/AllocationInstructionV1/module.js'

export type {
    AllocationRequest,
    AllocationRequestView,
    AllocationRequest_Reject,
    AllocationRequest_Withdraw,
    AllocationRequestInterface,
} from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/AllocationRequestV1/module.js'

export type {
    AllocationSpecification,
    TransferLeg,
    SettlementInfo,
    Reference,
    AllocationView,
    AllocationInterface,
    Allocation_Withdraw,
    Allocation_Cancel,
    Allocation_ExecuteTransfer,
    Allocation_WithdrawResult,
    Allocation_CancelResult,
    Allocation_ExecuteTransferResult,
} from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/AllocationV1/module.js'

// Export companion object as value (needed for accessing choice names at runtime)
export { Allocation } from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/AllocationV1/module.js'

export type {
    ExtraArgs,
    Metadata,
    ChoiceExecutionMetadata,
    AnyContract,
    AnyContractInterface,
    AnyContractView,
    ChoiceContext,
    AnyValue,
} from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/MetadataV1/module.js'

export type Beneficiaries = {
    beneficiary: PartyId
    weight: number
}

// CIP-0112 (V2) companions and types — aliased to avoid colliding with V1 exports
export const TransferInstructionV2 = Splice.Api.Token.TransferInstructionV2
export const AllocationInstructionV2 = Splice.Api.Token.AllocationInstructionV2
export const AllocationRequestV2 = Splice.Api.Token.AllocationRequestV2
export const AllocationV2 = Splice.Api.Token.AllocationV2
export const HoldingV2 = Splice.Api.Token.HoldingV2
export const TransferEventsV2 = Splice.Api.Token.TransferEventsV2

export type {
    Account,
    HoldingView as HoldingViewV2,
    Holding as HoldingV2Contract,
    InstrumentId as InstrumentIdV2,
    Lock as LockV2,
} from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/HoldingV2/module.js'

export type {
    Transfer as TransferV2,
    TransferInstructionView as TransferInstructionViewV2,
    TransferInstruction_Accept as TransferInstruction_AcceptV2,
    TransferInstruction_Reject as TransferInstruction_RejectV2,
    TransferInstruction_Withdraw as TransferInstruction_WithdrawV2,
    TransferFactory_Transfer as TransferFactory_TransferV2,
    TransferInstructionResult as TransferInstructionResultV2,
} from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/TransferInstructionV2/module.js'

export {
    TransferInstruction as TransferInstructionV2Choice,
    TransferFactory as TransferFactoryV2Choice,
} from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/TransferInstructionV2/module.js'

export type {
    AllocationFactory_Allocate as AllocationFactory_AllocateV2,
    AllocationInstructionView as AllocationInstructionViewV2,
} from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/AllocationInstructionV2/module.js'

export {
    AllocationFactory as AllocationFactoryV2Choice,
    AllocationInstruction as AllocationInstructionV2Choice,
} from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/AllocationInstructionV2/module.js'

export type {
    AllocationSpecification as AllocationSpecificationV2,
    TransferLeg as TransferLegV2,
    TransferLegSide,
    SettlementInfo as SettlementInfoV2,
    AllocationView as AllocationViewV2,
    FinalizedAllocation,
    SettlementFactory_SettleBatch,
    Allocation_Withdraw as Allocation_WithdrawV2,
    Allocation_Cancel as Allocation_CancelV2,
} from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/AllocationV2/module.js'

export {
    Allocation as AllocationV2Choice,
    SettlementFactory as SettlementFactoryChoice,
} from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/AllocationV2/module.js'

export type {
    EventLog_HoldingsChange,
    EventLogView,
} from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/TransferEventsV2/module.js'

export { EventLog } from '@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/TransferEventsV2/module.js'

/** CIP-112 basic account equivalent to a plain Party owner (empty id, no provider). */
export function basicAccount(
    owner: PartyId
): import('@daml.js/token-standard-models-1.0.0/lib/Splice/Api/Token/HoldingV2/module.js').Account {
    return {
        owner: owner as string,
        provider: null,
        id: '',
    }
}
