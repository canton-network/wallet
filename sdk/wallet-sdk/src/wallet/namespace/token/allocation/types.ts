// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AssetBody } from '../../asset/index.js'
import {
    allocationInstructionRegistryTypes,
    AllocationSpecification,
    AllocationSpecificationV2,
    SettlementInfoV2,
    TokenApiVersionPreference,
} from '@canton-network/core-token-standard'
import { PartyId } from '@canton-network/core-types'

export type AllocationInstructionCreateParams = {
    allocationSpecification: AllocationSpecification
    asset: AssetBody
    inputUtxos?: string[]
    requestedAt?: string
    prefetchedRegistryChoiceContext?: {
        factoryId: string
        choiceContext: allocationInstructionRegistryTypes['schemas']['ChoiceContext']
    }
}

export type AllocationInstructionCreateParamsV2 = {
    allocation: AllocationSpecificationV2
    settlement: SettlementInfoV2
    asset: AssetBody
    actors: PartyId[]
    inputUtxos?: string[]
    requestedAt?: string
    apiVersion?: TokenApiVersionPreference
    prefetchedRegistryChoiceContext?: {
        factoryId: string
        choiceContext: allocationInstructionRegistryTypes['schemas']['ChoiceContext']
    }
}

export type AllocationParams = {
    allocationCid: string
    asset: AssetBody
    prefetchedRegistryChoiceContext?: allocationInstructionRegistryTypes['schemas']['ChoiceContext']
}

export type AllocationContextParams = {
    allocationCid: string
    registryUrl: URL | string
}

export type SettleBatchParams = {
    registryUrl: URL | string
    settlement: SettlementInfoV2
    transferLegs: import('@canton-network/core-token-standard').SettlementFactory_SettleBatch['transferLegs']
    allocations: import('@canton-network/core-token-standard').FinalizedAllocation[]
    actors: PartyId[]
    prefetchedRegistryChoiceContext?: {
        factoryId: string
        choiceContext: allocationInstructionRegistryTypes['schemas']['ChoiceContext']
    }
}

export type AllocationRequestAcceptParams = {
    allocationRequestCid: string
    actors: PartyId[]
    registryUrl: URL | string
    settlement: SettlementInfoV2
    allocations: AllocationSpecificationV2[]
    expectedAdmin: PartyId
    inputUtxos?: string[]
    requestedAt?: string
}

export type AllocationRequestRejectParams = {
    allocationRequestCid: string
    /** V1 single actor, or V2 actors list. */
    actors: PartyId | PartyId[]
}

export type AllocationRequestWithdrawParams = {
    allocationRequestCid: string
    /** When set, uses CIP-0112 V2 withdraw with actors. */
    actors?: PartyId[]
}
