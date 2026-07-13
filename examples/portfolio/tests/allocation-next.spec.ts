// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { pino } from 'pino'
import { expect, type Page, test } from '@playwright/test'
import { OTCTrade } from '@canton-network/core-wallet-test-utils'
import {
    createWalletGateway,
    gotoConnect,
    setupRegistry,
    switchWallet,
    tapAndCreateAllocation,
} from './next-utils'

const BASE_URL = 'http://localhost:8081'
const HISTORY_TIMEOUT = 30_000

type ExpectedHistoryRow = {
    activity: string
    amount: string
    counterpartyHint: string
}

const gotoWalletHistory = async (
    page: Page,
    walletId: string,
    walletHint: string
): Promise<void> => {
    await page.goto(
        `${BASE_URL}/next/dashboard/wallet/${encodeURIComponent(walletId)}`
    )

    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: walletHint })).toBeVisible({
        timeout: 10_000,
    })
    await expect(
        main.getByRole('table', { name: 'Transaction history' })
    ).toBeVisible({ timeout: HISTORY_TIMEOUT })
}

const expectHistoryRow = async (
    page: Page,
    expected: ExpectedHistoryRow
): Promise<void> => {
    const row = page
        .getByRole('table', { name: 'Transaction history' })
        .getByRole('row')
        .filter({
            has: page.getByRole('cell', {
                name: expected.activity,
                exact: true,
            }),
        })
        .filter({
            has: page.getByRole('cell', {
                name: expected.amount,
                exact: true,
            }),
        })
        .filter({ hasText: expected.counterpartyHint.slice(0, 10) })

    await expect(row).toHaveCount(1, { timeout: HISTORY_TIMEOUT })
}

test.describe('OTC allocations', () => {
    // OTC setup includes multiple taps, allocations, and settlement.
    test.setTimeout(180_000)

    test('shows reservations and every settlement leg', async ({
        page: dappPage,
    }) => {
        const rnd = Math.floor(Math.random() * 100000)
        const wg = createWalletGateway(dappPage)

        await gotoConnect(dappPage)
        await wg.connect({ network: 'LocalNet' })

        const venueHint = `venue-${rnd}`
        const aliceHint = `alice-${rnd}`
        const bobHint = `bob-${rnd}`
        const charlieHint = `charlie-${rnd}`
        const venue = await wg.createWalletIfNotExists({
            partyHint: venueHint,
            signingProvider: 'participant',
        })
        const alice = await wg.createWalletIfNotExists({
            partyHint: aliceHint,
            signingProvider: 'participant',
        })
        const bob = await wg.createWalletIfNotExists({
            partyHint: bobHint,
            signingProvider: 'participant',
        })
        const charlie = await wg.createWalletIfNotExists({
            partyHint: charlieHint,
            signingProvider: 'participant',
        })

        await wg.setPrimaryWallet(alice)
        await setupRegistry(dappPage)

        const logger = pino({ name: 'otc-trade', level: 'info' })
        const otcTrade = new OTCTrade({
            logger,
            venue,
            alice,
            bob,
            charlie,
        })
        const otcTradeDetails = await otcTrade.setup()

        await tapAndCreateAllocation(dappPage, wg, '1000', 2)

        await switchWallet(dappPage, wg, bob)
        await tapAndCreateAllocation(dappPage, wg, '1000')

        await switchWallet(dappPage, wg, charlie)
        await tapAndCreateAllocation(dappPage, wg, '1000')

        await otcTrade.settle(otcTradeDetails)

        await gotoWalletHistory(dappPage, alice, aliceHint)
        await expectHistoryRow(dappPage, {
            activity: 'Allocation reserved',
            amount: '100',
            counterpartyHint: bobHint,
        })
        await expectHistoryRow(dappPage, {
            activity: 'Allocation reserved',
            amount: '50',
            counterpartyHint: charlieHint,
        })
        await expectHistoryRow(dappPage, {
            activity: 'Transfer sent ↗',
            amount: '-100',
            counterpartyHint: bobHint,
        })
        await expectHistoryRow(dappPage, {
            activity: 'Transfer received ↘',
            amount: '+20',
            counterpartyHint: bobHint,
        })
        await expectHistoryRow(dappPage, {
            activity: 'Transfer sent ↗',
            amount: '-50',
            counterpartyHint: charlieHint,
        })
        await expectHistoryRow(dappPage, {
            activity: 'Transfer received ↘',
            amount: '+80',
            counterpartyHint: charlieHint,
        })

        await gotoWalletHistory(dappPage, bob, bobHint)
        await expectHistoryRow(dappPage, {
            activity: 'Allocation reserved',
            amount: '20',
            counterpartyHint: aliceHint,
        })
        await expectHistoryRow(dappPage, {
            activity: 'Transfer received ↘',
            amount: '+100',
            counterpartyHint: aliceHint,
        })
        await expectHistoryRow(dappPage, {
            activity: 'Transfer sent ↗',
            amount: '-20',
            counterpartyHint: aliceHint,
        })

        await gotoWalletHistory(dappPage, charlie, charlieHint)
        await expectHistoryRow(dappPage, {
            activity: 'Allocation reserved',
            amount: '80',
            counterpartyHint: aliceHint,
        })
        await expectHistoryRow(dappPage, {
            activity: 'Transfer received ↘',
            amount: '+50',
            counterpartyHint: aliceHint,
        })
        await expectHistoryRow(dappPage, {
            activity: 'Transfer sent ↗',
            amount: '-80',
            counterpartyHint: aliceHint,
        })
    })
})
