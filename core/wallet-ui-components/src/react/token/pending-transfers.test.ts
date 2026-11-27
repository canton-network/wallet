// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TransferInstructionView } from '@canton-network/core-token-standard'
import { TokenStandardService } from '@canton-network/core-token-standard-service'
import type { TransferInstructionView as TransferInstructionViewV2 } from '@canton-network/core-token-standard-v2'
import type { PrettyContract } from '@canton-network/core-tx-parser'
import { describe, expect, it } from 'vitest'

import { alice, amulet, bob } from './__tests__/fixtures.ts'
import { basicAccount } from './holdings.ts'
import {
    canAct,
    incomingTransfers,
    outgoingTransfers,
    type PendingTransfer,
} from './pending-transfers.ts'

const times = {
    requestedAt: '2026-01-01T00:00:00.000Z',
    executeBefore: '2026-01-08T00:00:00.000Z',
}

const meta = (memo?: string) => ({
    values: memo ? { [TokenStandardService.MEMO_KEY]: memo } : {},
})

const v1 = (
    contractId: string,
    sender: string,
    receiver: string,
    memo?: string
) =>
    ({
        contractId,
        interfaceViewValue: {
            transfer: {
                sender,
                receiver,
                amount: '5',
                instrumentId: amulet,
                meta: meta(memo),
                ...times,
            },
        },
    }) as unknown as PrettyContract<TransferInstructionView>

const v2 = (
    contractId: string,
    sender: string,
    receiver: string,
    memo?: string
) =>
    ({
        contractId,
        interfaceViewValue: {
            transfer: {
                sender: basicAccount(sender),
                receiver: basicAccount(receiver),
                amount: '5',
                instrumentId: amulet,
                meta: meta(memo),
                ...times,
            },
        },
    }) as unknown as PrettyContract<TransferInstructionViewV2>

const pending = { amount: '5', instrumentId: amulet, ...times }

describe('outgoingTransfers', () => {
    it('lists only the transfers the party sent', () => {
        expect(
            outgoingTransfers(
                alice,
                [v1('sent-v1', alice, bob), v1('received-v1', bob, alice)],
                [v2('sent-v2', alice, bob), v2('received-v2', bob, alice)]
            )
        ).toEqual([
            {
                contractId: 'sent-v1',
                version: 'v1',
                sender: alice,
                receiver: bob,
                memo: '',
                ...pending,
            },
            {
                contractId: 'sent-v2',
                version: 'v2',
                sender: alice,
                receiver: bob,
                memo: '',
                ...pending,
            },
        ])
    })
})

describe('incomingTransfers', () => {
    it('lists the transfers the party receives once, with sender and memo', () => {
        expect(
            incomingTransfers(
                alice,
                [
                    v1('received-v1', bob, alice, 'rent'),
                    v1('both', bob, alice),
                    v1('sent-v1', alice, bob),
                ],
                [
                    v2('received-v2', bob, alice, 'lunch'),
                    v2('both', bob, alice),
                    v2('sent-v2', alice, bob),
                ]
            )
        ).toEqual([
            {
                contractId: 'received-v1',
                version: 'v1',
                sender: bob,
                receiver: alice,
                memo: 'rent',
                ...pending,
            },
            {
                contractId: 'both',
                version: 'v2',
                sender: bob,
                receiver: alice,
                memo: '',
                ...pending,
            },
            {
                contractId: 'received-v2',
                version: 'v2',
                sender: bob,
                receiver: alice,
                memo: 'lunch',
                ...pending,
            },
        ])
    })
})

describe('canAct', () => {
    it('lets the sender of a v1 transfer to itself withdraw', () => {
        expect(
            canAct(
                alice,
                {
                    contractId: 'self-v1',
                    version: 'v1',
                    instrumentId: amulet,
                    amount: '5',
                    sender: alice,
                    receiver: alice,
                    memo: '',
                    ...times,
                },
                'Withdraw'
            )
        ).toBe(true)
    })

    it('offers a v2 choice only when the party can take it alone', () => {
        const transfer = (
            sender: string,
            receiver: string,
            availableActions: unknown[]
        ): PendingTransfer => ({
            contractId: 'v2',
            version: 'v2',
            instrumentId: amulet,
            amount: '5',
            sender,
            receiver,
            memo: '',
            ...times,
            availableActions:
                availableActions as unknown as PendingTransfer['availableActions'],
        })
        const action = (tag: string, groups: string[][]) => [
            { tag, value: {} },
            groups,
        ]

        const sent = (...actions: unknown[]) => transfer(alice, bob, actions)
        expect(
            canAct(alice, sent(action('TIA_Withdraw', [[alice]])), 'Withdraw')
        ).toBe(true)
        expect(
            canAct(alice, sent(action('TIA_Accept', [[bob]])), 'Withdraw')
        ).toBe(false)
        expect(
            canAct(
                alice,
                sent(action('TIA_Withdraw', [[alice, bob]])),
                'Withdraw'
            )
        ).toBe(false)

        const received = (...actions: unknown[]) =>
            transfer(bob, alice, actions)
        const alone = received(
            action('TIA_Accept', [[alice]]),
            action('TIA_Reject', [[alice]])
        )
        expect(canAct(alice, alone, 'Accept')).toBe(true)
        expect(canAct(alice, alone, 'Reject')).toBe(true)
        const together = received(
            action('TIA_Accept', [[alice, bob]]),
            action('TIA_Reject', [[alice, bob]])
        )
        expect(canAct(alice, together, 'Accept')).toBe(false)
        expect(canAct(alice, together, 'Reject')).toBe(false)
    })
})
