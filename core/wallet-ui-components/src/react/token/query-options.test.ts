// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import { alice, bob, v1Contract, v2Contract } from './__tests__/fixtures.ts'
import type { TokenClient } from './client.ts'
import { holdingsQueryOptions } from './query-options.ts'

function clientWith({
    v1 = [],
    v2 = Promise.resolve([]),
}: {
    v1?: Awaited<ReturnType<TokenClient['token']['v1']['utxos']['list']>>
    v2?: ReturnType<TokenClient['token']['v2']['utxos']['list']>
}) {
    return {
        token: {
            v1: { utxos: { list: vi.fn().mockResolvedValue(v1) } },
            v2: { utxos: { list: vi.fn().mockReturnValue(v2) } },
        },
    } satisfies TokenClient
}

const fetchHoldings = (client: TokenClient) =>
    new QueryClient().fetchQuery(
        holdingsQueryOptions({ client, partyId: alice })
    )

describe('holdingsQueryOptions', () => {
    it('lists v1 and v2 holdings, locked ones included, and keeps the owned ones', async () => {
        const client = clientWith({
            v1: [
                v1Contract('cid-1', { owner: alice, amount: '1' }),
                v1Contract('cid-2', { owner: bob, amount: '2' }),
            ],
            v2: Promise.resolve([
                v2Contract('cid-3', {
                    account: { owner: alice, provider: null, id: '' },
                    amount: '3',
                }),
            ]),
        })

        const holdings = await fetchHoldings(client)

        expect(holdings.map((h) => h.contractId)).toEqual(['cid-1', 'cid-3'])
        const params = { partyId: alice, includeLocked: true }
        expect(client.token.v1.utxos.list).toHaveBeenCalledWith(params)
        expect(client.token.v2.utxos.list).toHaveBeenCalledWith(params)
    })

    it('shows the v1 holdings when the v2 read fails', async () => {
        const client = clientWith({
            v1: [v1Contract('cid-1', { owner: alice, amount: '1' })],
            v2: Promise.reject(new Error('TEMPLATES_OR_INTERFACES_NOT_FOUND')),
        })

        const holdings = await fetchHoldings(client)

        expect(holdings.map((h) => h.contractId)).toEqual(['cid-1'])
    })
})
