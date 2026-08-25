// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, type Locator, type Page, test } from '@playwright/test'
import {
    createGatewayApi,
    connectGateway,
    createWalletGateway,
    fillAndSubmitTransfer,
    gotoConnect,
    gotoDashboard,
    openTransferDialog,
    openTransferOfferDialog,
    setupRegistry,
    switchWallet,
    tap,
    togglePreapproval,
} from './utils'

const BASE_URL = 'http://localhost:8081'
const AMULET_INSTRUMENT = 'Amulet (AMT)'
const HISTORY_TIMEOUT = 30_000

type ExpectedTransaction = {
    activity: string
    amount: string
    counterpartyHint?: string
}

// This flow includes taps, preapproval automation, a direct transfer, and an
// accepted transfer offer.
test.setTimeout(300_000)

const gotoWalletHistory = async (
    page: Page,
    walletId: string,
    walletHint: string
): Promise<void> => {
    await page.goto(
        `${BASE_URL}/dashboard/wallet/${encodeURIComponent(walletId)}`
    )

    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: walletHint })).toBeVisible({
        timeout: 10_000,
    })
    await expect(
        main.getByRole('heading', { name: 'Transaction History' })
    ).toBeVisible()
    await expect(
        main.getByRole('table', { name: 'Transaction history' })
    ).toBeVisible({ timeout: HISTORY_TIMEOUT })
}

const getTransactionRow = (
    page: Page,
    expected: ExpectedTransaction
): Locator => {
    const table = page.getByRole('table', { name: 'Transaction history' })
    let rows = table
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
        .filter({
            has: page.getByRole('cell', { name: 'Amulet', exact: true }),
        })

    if (expected.counterpartyHint) {
        rows = rows.filter({ hasText: expected.counterpartyHint })
    }

    return rows
}

const expectTransactionRow = async (
    page: Page,
    expected: ExpectedTransaction
): Promise<Locator> => {
    const row = getTransactionRow(page, expected)
    await expect(row).toHaveCount(1, { timeout: HISTORY_TIMEOUT })

    const cells = row.getByRole('cell')
    await expect(cells).toHaveCount(6)
    await expect(cells.nth(3)).toHaveText(/\S+/)
    await expect(cells.nth(4)).toHaveText(/\S+/)

    if (expected.counterpartyHint) {
        await expect(cells.nth(5)).toContainText(expected.counterpartyHint)
    } else {
        await expect(cells.nth(5)).toHaveText('N/A')
    }

    return row
}

const expectNoTransactionRow = async (
    page: Page,
    expected: ExpectedTransaction
): Promise<void> => {
    await expect(getTransactionRow(page, expected)).toHaveCount(0, {
        timeout: HISTORY_TIMEOUT,
    })
}

test('shows taps, direct transfers, and transfer offers for both parties', async ({
    page: dappPage,
}) => {
    const rnd = Math.floor(Math.random() * 100000)
    // Keep hints below CopyableIdentifier's truncation threshold so the
    // counterparty remains a stable, human-readable assertion target.
    const aliceHint = `a-${rnd}`
    const bobHint = `b-${rnd}`
    const wg = createWalletGateway(dappPage)

    // Scaffolding: both wallets are created through the wallet's API, so the UI
    // is only driven for what this test asserts (the history entries).
    const api = await createGatewayApi()
    const alice = await api.createWallet({
        partyHint: aliceHint,
        signingProvider: 'participant',
        primary: true,
    })
    const bob = await api.createWallet({
        partyHint: bobHint,
        signingProvider: 'participant',
    })

    await gotoConnect(dappPage)
    await connectGateway(wg)
    await setupRegistry(dappPage)

    // Both taps should appear as incoming history entries.
    await tap(dappPage, wg, '1000')
    await switchWallet(api, bob)
    await tap(dappPage, wg, '500')

    // Bob's preapproval makes Alice -> Bob a direct, one-step transfer.
    await togglePreapproval(dappPage, wg, {
        instrument: AMULET_INSTRUMENT,
        enabled: true,
    })
    await switchWallet(api, alice)
    await gotoDashboard(dappPage)
    await openTransferDialog(dappPage)
    await fillAndSubmitTransfer(dappPage, wg, {
        amount: '111',
        recipient: bob,
        message: `direct history ${Date.now()}`,
    })

    // Alice has no preapproval, so Bob -> Alice creates a transfer offer.
    await switchWallet(api, bob)
    await gotoDashboard(dappPage)
    await openTransferDialog(dappPage)
    const offerMessage = `offer history ${Date.now()}`
    await fillAndSubmitTransfer(dappPage, wg, {
        amount: '37',
        recipient: alice,
        message: offerMessage,
    })

    // Load Alice's history before accepting to verify the pending lifecycle
    // entry and exercise transaction-history cache invalidation on acceptance.
    await switchWallet(api, alice)
    await gotoWalletHistory(dappPage, alice, aliceHint)
    await expectTransactionRow(dappPage, {
        activity: 'Offer received ↘',
        amount: '+37',
        counterpartyHint: bobHint,
    })

    await gotoDashboard(dappPage)
    const offerDialog = await openTransferOfferDialog(dappPage, {
        amount: '37',
        message: offerMessage,
    })
    await wg.approveTransaction(() =>
        offerDialog.getByRole('button', { name: 'Accept' }).click()
    )

    // Alice: tap, outgoing direct transfer, and both offer lifecycle rows.
    await gotoWalletHistory(dappPage, alice, aliceHint)
    await expectTransactionRow(dappPage, {
        activity: 'DevNet tap',
        amount: '+1000',
    })
    await expectTransactionRow(dappPage, {
        activity: 'Transfer sent ↗',
        amount: '-111',
        counterpartyHint: bobHint,
    })
    await expectNoTransactionRow(dappPage, {
        activity: 'Offer sent ↗',
        amount: '-111',
        counterpartyHint: bobHint,
    })
    await expectTransactionRow(dappPage, {
        activity: 'Offer received ↘',
        amount: '+37',
        counterpartyHint: bobHint,
    })
    await expectTransactionRow(dappPage, {
        activity: 'Transfer received ↘',
        amount: '+37',
        counterpartyHint: bobHint,
    })

    // Direction tabs should filter the same wallet's history.
    const historyTabs = dappPage.getByRole('tablist', {
        name: 'Transaction history filter',
    })
    await historyTabs.getByRole('tab', { name: 'Sent' }).click()
    await expectTransactionRow(dappPage, {
        activity: 'Transfer sent ↗',
        amount: '-111',
        counterpartyHint: bobHint,
    })
    await expectNoTransactionRow(dappPage, {
        activity: 'DevNet tap',
        amount: '+1000',
    })

    await historyTabs.getByRole('tab', { name: 'Received' }).click()
    await expectTransactionRow(dappPage, {
        activity: 'DevNet tap',
        amount: '+1000',
    })
    await expectNoTransactionRow(dappPage, {
        activity: 'Transfer sent ↗',
        amount: '-111',
        counterpartyHint: bobHint,
    })

    // Bob: tap, incoming direct transfer, and both outgoing offer lifecycle
    // rows. Alice remains primary, proving history is scoped by walletId.
    await gotoWalletHistory(dappPage, bob, bobHint)
    await expect(
        dappPage.getByRole('button', { name: 'Transfer' })
    ).toBeDisabled()
    await expectTransactionRow(dappPage, {
        activity: 'DevNet tap',
        amount: '+500',
    })
    await expectTransactionRow(dappPage, {
        activity: 'Transfer received ↘',
        amount: '+111',
        counterpartyHint: aliceHint,
    })
    await expectNoTransactionRow(dappPage, {
        activity: 'Offer received ↘',
        amount: '+111',
        counterpartyHint: aliceHint,
    })
    await expectTransactionRow(dappPage, {
        activity: 'Offer sent ↗',
        amount: '-37',
        counterpartyHint: aliceHint,
    })
    await expectTransactionRow(dappPage, {
        activity: 'Transfer sent ↗',
        amount: '-37',
        counterpartyHint: aliceHint,
    })
})
