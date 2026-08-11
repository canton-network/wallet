// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PartyId } from '@canton-network/core-types'
import {
    ALLOCATION_INSTRUCTION_INTERFACE_ID,
    ALLOCATION_INSTRUCTION_INTERFACE_ID_V2,
    ALLOCATION_INTERFACE_ID,
    ALLOCATION_REQUEST_INTERFACE_ID,
    ALLOCATION_REQUEST_INTERFACE_ID_V2,
    AllocationInstructionView,
    AllocationRequestView,
    AllocationView,
} from '@canton-network/core-token-standard'
import { PrettyContract } from '@canton-network/core-tx-parser'
import { PreparedCommand } from '../../transactions/types.js'
import {
    AllocationParams,
    AllocationInstructionCreateParams,
    AllocationInstructionCreateParamsV2,
    AllocationContextParams,
    SettleBatchParams,
    AllocationRequestAcceptParams,
    AllocationRequestRejectParams,
    AllocationRequestWithdrawParams,
} from './types.js'
import { TokenNamespaceConfig } from '../../../sdk.js'
import { ParsedURL } from '../../utils/url.js'
import type { WrappedCommand } from '@canton-network/core-ledger-client-types'

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

    async withdraw(params: AllocationParams) {
        const [command, disclosedConctracts] =
            await this.sdkContext.tokenStandardService.allocation.createWithdrawAllocation(
                params.allocationCid,
                params.asset.registryUrl.href,
                params.prefetchedRegistryChoiceContext
            )

        return [{ ExerciseCommand: command }, disclosedConctracts]
    }

    async cancel(params: AllocationParams) {
        const [command, disclosedConctracts] =
            await this.sdkContext.tokenStandardService.allocation.createCancelAllocation(
                params.allocationCid,
                params.asset.registryUrl.href,
                params.prefetchedRegistryChoiceContext
            )

        return [{ ExerciseCommand: command }, disclosedConctracts]
    }

    /**
     * CIP-0112 SettlementFactory_SettleBatch — settle a batch of V2 allocations.
     */
    async settleBatch(params: SettleBatchParams): Promise<PreparedCommand> {
        const [command, disclosed] =
            await this.sdkContext.tokenStandardService.allocation.createSettleBatch(
                new ParsedURL(this.sdkContext.commonCtx, params.registryUrl)
                    .href,
                params.settlement,
                params.transferLegs,
                params.allocations,
                params.actors,
                params.prefetchedRegistryChoiceContext
            )
        return [{ ExerciseCommand: command }, disclosed]
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
            const [v1, v2] = await Promise.all([
                this.pending<AllocationInstructionView>(
                    partyId,
                    ALLOCATION_INSTRUCTION_INTERFACE_ID
                ),
                this.pending<AllocationInstructionView>(
                    partyId,
                    ALLOCATION_INSTRUCTION_INTERFACE_ID_V2
                ),
            ])
            const seen = new Set<string>()
            return [...v1, ...v2].filter((c) => {
                if (seen.has(c.contractId)) return false
                seen.add(c.contractId)
                return true
            })
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
            params:
                | AllocationInstructionCreateParams
                | AllocationInstructionCreateParamsV2
        ): Promise<PreparedCommand> => {
            try {
                if ('settlement' in params && 'allocation' in params) {
                    const [exercise, disclosed] =
                        await this.sdkContext.tokenStandardService.allocation.createAllocationInstructionV2(
                            params.allocation,
                            params.settlement,
                            params.asset.admin,
                            params.asset.registryUrl.href,
                            params.actors,
                            params.inputUtxos,
                            params.requestedAt,
                            params.prefetchedRegistryChoiceContext
                        )
                    return [{ ExerciseCommand: exercise }, disclosed]
                }

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
         * Fetches pending allocation requests (CIP-0056 V1 + CIP-0112 V2).
         */
        pending: async (
            partyId: PartyId
        ): Promise<PrettyContract<AllocationRequestView>[]> => {
            const [v1, v2] = await Promise.all([
                this.pending<AllocationRequestView>(
                    partyId,
                    ALLOCATION_REQUEST_INTERFACE_ID
                ),
                this.pending<AllocationRequestView>(
                    partyId,
                    ALLOCATION_REQUEST_INTERFACE_ID_V2
                ),
            ])
            const seen = new Set<string>()
            return [...v1, ...v2].filter((c) => {
                if (seen.has(c.contractId)) return false
                seen.add(c.contractId)
                return true
            })
        },

        /**
         * CIP-0112: create one Allocation per specification, then Accept
         * the AllocationRequest in the same prepared command set.
         */
        accept: async (
            params: AllocationRequestAcceptParams
        ): Promise<
            [
                WrappedCommand<'ExerciseCommand'>[],
                Awaited<
                    ReturnType<
                        typeof this.sdkContext.tokenStandardService.allocation.acceptAllocationRequestMultiSpec
                    >
                >[1],
            ]
        > => {
            const [commands, disclosed] =
                await this.sdkContext.tokenStandardService.allocation.acceptAllocationRequestMultiSpec(
                    {
                        allocationRequestCid: params.allocationRequestCid,
                        actors: params.actors,
                        registryUrl: new ParsedURL(
                            this.sdkContext.commonCtx,
                            params.registryUrl
                        ).href,
                        settlement: params.settlement,
                        allocations: params.allocations,
                        expectedAdmin: params.expectedAdmin,
                        ...(params.inputUtxos !== undefined
                            ? { inputUtxos: params.inputUtxos }
                            : {}),
                        ...(params.requestedAt !== undefined
                            ? { requestedAt: params.requestedAt }
                            : {}),
                    }
                )
            return [
                commands.map((command) => ({ ExerciseCommand: command })),
                disclosed,
            ]
        },

        reject: async (
            allocationRequestCidOrParams:
                string | AllocationRequestRejectParams,
            partyId?: PartyId
        ): Promise<PreparedCommand> => {
            if (typeof allocationRequestCidOrParams === 'string') {
                const [command, dc] =
                    await this.sdkContext.tokenStandardService.allocation.createRejectAllocationRequest(
                        allocationRequestCidOrParams,
                        partyId!
                    )
                return [{ ExerciseCommand: command }, dc]
            }

            const { allocationRequestCid, actors } =
                allocationRequestCidOrParams
            if (Array.isArray(actors)) {
                const [command, dc] =
                    await this.sdkContext.tokenStandardService.allocation.createRejectAllocationRequestV2(
                        allocationRequestCid,
                        actors
                    )
                return [{ ExerciseCommand: command }, dc]
            }

            const [command, dc] =
                await this.sdkContext.tokenStandardService.allocation.createRejectAllocationRequest(
                    allocationRequestCid,
                    actors
                )
            return [{ ExerciseCommand: command }, dc]
        },

        withdraw: async (
            allocationRequestCidOrParams:
                string | AllocationRequestWithdrawParams
        ): Promise<PreparedCommand> => {
            if (typeof allocationRequestCidOrParams === 'string') {
                const [command, dc] =
                    await this.sdkContext.tokenStandardService.allocation.createWithdrawAllocationRequest(
                        allocationRequestCidOrParams
                    )
                return [{ ExerciseCommand: command }, dc]
            }

            const { allocationRequestCid, actors } =
                allocationRequestCidOrParams
            if (actors?.length) {
                const [command, dc] =
                    await this.sdkContext.tokenStandardService.allocation.createWithdrawAllocationRequestV2(
                        allocationRequestCid,
                        actors
                    )
                return [{ ExerciseCommand: command }, dc]
            }

            const [command, dc] =
                await this.sdkContext.tokenStandardService.allocation.createWithdrawAllocationRequest(
                    allocationRequestCid
                )
            return [{ ExerciseCommand: command }, dc]
        },
    }
}
