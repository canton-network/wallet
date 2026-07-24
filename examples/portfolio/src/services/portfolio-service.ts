// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PartyId } from '@canton-network/core-types'
import type { PrettyContract } from '@canton-network/core-tx-parser'
import type {
    AllocationInstructionView,
    AllocationRequestView,
    AllocationSpecification,
    AllocationView,
} from '@canton-network/core-token-standard'

// PortfolioService is a fat interface that tries to capture everything our
// portflio can do.  Separating the interface from the implementation will
// hopefully help us when we port the codebase to use web components instead
// of react.
export interface PortfolioService {
    // Allocations
    listAllocationRequests: (_: {
        party: PartyId
    }) => Promise<PrettyContract<AllocationRequestView>[]>
    createAllocation: (_: {
        registryUrls: ReadonlyMap<PartyId, string>
        party: PartyId // Party creating the allocation, not necessarily the sender or receiver
        allocationSpecification: AllocationSpecification
    }) => Promise<void>
    listAllocations: (_: {
        party: PartyId
    }) => Promise<PrettyContract<AllocationView>[]>
    withdrawAllocation: (_: {
        registryUrls: ReadonlyMap<PartyId, string>
        party: PartyId
        contractId: string
        instrumentId: { admin: string; id: string }
    }) => Promise<void>
    listAllocationInstructions: (_: {
        party: PartyId
    }) => Promise<PrettyContract<AllocationInstructionView>[]>

    // Network info
    isDevNet: (_: {
        sessionToken: string
        validatorUrl: string
    }) => Promise<boolean>

    // Tap
    tap: (_: {
        registryUrls: ReadonlyMap<PartyId, string>
        party: string
        sessionToken: string
        validatorUrl: string
        instrumentId: { admin: string; id: string }
        amount: number
    }) => Promise<void>
}
