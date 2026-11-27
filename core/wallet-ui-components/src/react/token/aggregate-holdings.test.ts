// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import { alice, amulet, bob, holding, lockUntil } from './__tests__/fixtures.ts'
import {
    aggregateHoldings,
    enrichWithInstrumentInfo,
    getInstrumentKey,
    type TokenInstruments,
} from './aggregate-holdings.ts'
import { basicAccount } from './holdings.ts'

const now = new Date('2026-06-01T00:00:00.000Z')
const bank = 'bank::1220'

describe('aggregateHoldings', () => {
    it('sums the holdings of an instrument and counts the locked ones', () => {
        const aggregated = aggregateHoldings(
            [
                holding('cid-1', {
                    account: basicAccount(alice),
                    amount: '10.5',
                }),
                holding('cid-2', {
                    account: basicAccount(alice),
                    amount: '4',
                    lock: lockUntil(null),
                }),
            ],
            now
        )

        expect([...aggregated.keys()]).toEqual([getInstrumentKey(amulet)])
        expect(aggregated.get(getInstrumentKey(amulet))).toMatchObject({
            instrumentId: amulet,
            totalAmount: '14.5',
            lockedAmount: '4',
            availableAmount: '10.5',
            numOfHoldings: 2,
        })
    })

    it('counts a holding whose lock has expired as available', () => {
        const aggregated = aggregateHoldings(
            [
                holding('cid-1', {
                    account: basicAccount(alice),
                    amount: '3',
                    lock: lockUntil('2026-05-01T00:00:00.000Z'),
                }),
                holding('cid-2', {
                    account: basicAccount(alice),
                    amount: '2',
                    lock: lockUntil('2026-07-01T00:00:00.000Z'),
                }),
            ],
            now
        )

        expect(aggregated.get(getInstrumentKey(amulet))).toMatchObject({
            totalAmount: '5',
            lockedAmount: '2',
            availableAmount: '3',
        })
    })

    it('keeps instruments apart', () => {
        const other = { admin: amulet.admin, id: 'Other' }
        const aggregated = aggregateHoldings([
            holding('cid-1', { account: basicAccount(alice), amount: '1' }),
            holding('cid-2', {
                account: basicAccount(alice),
                amount: '2',
                instrumentId: other,
            }),
        ])

        expect(aggregated.get(getInstrumentKey(other))?.totalAmount).toBe('2')
        expect(aggregated.get(getInstrumentKey(amulet))?.totalAmount).toBe('1')
    })

    it('gives a balance per account, basic accounts first', () => {
        const aggregated = aggregateHoldings(
            [
                holding('cid-1', {
                    account: { owner: alice, provider: bank, id: 'b' },
                    amount: '1',
                }),
                holding('cid-2', {
                    account: { owner: alice, provider: bank, id: 'a' },
                    amount: '2',
                    lock: lockUntil(null),
                }),
                holding('cid-3', { account: basicAccount(bob), amount: '3' }),
                holding('cid-4', { account: basicAccount(bob), amount: '4' }),
            ],
            now
        )

        expect(
            aggregated.get(getInstrumentKey(amulet))?.accountBalances
        ).toEqual([
            {
                account: basicAccount(bob),
                isBasic: true,
                totalAmount: '7',
                lockedAmount: '0',
                availableAmount: '7',
            },
            {
                account: { owner: alice, provider: bank, id: 'a' },
                isBasic: false,
                totalAmount: '2',
                lockedAmount: '2',
                availableAmount: '0',
            },
            {
                account: { owner: alice, provider: bank, id: 'b' },
                isBasic: false,
                totalAmount: '1',
                lockedAmount: '0',
                availableAmount: '1',
            },
        ])
    })
})

describe('enrichWithInstrumentInfo', () => {
    const instruments: TokenInstruments = new Map([
        [
            amulet.admin,
            [{ id: 'Amulet', name: 'Amulet', symbol: 'AMT', decimals: 10 }],
        ],
    ])

    it('adds the name, symbol and decimals of a known instrument', () => {
        const [asset] = enrichWithInstrumentInfo(
            aggregateHoldings([
                holding('cid-1', { account: basicAccount(alice), amount: '1' }),
            ]),
            instruments
        )

        expect(asset.instrument).toEqual({
            name: 'Amulet',
            symbol: 'AMT',
            decimals: 10,
        })
    })

    it('leaves an unknown instrument without info', () => {
        const assets = enrichWithInstrumentInfo(
            aggregateHoldings([
                holding('cid-1', {
                    account: basicAccount(alice),
                    amount: '1',
                    instrumentId: { admin: amulet.admin, id: 'Unknown' },
                }),
                holding('cid-2', {
                    account: basicAccount(alice),
                    amount: '1',
                    instrumentId: { admin: 'other::1220', id: 'Amulet' },
                }),
            ]),
            instruments
        )

        expect(assets.map((asset) => asset.instrument)).toEqual([
            undefined,
            undefined,
        ])
    })
})
