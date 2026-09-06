// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PartyId } from '@canton-network/core-types'
import {
    ALLOCATION_INSTRUCTION_INTERFACE_ID,
    ALLOCATION_INTERFACE_ID,
    ALLOCATION_REQUEST_INTERFACE_ID,
    AllocationInstructionView,
    AllocationRequestView,
    AllocationView,
} from '@canton-network/core-token-standard'
import { PrettyContract } from '@canton-network/core-tx-parser'
import { PreparedCommand } from '../../transactions/types.js'
import {
    AllocationParams,
    AllocationInstructionCreateParams,
    AllocationContextParams,
    AllocationScanParams,
} from './types.js'
import { TokenNamespaceConfig } from '../../../sdk.js'
import { ParsedURL } from '../../utils/url.js'

export class AllocationNamespace {
    constructor(private readonly sdkContext: TokenNamespaceConfig) {}

    async pending<T = AllocationView>(
        partyId: PartyId,
        interfaceId = ALLOCATION_INTERFACE_ID
    ): Promise<PrettyContract<T>[]> {
        return await this.sdkContext.tokenStandardService.listContractsByInterface<T>(
            interfaceId,
            partyId
        )
    }

    /**
     * Polls {@link pending} until an allocation is visible for every requested
     * `transferLegId`, then returns each leg's allocation contract. Matching is
     * purely on `transferLegId`, so it is token-agnostic — the same call scans
     * for Amulet, TestToken, or any mix of allocations across a settlement.

     * @param params.partyId Party whose visible allocations are polled.
     * @param params.transferLegIds Transfer leg ids to wait for; every one must
     *   become visible for the call to resolve.
     * @param params.maxAttempts Maximum polling attempts before failing. Default 30.
     * @param params.retryIntervalMs Delay between attempts in ms. Default 1000.
     * @returns A map from `transferLegId` to its `PrettyContract<AllocationView>`.
     * @throws If any requested leg is still missing once attempts are exhausted.
     */
    async scan(
        params: AllocationScanParams
    ): Promise<Record<string, PrettyContract<AllocationView>>> {
        const {
            partyId,
            transferLegIds,
            maxAttempts = 30,
            retryIntervalMs = 1000,
        } = params
        const { logger } = this.sdkContext.commonCtx

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const allocations = await this.pending(partyId)

            const found: Record<string, PrettyContract<AllocationView>> = {}
            for (const legId of transferLegIds) {
                const match = allocations.find(
                    (a) =>
                        a.interfaceViewValue.allocation.transferLegId === legId
                )
                if (match) found[legId] = match
            }

            const missing = transferLegIds.filter((legId) => !(legId in found))
            if (missing.length === 0) {
                logger.info(
                    { partyId, transferLegIds },
                    'All requested allocations are visible'
                )
                return found
            }

            logger.info(
                { partyId, attempt, maxAttempts, missing },
                'Waiting for allocations to propagate'
            )
            await new Promise((resolve) => setTimeout(resolve, retryIntervalMs))
        }

        throw new Error(
            `Allocations for transfer legs [${transferLegIds.join(
                ', '
            )}] did not propagate to party ${partyId} in time`
        )
    }

    /**
     * Executes ExecuteTransferAllocation choice on an allocation instruction to execute the allocation
     * @param allocationCid Allocation contract ID
     * @param asset Asset details (used for registry URL and admin info)
     * @param prefetchedRegistryChoiceContext Optional choice context for offline signing
     * @returns Wrapped ExerciseCommand and disclosed contracts
     */
    async execute(params: AllocationParams) {
        const [command, disclosedConctracts] =
            await this.sdkContext.tokenStandardService.allocation.createExecuteTransferAllocation(
                params.allocationCid,
                params.asset.registryUrl.href,
                params.prefetchedRegistryChoiceContext
            )

        return [{ ExerciseCommand: command }, disclosedConctracts]
    }

    async withdraw(params: AllocationParams): Promise<PreparedCommand> {
        const [command, disclosedConctracts] =
            await this.sdkContext.tokenStandardService.allocation.createWithdrawAllocation(
                params.allocationCid,
                params.asset.registryUrl.href,
                params.prefetchedRegistryChoiceContext
            )

        return [{ ExerciseCommand: command }, disclosedConctracts]
    }

    async cancel(params: AllocationParams): Promise<PreparedCommand> {
        const [command, disclosedConctracts] =
            await this.sdkContext.tokenStandardService.allocation.createCancelAllocation(
                params.allocationCid,
                params.asset.registryUrl.href,
                params.prefetchedRegistryChoiceContext
            )

        return [{ ExerciseCommand: command }, disclosedConctracts]
    }

    context = {
        execute: async (params: AllocationContextParams) => {
            return this.sdkContext.tokenStandardService.allocation.fetchExecuteTransferChoiceContext(
                params.allocationCid,
                new ParsedURL(this.sdkContext.commonCtx, params.registryUrl)
                    .href
            )
        },
        withdraw: async (params: AllocationContextParams) => {
            return this.sdkContext.tokenStandardService.allocation.fetchWithdrawAllocationChoiceContext(
                params.allocationCid,
                new ParsedURL(this.sdkContext.commonCtx, params.registryUrl)
                    .href
            )
        },
        cancel: async (params: AllocationContextParams) => {
            return this.sdkContext.tokenStandardService.allocation.fetchCancelAllocationChoiceContext(
                params.allocationCid,
                new ParsedURL(this.sdkContext.commonCtx, params.registryUrl)
                    .href
            )
        },
    }

    instruction = {
        pending: async (
            partyId: PartyId
        ): Promise<PrettyContract<AllocationInstructionView>[]> => {
            return await this.pending(
                partyId,
                ALLOCATION_INSTRUCTION_INTERFACE_ID
            )
        },

        /**
         * Creates an allocation instruction (optionally using pre-fetched registry choice context)
         * @param allocationSpecification Allocation specification to request
         * @param instrumentId Identifier of the asset to allocate
         * @param registryUrl URL of the registry to use for the allocation
         * @param inputUtxos Optional specific UTXOs to consume; auto-selected if omitted
         * @param requestedAt Optional request timestamp (ISO string)
         * @param prefetchedRegistryChoiceContext Optional factory id + choice context to avoid a registry call
         * @returns Wrapped ExerciseCommand and disclosed contracts for submission
         */
        create: async (
            params: AllocationInstructionCreateParams
        ): Promise<PreparedCommand> => {
            try {
                const [exercise, disclosed] =
                    await this.sdkContext.tokenStandardService.allocation.createAllocationInstruction(
                        params.allocationSpecification,
                        params.asset.admin,
                        params.asset.registryUrl.href,
                        params.inputUtxos,
                        params.requestedAt,
                        params.prefetchedRegistryChoiceContext
                    )

                return [{ ExerciseCommand: exercise }, disclosed]
            } catch (error) {
                this.sdkContext.commonCtx.logger.error(
                    { error, params },
                    'Failed to create allocation instruction'
                )
                throw error
            }
        },

        withdraw: async (
            allocationInstructionCid: string
        ): Promise<PreparedCommand> => {
            const [command, dc] =
                await this.sdkContext.tokenStandardService.allocation.createWithdrawAllocationInstruction(
                    allocationInstructionCid
                )

            return [{ ExerciseCommand: command }, dc]
        },
    }

    request = {
        /**
         * Fetches all pending allocation requests
         * @returns a promise containing prettyContract for AllocationRequestView.
         */
        pending: async (
            partyId: PartyId
        ): Promise<PrettyContract<AllocationRequestView>[]> => {
            return await this.pending(partyId, ALLOCATION_REQUEST_INTERFACE_ID)
        },

        reject: async (
            allocationRequestCid: string,
            partyId: PartyId
        ): Promise<PreparedCommand> => {
            const [command, dc] =
                await this.sdkContext.tokenStandardService.allocation.createRejectAllocationRequest(
                    allocationRequestCid,
                    partyId
                )
            return [{ ExerciseCommand: command }, dc]
        },
        withdraw: async (
            allocationRequestCid: string
        ): Promise<PreparedCommand> => {
            const [command, dc] =
                await this.sdkContext.tokenStandardService.allocation.createWithdrawAllocationRequest(
                    allocationRequestCid
                )
            return [{ ExerciseCommand: command }, dc]
        },
    }
}
