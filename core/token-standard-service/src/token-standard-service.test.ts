// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest'
import { CoreService } from './token-standard-service.js'
import { PrettyContract } from '@canton-network/core-tx-parser'
import { HoldingView } from '@canton-network/core-token-standard'
import { Decimal } from 'decimal.js'

describe('getInputHoldingsCidsForAmount', async () => {
    const makeHolding = (
        id: string,
        amount: string,
        admin: string,
        instrumentId: string
    ) => ({
        contractId: id,
        interfaceViewValue: {
            owner: 'dummy',
            instrumentId: {
                admin: admin,
                id: instrumentId,
            },
            lock: null,
            meta: {
                values: {},
            },
            amount,
        },
        activeContract: {
            createdEvent: {
                offset: 1,
                nodeId: 1,
                contractId: id,
                templateId: 'holding tempalte id',
                createdEventBlob: 'blob',
                createdAt: 'time',
                packageName: 'name',
            },
            synchronizerId: 'blah',
            reassignmentCounter: 0,
        },
    })

    it('returns exact match', async () => {
        const holdings = [
            makeHolding('a', '200', 'partyId', 'amulet'),
            makeHolding('b', '20', 'partyId', 'amulet'),
            makeHolding('c', '30', 'partyId', 'amulet'),
        ]

        const result = await CoreService.getInputHoldingsCidsForAmount(
            new Decimal(20),
            holdings
        )

        expect(result).toEqual(['b'])
    })

    it('returns multiple holdings to meet target amount', async () => {
        const holdings = [
            makeHolding('b', '20', 'partyId', 'amulet'),
            makeHolding('a', '200', 'partyId', 'amulet'),
            makeHolding('c', '30', 'partyId', 'amulet'),
        ]

        const result = await CoreService.getInputHoldingsCidsForAmount(
            new Decimal(220),
            holdings
        )

        expect(result).toEqual(['a', 'b'])
    })

    it('returns all holdings to meet target amount even if it exceeds the target', async () => {
        const holdings = [
            makeHolding('a', '2', 'partyId', 'amulet'),
            makeHolding('b', '99', 'partyId', 'amulet'),
            makeHolding('c', '3', 'partyId', 'amulet'),
        ]

        const result = await CoreService.getInputHoldingsCidsForAmount(
            new Decimal(100),
            holdings
        )

        expect(result).toEqual(['b', 'a'])
    })

    it('should filter out holdings by instrument', async () => {
        const holdings = [
            makeHolding('a', '2', 'instrumentAdmin1', 'amulet'),
            makeHolding('b', '99', 'instrumentAdmin1', 'amulet'),
            makeHolding('c', '3', 'instrumentAdmin2', 'usdcx'),
        ]

        const usdcxHoldings = await CoreService.filterHoldingsByInstrument({
            holdings,
            instrumentAdmin: 'instrumentAdmin2',
            instrumentId: 'usdcx',
        })

        const amuletHoldings = await CoreService.filterHoldingsByInstrument({
            holdings,
            instrumentAdmin: 'instrumentAdmin1',
            instrumentId: 'amulet',
        })

        expect(usdcxHoldings.length).toBe(1)
        expect(amuletHoldings.length).toBe(2)
    })

    it('throws an error if no unlocked holdings exist', async () => {
        const holdings: PrettyContract<HoldingView>[] = []

        await expect(
            CoreService.getInputHoldingsCidsForAmount(
                new Decimal(220),
                holdings
            )
        ).rejects.toThrow(`Sender doesn't have any unlocked holdings`)
    })

    it('throws an error if there are insufficient funds', async () => {
        const holdings = [
            makeHolding('a', '5', 'partyId', 'amulet'),
            makeHolding('b', '10', 'partyId', 'amulet'),
        ]

        await expect(
            CoreService.getInputHoldingsCidsForAmount(new Decimal(20), holdings)
        ).rejects.toThrow(
            `Sender doesn't have sufficient funds for this transfer. Missing amount: 5`
        )
    })

    it('throws an error if it exceeds 100 utxos', async () => {
        const holdings = Array.from({ length: 101 }, (_, i) =>
            makeHolding(`id${i}`, '1', 'partyId', 'amulet')
        )

        await expect(
            CoreService.getInputHoldingsCidsForAmount(
                new Decimal(101),
                holdings
            )
        ).rejects.toThrow(`Exceeded the maximum of 100 utxos in 1 transaction`)
    })
})
