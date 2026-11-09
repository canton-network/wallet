// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    type AllocationRequestView as AllocationRequestViewV2,
    type AllocationView as AllocationViewV2,
    type AllocationInstructionView as AllocationInstructionViewV2,
    type AllocationSpecification,
    type ActionAvailability,
    actionAvailability,
    decodeAvailableActions,
} from '@canton-network/core-token-standard-v2'
import type { PrettyContract } from '@canton-network/core-tx-parser'
import type { PartyId } from '@canton-network/core-types'
import type {
    AllocationRequestV2ActionItem,
    AllocationV2ActionItem,
    AllocationInstructionV2ActionItem,
    ActionItem,
} from '@components/types'
import Decimal from 'decimal.js'

export const ownsAuthorizer = (
    spec: AllocationSpecification,
    partyId: PartyId
) => spec.authorizer.owner === partyId

export const earliest = (
    times: Array<string | null | undefined>
): string | null =>
    times
        .filter((t): t is string => !!t)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0] ??
    null

export function toAllocationRequestV2Items(
    contracts: PrettyContract<AllocationRequestViewV2>[],
    partyId: PartyId
): AllocationRequestV2ActionItem[] {
    return contracts.flatMap((c) => {
        const view = c.interfaceViewValue
        const ownSpecs = view.allocations.filter((a) =>
            ownsAuthorizer(a, partyId)
        )
        if (ownSpecs.length === 0) return []

        return [
            {
                kind: 'allocation-request-v2',
                contractId: c.contractId,
                currentPartyId: partyId,
                versions: ['v2'],
                settlement: view.settlement,
                requestedAt: view.requestedAt,
                settleAt: view.settleAt ?? null,
                expiry: earliest([
                    ...ownSpecs.map((s) => s.settlementDeadline),
                    view.settleAt,
                ]),
                ownSpecs,
                allSpecs: view.allocations,
                availableActions: view.availableActions,
                meta: view.meta,
            },
        ]
    })
}

export function toAllocationV2Items(
    contracts: PrettyContract<AllocationViewV2>[],
    partyId: PartyId
): AllocationV2ActionItem[] {
    return contracts
        .filter((c) => ownsAuthorizer(c.interfaceViewValue.allocation, partyId))
        .map((c) => {
            const view = c.interfaceViewValue
            return {
                kind: 'allocation-v2',
                contractId: c.contractId,
                currentPartyId: partyId,
                versions: ['v2'],
                settlement: view.settlement,
                allocation: view.allocation,
                holdingCids: view.holdingCids,
                createdAt: view.createdAt,
                expiresAt: view.expiresAt ?? null,
                expiry: earliest([
                    view.allocation.settlementDeadline,
                    view.expiresAt,
                ]),
                numIterations: Number(view.numIterations),
                availableActions: view.availableActions,
                meta: view.meta,
            }
        })
}

export function toAllocationInstructionV2Items(
    contracts: PrettyContract<AllocationInstructionViewV2>[],
    partyId: PartyId
): AllocationInstructionV2ActionItem[] {
    return contracts
        .filter((c) => ownsAuthorizer(c.interfaceViewValue.allocation, partyId))
        .map((c) => {
            const view = c.interfaceViewValue
            return {
                kind: 'allocation-instruction-v2',
                contractId: c.contractId,
                currentPartyId: partyId,
                versions: ['v2'],
                originalInstructionCid: view.originalInstructionCid ?? null,
                settlement: view.settlement,
                allocation: view.allocation,
                requestedAt: view.requestedAt,
                expiresAt: view.expiresAt ?? null,
                expiry: earliest([
                    view.allocation.settlementDeadline,
                    view.expiresAt,
                ]),
                availableActions: view.availableActions,
                meta: view.meta,
            }
        })
}

export function dropV1Duplicates<T extends { contractId: string }>(
    v1Items: T[],
    v2Items: ReadonlyArray<{ contractId: string }>
): T[] {
    const v2Cids = new Set(v2Items.map((i) => i.contractId))
    return v1Items.filter((i) => !v2Cids.has(i.contractId))
}

export interface InstrumentAmount {
    admin: string
    instrumentId: string
    amount: Decimal
}

const instrumentKey = (admin: string, instrumentId: string) =>
    JSON.stringify([admin, instrumentId])

function sumByInstrument(
    entries: Array<{ admin: string; instrumentId: string; amount: Decimal }>
): InstrumentAmount[] {
    const sums = new Map<string, InstrumentAmount>()
    for (const e of entries) {
        const key = instrumentKey(e.admin, e.instrumentId)
        const current = sums.get(key)
        sums.set(key, {
            admin: e.admin,
            instrumentId: e.instrumentId,
            amount: (current?.amount ?? new Decimal(0)).plus(e.amount),
        })
    }

    return [...sums.values()]
}

export function netAmounts(
    specs: AllocationSpecification[]
): InstrumentAmount[] {
    return sumByInstrument(
        specs.flatMap((spec) =>
            spec.transferLegSides.map((leg) => {
                const amount = new Decimal(leg.amount)
                return {
                    admin: spec.admin,
                    instrumentId: leg.instrumentId,
                    amount:
                        leg.side === 'SenderSide' ? amount.negated() : amount,
                }
            })
        )
    )
}

export function amountsToLock(
    specs: AllocationSpecification[]
): InstrumentAmount[] {
    return sumByInstrument(
        specs.flatMap((spec) => {
            const legs = spec.transferLegSides.map((leg) => {
                const amount = new Decimal(leg.amount)
                return {
                    admin: spec.admin,
                    instrumentId: leg.instrumentId,
                    amount:
                        leg.side === 'SenderSide' ? amount.negated() : amount,
                }
            })

            const nextIteration = Object.entries(
                spec.nextIterationFunding ?? {}
            ).map(([instrumentId, amount]) => ({
                admin: spec.admin,
                instrumentId,
                amount: new Decimal(amount),
            }))
            return [...legs, ...nextIteration]
        })
    ).filter((a) => a.amount.isPositive())
}

export function counterparties(specs: AllocationSpecification[]): string[] {
    return [
        ...new Set(
            specs.flatMap((s) =>
                s.transferLegSides.flatMap((leg) =>
                    leg.otherside.owner ? [leg.otherside.owner] : []
                )
            )
        ),
    ]
}

export type ActionWithAvailability<A extends string> = {
    action: A
} & ActionAvailability

function getActions<A extends string>(
    raw: unknown,
    byTag: Record<string, A | undefined>,
    order: readonly A[],
    party: PartyId
): ActionWithAvailability<A>[] {
    return decodeAvailableActions<{ tag: string }>(raw)
        .flatMap(([key, groups]): ActionWithAvailability<A>[] => {
            const action = byTag[key.tag]
            if (!action || groups.length === 0) return []
            return [{ action, ...actionAvailability(groups, party) }]
        })
        .filter(
            (a) =>
                a.status === 'available' ||
                a.groups.some((group) => group.includes(party))
        )
        .sort((a, b) => order.indexOf(a.action) - order.indexOf(b.action))
}

export type AllocationRequestAction = 'Accept' | 'Reject'
export const getAllocationRequestActions = (
    item: AllocationRequestV2ActionItem
) =>
    getActions<AllocationRequestAction>(
        item.availableActions,
        { ARA_Accept: 'Accept', ARA_Reject: 'Reject' },
        ['Accept', 'Reject'],
        item.currentPartyId
    )

export type AllocationInstructionAction = 'Accept' | 'Withdraw'
export const getAllocationInstructionActions = (
    item: AllocationInstructionV2ActionItem
) =>
    getActions<AllocationInstructionAction>(
        item.availableActions,
        { AIA_Accept: 'Accept', AIA_Withdraw: 'Withdraw' },
        ['Accept', 'Withdraw'],
        item.currentPartyId
    )

// only withdraw is a wallet action, settle/cancel belong to exectors
export type AllocationAction = 'Withdraw'
export const getAllocationActions = (item: AllocationV2ActionItem) =>
    getActions<AllocationAction>(
        item.availableActions,
        { AIA_Withdraw: 'Withdraw' },
        ['Withdraw'],
        item.currentPartyId
    )

const canAct = <A extends string>(
    actions: ActionWithAvailability<A>[],
    action: A
) => actions.some((a) => a.action === action && a.status === 'available')

export function needsUserAction(item: ActionItem): boolean {
    switch (item.kind) {
        case 'allocation-request-v2':
            return canAct(getAllocationRequestActions(item), 'Accept')
        case 'allocation-instruction-v2':
            return canAct(getAllocationInstructionActions(item), 'Accept')
        case 'allocation-v2':
            return false
        default:
            //V1 kinds/transfers behavior is unchanged
            return true
    }
}
