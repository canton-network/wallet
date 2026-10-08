// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ContractId, Logger, PartyId } from '@canton-network/core-types'
import { CoreService } from '../core-service'
import {
    AllocationFactory_Allocate,
    AllocationSpecification,
    Holding,
    OffLedger,
    SettlementInfo,
    ALLOCATION_FACTORY_INTERFACE_ID_V2,
    SettlementFactory_SettleBatch as SettlementFactory_SettleBatchV2,
    ALLOCATION_INTERFACE_ID_V2,
    ALLOCATION_REQUEST_INTERFACE_ID_V2,
    ALLOCATION_INSTRUCTION_INTERFACE_ID_V2,
} from '@canton-network/core-token-standard-v2'
import {
    DisclosedContract,
    ExerciseCommand,
    REQUESTED_AT_SKEW_MS,
} from '../types'
import Decimal from 'decimal.js'

type AllocationChoiceContextV2 =
    OffLedger.AllocationInstructionV2.components['schemas']['ChoiceContext']

const EMPTY_EXTRA_ARGS = () => ({
    context: { values: {} },
    meta: { values: {} },
})

export class AllocationService {
    constructor(
        private core: CoreService,
        private readonly logger: Logger
    ) {}

    // sent - received + nextIterationFunding (amount per instrument Id that authorizer must fund)
    static fundingNeeds(spec: AllocationSpecification): Map<string, Decimal> {
        const needs = new Map<string, Decimal>()
        const add = (id: string, d: Decimal) =>
            needs.set(id, (needs.get(id) ?? new Decimal(0)).plus(d))

        for (const leg of spec.transferLegSides) {
            const amount = new Decimal(leg.amount)
            add(
                leg.instrumentId,
                leg.side === 'SenderSide' ? amount : amount.negated()
            )
        }

        for (const [id, amount] of Object.entries(
            spec.nextIterationFunding ?? {}
        )) {
            add(id, new Decimal(amount))
        }

        for (const [id, amount] of needs) if (amount.lte(0)) needs.delete(id)

        return needs
    }

    async buildAllocateChoiceArgs(opts: {
        settlement: SettlementInfo
        spec: AllocationSpecification
        admin: PartyId
        actors?: PartyId[]
        inputUtxos?: string[]
        excludeCids?: ReadonlySet<string>
        requestedAt?: string
    }): Promise<AllocationFactory_Allocate> {
        const { spec, admin } = opts
        let inputHoldingCids = opts.inputUtxos ?? []
        if (!opts.inputUtxos?.length) {
            const used = new Set(opts.excludeCids)
            inputHoldingCids = []
            for (const [instrumentId, amount] of AllocationService.fundingNeeds(
                spec
            )) {
                const cids = await this.core.getInputHoldingCidsForAccount({
                    account: spec.authorizer,
                    instrumentAdmin: admin,
                    instrumentId,
                    amount,
                })

                cids.forEach((c) => used.add(c))
                inputHoldingCids.push(...cids)
            }
        }

        if (!spec.authorizer.owner && !opts.actors) {
            throw new Error(
                'Ownerless authorizer account: actors must be provided explicitly'
            )
        }

        return {
            settlement: opts.settlement,
            allocation: opts.spec,
            requestedAt:
                opts.requestedAt ??
                new Date(Date.now() - REQUESTED_AT_SKEW_MS).toISOString(),
            inputHoldingCids:
                inputHoldingCids as unknown as ContractId<Holding>[],
            actors: opts.actors ?? [opts.spec.authorizer.owner!],
            extraArgs: EMPTY_EXTRA_ARGS(),
        }
    }

    async createAllocation(
        args: Parameters<AllocationService['buildAllocateChoiceArgs']>[0],
        registryUrl: URL,
        prefetched?: {
            factoryId: string
            choiceContext: AllocationChoiceContextV2
        }
    ): Promise<[ExerciseCommand, DisclosedContract[]]> {
        const choiceArgs = await this.buildAllocateChoiceArgs(args)

        const { factoryId, choiceContext } =
            prefetched ??
            (await this.core
                .getTokenStandardClientV2(registryUrl)
                .post(
                    '/registry/allocation-instruction/v2/allocation-factory',
                    {
                        choiceArguments: choiceArgs as unknown as Record<
                            string,
                            never
                        >,
                        excludeDebugFields: true,
                    }
                ))

        return this.createAllocationFromContext(
            factoryId,
            choiceArgs,
            choiceContext
        )
    }

    async fetchAllocationChoiceContext(
        action: 'withdraw' | 'cancel',
        allocationCid: string,
        registryUrl: URL
    ): Promise<AllocationChoiceContextV2> {
        return this.core.getTokenStandardClientV2(registryUrl).post(
            `/registry/allocations/v2/{allocationId}/choice-contexts/${action}`,
            {
                excludeDebugFields: true,
            },
            { path: { allocationId: allocationCid } }
        )
    }

    async createAllocationChoiceFromContext(
        action: 'withdraw' | 'cancel',
        allocationCid: string,
        actors: PartyId[],
        ctx: AllocationChoiceContextV2
    ): Promise<[ExerciseCommand, DisclosedContract[]]> {
        return [
            {
                templateId: ALLOCATION_INTERFACE_ID_V2,
                contractId: allocationCid,
                choice:
                    action == 'withdraw'
                        ? 'Allocation_Withdraw'
                        : 'Allocation_Cancel',
                choiceArgument: {
                    actors,
                    extraArgs: {
                        context: ctx.choiceContextData,
                        meta: { values: {} },
                    },
                },
            },
            ctx.disclosedContracts ?? [],
        ]
    }

    async createAllocationChoice(
        action: 'withdraw' | 'cancel',
        allocationCid: string,
        actors: PartyId[],
        registryUrl: URL,
        prefetched?: AllocationChoiceContextV2
    ): Promise<[ExerciseCommand, DisclosedContract[]]> {
        const ctx =
            prefetched ??
            (await this.fetchAllocationChoiceContext(
                action,
                allocationCid,
                registryUrl
            ))

        return this.createAllocationChoiceFromContext(
            action,
            allocationCid,
            actors,
            ctx
        )
    }

    createAllocationRequestChoice(
        action: 'withdraw' | 'reject',
        allocationRequestCid: string,
        actors: PartyId[]
    ): [ExerciseCommand, DisclosedContract[]] {
        const exercise: ExerciseCommand = {
            templateId: ALLOCATION_REQUEST_INTERFACE_ID_V2,
            contractId: allocationRequestCid,
            choice:
                action === 'reject'
                    ? 'AllocationRequest_Reject'
                    : 'AllocationRequest_Withdraw',
            choiceArgument: { actors, extraArgs: EMPTY_EXTRA_ARGS() }, //TODO: look at choice args in codegen
        }
        return [exercise, []]
    }

    createWithdrawAllocationInstruction(
        withdrawCid: string,
        actors: PartyId[]
    ): [ExerciseCommand, DisclosedContract[]] {
        const exercise: ExerciseCommand = {
            templateId: ALLOCATION_INSTRUCTION_INTERFACE_ID_V2,
            contractId: withdrawCid,
            choice: 'AllocationInstruction_Withdraw',
            choiceArgument: { actors, extraArgs: EMPTY_EXTRA_ARGS() }, //TODO: look at choice args in codegen
        }
        return [exercise, []]
    }

    async createAllocationFromContext(
        factoryId: string,
        choiceArgs: AllocationFactory_Allocate,
        choiceContext: OffLedger.AllocationInstructionV2.components['schemas']['ChoiceContext']
    ): Promise<[ExerciseCommand, DisclosedContract[]]> {
        this.logger.debug('Creating transfer from pre-fetched context...')
        choiceArgs.extraArgs.context = {
            ...choiceContext.choiceContextData,
            values: choiceContext.choiceContextData?.values ?? {},
        }
        const exercise: ExerciseCommand = {
            templateId: ALLOCATION_FACTORY_INTERFACE_ID_V2,
            contractId: factoryId,
            choice: 'AllocationFactory_Allocate',
            choiceArgument: choiceArgs,
        }
        return [exercise, choiceContext.disclosedContracts]
    }

    async fetchSettlementFactory(
        args: SettlementFactory_SettleBatchV2,
        registryUrl: URL
    ) {
        return this.core
            .getTokenStandardClientV2(registryUrl)
            .post('/registry/allocation/v2/settlement-factory', {
                choiceArguments: args as unknown as Record<string, never>,
                excludeDebugFields: true,
            })
    }
}
