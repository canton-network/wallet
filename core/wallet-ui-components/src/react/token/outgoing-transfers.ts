// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TransferInstructionView } from '@canton-network/core-token-standard'
import type { TransferInstructionView as TransferInstructionViewV2 } from '@canton-network/core-token-standard-v2'
import type { PrettyContract } from '@canton-network/core-tx-parser'

import type { TokenStandardVersion } from './client.ts'
import { getTransferActions } from './transfer-actions.ts'

export interface OutgoingTransfer {
    contractId: string
    /** The version to act through: v2 when the contract implements it. */
    version: TokenStandardVersion
    instrumentId: { admin: string; id: string }
    amount: string
    receiver: string
    requestedAt: string
    executeBefore: string
    availableActions?: TransferInstructionViewV2['availableActions'] | undefined
}

/**
 * The pending transfers `partyId` sent. A contract that implements both
 * versions is listed once.
 */
export function outgoingTransfers(
    partyId: string,
    v1: readonly PrettyContract<TransferInstructionView>[],
    v2: readonly PrettyContract<TransferInstructionViewV2>[]
): OutgoingTransfer[] {
    const byContract = new Map<string, OutgoingTransfer>()
    for (const { contractId, interfaceViewValue } of v1) {
        const { transfer } = interfaceViewValue
        if (transfer.sender !== partyId) continue
        byContract.set(contractId, {
            contractId,
            version: 'v1',
            instrumentId: transfer.instrumentId,
            amount: transfer.amount,
            receiver: transfer.receiver,
            requestedAt: transfer.requestedAt,
            executeBefore: transfer.executeBefore,
        })
    }
    for (const { contractId, interfaceViewValue } of v2) {
        const { transfer } = interfaceViewValue
        if (transfer.sender.owner !== partyId) continue
        byContract.set(contractId, {
            contractId,
            version: 'v2',
            instrumentId: transfer.instrumentId,
            amount: transfer.amount,
            receiver: transfer.receiver.owner ?? '',
            requestedAt: transfer.requestedAt,
            executeBefore: transfer.executeBefore,
            availableActions: interfaceViewValue.availableActions,
        })
    }
    return [...byContract.values()]
}

/**
 * Whether `partyId`, the sender, can withdraw `transfer` alone. A v2
 * transfer says which actions it allows and who must act.
 */
export function canWithdraw(
    partyId: string,
    transfer: OutgoingTransfer
): boolean {
    return getTransferActions({
        currentPartyId: partyId,
        versions: [transfer.version],
        sender: partyId,
        receiver: transfer.receiver,
        availableActions: transfer.availableActions,
    }).some(
        ({ action, status }) => action === 'Withdraw' && status === 'available'
    )
}
