// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import { alice, v1Contract, v2Contract } from './__tests__/fixtures.ts'
import { mergeHoldings } from './holdings.ts'

describe('mergeHoldings', () => {
    it('gives v1 holdings the owner basic account', () => {
        const [holding] = mergeHoldings(
            [v1Contract('cid-1', { owner: alice, amount: '10' })],
            []
        )

        expect(holding).toMatchObject({
            contractId: 'cid-1',
            account: { owner: alice, provider: null, id: '' },
            amount: '10',
            lock: null,
            createdAt: '2026-01-01T00:00:00.000Z',
        })
    })

    it('keeps one holding per contract id, the v2 view winning', () => {
        const account = { owner: alice, provider: 'bank::1220', id: 'acc' }
        const holdings = mergeHoldings(
            [
                v1Contract('cid-1', { owner: alice, amount: '10' }),
                v1Contract('cid-2', { owner: alice, amount: '5' }),
            ],
            [v2Contract('cid-1', { account, amount: '10' })]
        )

        expect(holdings.map((h) => h.contractId)).toEqual(['cid-1', 'cid-2'])
        expect(holdings[0].account).toEqual(account)
    })
})
