// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    AllocationRequestView as AllocationRequestViewV2,
    AllocationView as AllocationViewV2,
    AllocationInstructionView as AllocationInstructionViewV2,
    AllocationSpecification,
} from '@canton-network/core-token-standard-v2'
import type { PrettyContract } from '@canton-network/core-tx-parser'
import type { PartyId } from '@canton-network/core-types'
import type {
    AllocationRequestV2ActionItem,
    AllocationV2ActionItem,
    AllocationInstructionV2ActionItem,
} from '@components/types'

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
