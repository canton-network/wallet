// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TransferInstructionView } from '@canton-network/core-token-standard'
import type { TransferInstructionView as TransferInstructionViewV2 } from '@canton-network/core-token-standard-v2'
import type { PrettyContract } from '@canton-network/core-tx-parser'
import { describe, expect, it } from 'vitest'

import { alice, amulet, bob } from './__tests__/fixtures.ts'
import { basicAccount } from './holdings.ts'
import {
    canWithdraw,
    type OutgoingTransfer,
    outgoingTransfers,
} from './outgoing-transfers.ts'

const times = {
    requestedAt: '2026-01-01T00:00:00.000Z',
    executeBefore: '2026-01-08T00:00:00.000Z',
}

const v1 = (contractId: string, sender: string, receiver: string) =>
    ({
        contractId,
        interfaceViewValue: {
            transfer: {
                sender,
                receiver,
                amount: '5',
                instrumentId: amulet,
                ...times,
            },
        },
    }) as unknown as PrettyContract<TransferInstructionView>

const v2 = (contractId: string, sender: string, receiver: string) =>
    ({
        contractId,
        interfaceViewValue: {
            transfer: {
                sender: basicAccount(sender),
                receiver: basicAccount(receiver),
                amount: '5',
                instrumentId: amulet,
                ...times,
            },
        },
    }) as unknown as PrettyContract<TransferInstructionViewV2>

describe('outgoingTransfers', () => {
    it('lists only the transfers the party sent', () => {
        const sent = { amount: '5', instrumentId: amulet, ...times }

        expect(
            outgoingTransfers(
                alice,
                [v1('sent-v1', alice, bob), v1('received-v1', bob, alice)],
                [v2('sent-v2', alice, bob), v2('received-v2', bob, alice)]
            )
        ).toEqual([
            { contractId: 'sent-v1', version: 'v1', receiver: bob, ...sent },
            { contractId: 'sent-v2', version: 'v2', receiver: bob, ...sent },
        ])
    })
})

describe('canWithdraw', () => {
    it('lets the sender withdraw a v1 transfer to itself', () => {
        expect(
            canWithdraw(alice, {
                contractId: 'self-v1',
                version: 'v1',
                instrumentId: amulet,
                amount: '5',
                receiver: alice,
                ...times,
            })
        ).toBe(true)
    })

    it('refuses a v2 transfer that doesn’t offer the sender a withdrawal', () => {
        const transfer = (availableActions: unknown[]): OutgoingTransfer => ({
            contractId: 'sent-v2',
            version: 'v2',
            instrumentId: amulet,
            amount: '5',
            receiver: bob,
            ...times,
            availableActions:
                availableActions as unknown as OutgoingTransfer['availableActions'],
        })
        const action = (tag: string, groups: string[][]) => [
            { tag, value: {} },
            groups,
        ]

        expect(
            canWithdraw(alice, transfer([action('TIA_Withdraw', [[alice]])]))
        ).toBe(true)
        expect(
            canWithdraw(alice, transfer([action('TIA_Accept', [[bob]])]))
        ).toBe(false)
        expect(
            canWithdraw(
                alice,
                transfer([action('TIA_Withdraw', [[alice, bob]])])
            )
        ).toBe(false)
    })
})
