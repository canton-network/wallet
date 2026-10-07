// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    ALLOCATION_INSTRUCTION_INTERFACE_ID_V2,
    ALLOCATION_INTERFACE_ID_V2,
    ALLOCATION_REQUEST_INTERFACE_ID_V2,
    AllocationInstructionView,
    AllocationView,
    AllocationRequestView,
    SettlementInfo,
    AllocationSpecification,
} from '@canton-network/core-token-standard-v2'
import { TokenNamespaceConfig } from '../../namespace'
import type { PartyId } from '@canton-network/core-types'
import { PrettyContract } from '@canton-network/core-tx-parser'
import { PreparedCommand } from '../../../transactions/types.js'

type AllocatonInstrictonCreateParamsV2 = {
    settlement: SettlementInfo
    spec: AllocationSpecification
    admin: PartyId
    actors?: PartyId[]
    inputUtxos?: string[]
    excludeCids?: ReadonlySet<string>
    requestedAt?: string
}

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

        create: async (
            params: AllocatonInstrictonCreateParamsV2,
            registryURL: URL
        ): Promise<PreparedCommand> => {
            const [command, disclosedConctracts] =
                await this.sdkContext.tokenStandardService.v2.allocation.createAllocation(
                    params,
                    registryURL
                )
            return [{ ExerciseCommand: command }, disclosedConctracts]
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
