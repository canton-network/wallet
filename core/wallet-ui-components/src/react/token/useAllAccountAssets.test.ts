// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { alice, amulet, bob, holding } from './__tests__/fixtures'
import { aggregateHoldings, getInstrumentKey } from './aggregate-holdings'
import { basicAccount } from './holdings'
import { toWalletBalances, type TokenWallet } from './useAllAccountAssets'

const carol = 'carol::1220'

describe('toWalletBalances', () => {
    it('sums the accounts of each wallet, primary wallet first, then by name', () => {
        const wallets = new Map<string, TokenWallet>([
            [alice, { partyId: alice, hint: 'zed', primary: true }],
            [bob, { partyId: bob, hint: 'bob', primary: false }],
        ])
        const asset = aggregateHoldings([
            holding('cid-1', { account: basicAccount(carol), amount: '1' }),
            holding('cid-2', { account: basicAccount(bob), amount: '2' }),
            holding('cid-3', { account: basicAccount(alice), amount: '3' }),
            holding('cid-4', {
                account: { owner: alice, provider: 'bank::1220', id: 'a' },
                amount: '4',
            }),
        ]).get(getInstrumentKey(amulet))

        const balances = toWalletBalances(asset!.accountBalances, wallets)

        expect(
            balances.map(({ id, walletName, isPrimary, amount, accounts }) => ({
                id,
                walletName,
                isPrimary,
                amount,
                accounts: accounts.length,
            }))
        ).toEqual([
            {
                id: alice,
                walletName: 'zed',
                isPrimary: true,
                amount: '7',
                accounts: 2,
            },
            {
                id: bob,
                walletName: 'bob',
                isPrimary: false,
                amount: '2',
                accounts: 1,
            },
            // A wallet the user doesn't list is named by its party id.
            {
                id: carol,
                walletName: carol,
                isPrimary: false,
                amount: '1',
                accounts: 1,
            },
        ])
    })
})
