// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    ALLOCATION_INSTRUCTION_INTERFACE_ID_V2,
    ALLOCATION_INTERFACE_ID_V2,
    ALLOCATION_REQUEST_INTERFACE_ID_V2,
    AllocationInstructionView,
    AllocationView,
    AllocationRequestView,
} from '@canton-network/core-token-standard-v2'
import { TokenNamespaceConfig } from '../../namespace'
import type { PartyId } from '@canton-network/core-types'
import { PrettyContract } from '@canton-network/core-tx-parser'

export class AllocationNamespace {
    constructor(private readonly sdkContext: TokenNamespaceConfig) {}

    async pending<T = AllocationView>(
        partyId: PartyId,
        interfaceId = ALLOCATION_INTERFACE_ID_V2
    ): Promise<PrettyContract<T>[]> {
        return await this.sdkContext.tokenStandardService.listContractsByInterface<T>(
            interfaceId,
            partyId
        )
    }

    instruction = {
        pending: async (
            partyId: PartyId
        ): Promise<PrettyContract<AllocationInstructionView>[]> => {
            return await this.pending(
                partyId,
                ALLOCATION_INSTRUCTION_INTERFACE_ID_V2
            )
        },
    }

    request = {
        pending: async (
            partyId: PartyId
        ): Promise<PrettyContract<AllocationRequestView>[]> => {
            return await this.pending(
                partyId,
                ALLOCATION_REQUEST_INTERFACE_ID_V2
            )
        },
    }
}
