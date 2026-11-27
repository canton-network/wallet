// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TransferInstructionView } from '@canton-network/core-token-standard'
import type { TransferInstructionView as TransferInstructionViewV2 } from '@canton-network/core-token-standard-v2'
import type { PrettyContract } from '@canton-network/core-tx-parser'

import type { TokenStandardVersion } from './client.ts'
import { getTransferActions, type TransferAction } from './transfer-actions.ts'

// `TokenStandardService.MEMO_KEY`. Importing the service for it would add
// about 140 kB to the extension popup.
const MEMO_KEY = 'splice.lfdecentralizedtrust.org/reason'

export interface PendingTransfer {
    contractId: string
    /** The version to act through: v2 when the contract implements it. */
    version: TokenStandardVersion
    instrumentId: { admin: string; id: string }
    amount: string
    sender: string
    receiver: string
    /** `''` when the transfer has none. */
    memo: string
    requestedAt: string
    executeBefore: string
    availableActions?: TransferInstructionViewV2['availableActions'] | undefined
}

export type OutgoingTransfer = PendingTransfer
export type IncomingTransfer = PendingTransfer

/** Outgoing: `partyId` is the sender. Incoming: the receiver. */
export type TransferDirection = 'outgoing' | 'incoming'

/**
 * The pending transfers `partyId` sent or receives. A contract that
 * implements both versions is listed once.
 */
export function pendingTransfers(
    partyId: string,
    direction: TransferDirection,
    v1: readonly PrettyContract<TransferInstructionView>[],
    v2: readonly PrettyContract<TransferInstructionViewV2>[]
): PendingTransfer[] {
    const byContract = new Map<string, PendingTransfer>()
    for (const { contractId, interfaceViewValue } of v1) {
        const { transfer } = interfaceViewValue
        byContract.set(contractId, {
            contractId,
            version: 'v1',
            instrumentId: transfer.instrumentId,
            amount: transfer.amount,
            sender: transfer.sender,
            receiver: transfer.receiver,
            memo: transfer.meta?.values?.[MEMO_KEY] ?? '',
            requestedAt: transfer.requestedAt,
            executeBefore: transfer.executeBefore,
        })
    }
    for (const { contractId, interfaceViewValue } of v2) {
        const { transfer } = interfaceViewValue
        byContract.set(contractId, {
            contractId,
            version: 'v2',
            instrumentId: transfer.instrumentId,
            amount: transfer.amount,
            sender: transfer.sender.owner ?? '',
            receiver: transfer.receiver.owner ?? '',
            memo: transfer.meta?.values?.[MEMO_KEY] ?? '',
            requestedAt: transfer.requestedAt,
            executeBefore: transfer.executeBefore,
            availableActions: interfaceViewValue.availableActions,
        })
    }
    const party = direction === 'outgoing' ? 'sender' : 'receiver'
    return [...byContract.values()].filter(
        (transfer) => transfer[party] === partyId
    )
}

export const outgoingTransfers = (
    partyId: string,
    v1: readonly PrettyContract<TransferInstructionView>[],
    v2: readonly PrettyContract<TransferInstructionViewV2>[]
): OutgoingTransfer[] => pendingTransfers(partyId, 'outgoing', v1, v2)

export const incomingTransfers = (
    partyId: string,
    v1: readonly PrettyContract<TransferInstructionView>[],
    v2: readonly PrettyContract<TransferInstructionViewV2>[]
): IncomingTransfer[] => pendingTransfers(partyId, 'incoming', v1, v2)

/**
 * Whether `partyId` can take `action` on `transfer` alone. A v2 transfer
 * says which actions it allows and who must act.
 */
export function canAct(
    partyId: string,
    transfer: PendingTransfer,
    action: TransferAction
): boolean {
    // The shared rule would offer a v1 self-transfer's sender only Accept and
    // Reject, but the sender can always withdraw.
    if (transfer.version === 'v1') {
        return action === 'Withdraw'
            ? transfer.sender === partyId
            : transfer.receiver === partyId
    }
    return getTransferActions({
        currentPartyId: partyId,
        versions: [transfer.version],
        sender: transfer.sender,
        receiver: transfer.receiver,
        availableActions: transfer.availableActions,
    }).some((item) => item.action === action && item.status === 'available')
}
