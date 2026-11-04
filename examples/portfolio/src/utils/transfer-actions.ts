// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    actionAvailability,
    decodeAvailableActions,
    type TransferInstructionAction,
    type ActionAvailability,
} from '@canton-network/core-token-standard-v2'
import type { PartyId } from '@canton-network/core-types'
import type { TransferActionItem } from '@components/types'

export type TransferAction = 'Accept' | 'Reject' | 'Withdraw'

export const TRANSFER_ACTIONS: readonly TransferAction[] = [
    'Accept',
    'Reject',
    'Withdraw',
]

const ACTION_BY_TAG: Record<
    TransferInstructionAction['tag'],
    TransferAction | undefined
> = {
    TIA_Accept: 'Accept',
    TIA_Reject: 'Reject',
    TIA_Withdraw: 'Withdraw',
    TIA_Custom: undefined,
}

const ORDER: TransferAction[] = ['Accept', 'Reject', 'Withdraw']

export type TransferActionAvailability = {
    action: TransferAction
} & ActionAvailability

export function getTransferActions(
    item: TransferActionItem
): TransferActionAvailability[] {
    const party: PartyId = item.currentPartyId

    //v1 offers, act as current party
    if (!item.availableActions) {
        const actions: TransferAction[] =
            item.receiver === party
                ? ['Accept', 'Reject']
                : item.sender === party
                  ? ['Withdraw']
                  : []

        return actions.map((action) => ({
            action,
            status: 'available',
            actors: [party],
        }))
    }

    return decodeAvailableActions<TransferInstructionAction>(
        item.availableActions
    )
        .flatMap(([key, groups]): TransferActionAvailability[] => {
            const action = ACTION_BY_TAG[key.tag]
            if (!action || groups.length === 0) return []
            return [{ action, ...actionAvailability(groups, party) }]
        })
        .filter(
            (a) =>
                a.status === 'available' ||
                a.groups.some((group) => group.includes(party))
        )
        .sort((a, b) => ORDER.indexOf(a.action) - ORDER.indexOf(b.action))
}
