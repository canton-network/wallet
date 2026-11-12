// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, type Locator, type Page, test } from '@playwright/test'
import {
    OTCTradeV2,
    type OTCTradeV2Setup,
    type WalletGateway,
} from '@canton-network/core-wallet-test-utils'
import {
    amuletSupportsApi,
    createGatewayApi,
    connectGateway,
    createWalletGateway,
    expectHistoryRow,
    gotoConnect,
    gotoOffers,
    gotoWalletHistory,
    REGISTRY_URL,
    setupRegistry,
    switchWallet,
    tap,
    workerClientId,
} from './utils'

// Amounts (OTCTradeV2 defaults): Alice sends 10 to Bob, Bob sends 2 to Alice,
// Bob sends 0.5 to Carol. Net per trader: Alice -8, Bob +7.5, Carol +0.5.
// V2 locks only the net amount sent, so only Alice locks anything (8).

const setupOtcTradeV2 = async (page: Page) => {
    const rnd = Math.floor(Math.random() * 100000)
    const wg = createWalletGateway(page)

    const hints = {
        venue: `venue-${rnd}`,
        alice: `alice-${rnd}`,
        bob: `bob-${rnd}`,
        carol: `carol-${rnd}`,
    }

    // Scaffolding: parties are created through the wallet's API
    const api = await createGatewayApi()
    const venue = await api.createWallet({
        partyHint: hints.venue,
        signingProvider: 'participant',
    })
    const alice = await api.createWallet({
        partyHint: hints.alice,
        signingProvider: 'participant',
        primary: true,
    })
    const bob = await api.createWallet({
        partyHint: hints.bob,
        signingProvider: 'participant',
    })
    const carol = await api.createWallet({
        partyHint: hints.carol,
        signingProvider: 'participant',
    })

    await gotoConnect(page)
    await connectGateway(page, wg)
    await setupRegistry(page)

    const otcTrade = new OTCTradeV2({
        venue,
        alice,
        bob,
        carol,
        clientId: workerClientId(),
        registryUrl: REGISTRY_URL,
    })
    const trade = await otcTrade.setup()

    return { wg, api, otcTrade, trade, venue, alice, bob, carol, hints }
}

/** The Offers page, on the Allocations tab (Offers opens on Transfers) */
const goToAllocations = async (page: Page) => {
    await gotoOffers(page)
    const tab = page.getByRole('tab', { name: 'Allocations' })
    await tab.click()
    await expect(tab).toHaveAttribute('aria-selected', 'true')
}

// The row aria labels name the settlement. If OfferRow's label changes (e.g. to
// include the settlement cid), update these two selectors.
const requestRow = (page: Page, trade: OTCTradeV2Setup) =>
    page.getByRole('button', {
        name: `Open Allocation Request ${trade.settlement.id}`,
        exact: true,
    })

const allocationRow = (page: Page, trade: OTCTradeV2Setup) =>
    page.getByRole('button', {
        name: `Open Allocation ${trade.settlement.id}`,
        exact: true,
    })

const openRequest = async (
    page: Page,
    trade: OTCTradeV2Setup
): Promise<Locator> => {
    await goToAllocations(page)
    const row = requestRow(page, trade)
    await expect(row).toBeVisible({ timeout: 30_000 })
    await row.click()

    const dialog = page.getByRole('dialog')
    await expect(
        dialog.getByRole('heading', { name: 'Allocation Request' })
    ).toBeVisible()
    return dialog
}

const closeRequest = async (dialog: Locator) => {
    await dialog.getByLabel('Close allocation request dialog').click()
    await expect(dialog).not.toBeVisible({ timeout: 10_000 })
}

/**
 * Accept a V2 request. Accepting is two submissions (the allocation, then the
 * accept), which the gateway shows in one popup, so handleTransactions answers
 * both.
 */
const acceptRequest = async (
    page: Page,
    wg: WalletGateway,
    trade: OTCTradeV2Setup
) => {
    const dialog = await openRequest(page, trade)

    await wg.handleTransactions(
        () => dialog.getByRole('button', { name: 'Accept' }).click(),
        ['approve', 'approve']
    )

    await expect(dialog).not.toBeVisible({ timeout: 30_000 })
    await expect(requestRow(page, trade)).toHaveCount(0, { timeout: 30_000 })
}

const legLine = (
    dialog: Locator,
    legId: string,
    side: 'SenderSide' | 'ReceiverSide'
) => dialog.getByTestId(`leg-${legId}-${side}`)

const fromTo = (label: 'From' | 'To', hint: string) =>
    new RegExp(`${label}:\\s*${hint.slice(0, 10)}`)

const nothingToLock = (reason: string) =>
    new RegExp(`Nothing\\s*[—–-]\\s*${reason}`)

test.describe('OTC allocations V2', () => {
    // Setup, taps, three accepts and a settlement
    test.setTimeout(240_000)

    test.beforeEach(async () => {
        test.skip(
            !(await amuletSupportsApi('splice-api-token-allocation-v2')),
            'Registry does not support token standard v2 allocations'
        )
    })

    test('every trader accepts in the UI and the trade settles', async ({
        page,
    }) => {
        const { wg, api, otcTrade, trade, venue, alice, bob, carol, hints } =
            await setupOtcTradeV2(page)

        // Alice: the only trader who locks funds
        await tap(page, wg, '100')

        await goToAllocations(page)
        await expect(requestRow(page, trade)).toContainText('-8 Amulet', {
            timeout: 30_000,
        })

        let dialog = await openRequest(page, trade)
        // You lock the net amount sent (8), not the leg amount (10)
        await expect(
            dialog.getByText('8 Amulet', { exact: true }).first()
        ).toBeVisible()

        // Alice sends leg0 to Bob and receives leg1 from Bob.
        // Basic accounts: only the party is shown, no account ID.
        const aliceSends = legLine(dialog, 'leg0', 'SenderSide')
        await expect(aliceSends).toContainText('You send')
        await expect(aliceSends).toContainText('10 Amulet')
        await expect(aliceSends).toContainText(fromTo('From', hints.alice))
        await expect(aliceSends).toContainText(fromTo('To', hints.bob))
        await expect(aliceSends).not.toContainText('/')

        const aliceReceives = legLine(dialog, 'leg1', 'ReceiverSide')
        await expect(aliceReceives).toContainText('You receive')
        await expect(aliceReceives).toContainText('2 Amulet')
        await expect(aliceReceives).toContainText(fromTo('From', hints.bob))
        await expect(aliceReceives).toContainText(fromTo('To', hints.alice))
        await expect(aliceReceives).not.toContainText('/')
        await closeRequest(dialog)

        await acceptRequest(page, wg, trade)
        await expect(allocationRow(page, trade)).toContainText(
            'Awaiting Settlement',
            {
                timeout: 30_000,
            }
        )

        // Bob sends 2.5 but receives 10: nothing to lock, so no tap needed
        await switchWallet(api, bob)
        dialog = await openRequest(page, trade)
        await expect(
            dialog.getByText(nothingToLock('you receive more than you send'))
        ).toBeVisible()
        await closeRequest(dialog)
        await acceptRequest(page, wg, trade)

        // Carol only receives
        await switchWallet(api, carol)
        dialog = await openRequest(page, trade)
        await expect(
            dialog.getByText(nothingToLock('you only receive'))
        ).toBeVisible()
        await closeRequest(dialog)
        await acceptRequest(page, wg, trade)

        // The venue is a stakeholder of every request, but authorizes none of
        // them: its wallet must not list them
        await switchWallet(api, venue)
        await goToAllocations(page)
        await expect(requestRow(page, trade)).toHaveCount(0)

        // Venue settles once every leg is covered; every accept is done already
        await otcTrade.settle({ ...trade, maxAttempts: 10, intervalMs: 3_000 })

        await gotoWalletHistory(page, alice, hints.alice)
        await expectHistoryRow(page, {
            activity: 'Allocation reserved',
            amount: '8',
            counterpartyHint: hints.bob,
        })
        await expectHistoryRow(page, {
            activity: 'Transfer sent ↗',
            amount: '-8',
            counterpartyHint: hints.bob,
        })

        await gotoWalletHistory(page, bob, hints.bob)
        await expectHistoryRow(page, {
            activity: 'Trade settled',
            amount: '7.5',
            counterpartyHint: 'Multiple',
        })

        await gotoWalletHistory(page, carol, hints.carol)
        await expectHistoryRow(page, {
            activity: 'Transfer received ↘',
            amount: '+0.5',
            counterpartyHint: hints.bob,
        })

        // Nothing left to act on
        await switchWallet(api, alice)
        await goToAllocations(page)
        await expect(requestRow(page, trade)).toHaveCount(0)
        await expect(allocationRow(page, trade)).toHaveCount(0)
    })

    test('rejecting a request removes it', async ({ page }) => {
        const { wg, trade } = await setupOtcTradeV2(page)

        const dialog = await openRequest(page, trade)
        // Rejecting is a single submission, approved like any other transaction
        await wg.approveTransaction(() =>
            dialog.getByRole('button', { name: 'Reject', exact: true }).click()
        )

        await expect(dialog).not.toBeVisible({ timeout: 30_000 })
        await expect(requestRow(page, trade)).toHaveCount(0, {
            timeout: 30_000,
        })
    })

    test('a failed accept can be retried without allocating twice', async ({
        page,
    }) => {
        const { wg, trade } = await setupOtcTradeV2(page)
        await tap(page, wg, '100')

        const dialog = await openRequest(page, trade)

        // One click, two submissions in one popup: approve the allocation,
        // reject the accept
        await wg.handleTransactions(
            () => dialog.getByRole('button', { name: 'Accept' }).click(),
            ['approve', 'reject']
        )

        // The dialog stays open and explains the partial state
        await expect(dialog.getByRole('alert')).toBeVisible({ timeout: 30_000 })

        // console.log(
        //     'before retry:',
        //     await dialog.getByRole('alert').textContent()
        // )
        // console.log(
        //     'pages:',
        //     page
        //         .context()
        //         .pages()
        //         .map((p) => p.url())
        // )
        // await dialog.getByRole('button', { name: 'Accept' }).click()
        // await page.waitForTimeout(5_000)
        // console.log(
        //     'after retry:',
        //     await dialog.getByRole('alert').textContent()
        // )
        // console.log(
        //     'pages:',
        //     page
        //         .context()
        //         .pages()
        //         .map((p) => p.url())
        // )
        // return
        // Retry: the allocation exists, so only the accept is submitted.
        // approveTransaction answers exactly one request: if the retry allocated
        // again, the accept would be left pending and the dialog would stay open.
        await wg.approveTransaction(() =>
            dialog.getByRole('button', { name: 'Accept' }).click()
        )

        await expect(dialog).not.toBeVisible({ timeout: 30_000 })

        // Exactly one allocation, and the request is gone
        await expect(requestRow(page, trade)).toHaveCount(0, {
            timeout: 30_000,
        })
        const row = allocationRow(page, trade)
        await expect(row).toHaveCount(1, { timeout: 30_000 })

        // Still 8 locked, not 16
        await row.click()
        await expect(
            page
                .getByRole('dialog')
                .getByText('8 Amulet', { exact: true })
                .first()
        ).toBeVisible()
    })

    test('accepting without enough funds fails before anything is submitted', async ({
        page,
    }) => {
        const { trade } = await setupOtcTradeV2(page)
        // No tap: Alice has nothing to lock

        const dialog = await openRequest(page, trade)
        await dialog.getByRole('button', { name: 'Accept' }).click()

        // Input selection fails in the wallet; no gateway approval is requested
        await expect(dialog.getByRole('alert')).toBeVisible({ timeout: 30_000 })
        await closeRequest(dialog)

        await expect(requestRow(page, trade)).toContainText('Action Required')
        await expect(allocationRow(page, trade)).toHaveCount(0)
    })

    test('rejecting an accepted allocation releases the funds', async ({
        page,
    }) => {
        const { wg, trade, alice, hints } = await setupOtcTradeV2(page)

        await tap(page, wg, '100')
        await acceptRequest(page, wg, trade)

        await goToAllocations(page)
        const row = allocationRow(page, trade)
        await expect(row).toBeVisible({ timeout: 30_000 })
        await row.click()

        const dialog = page.getByRole('dialog')
        await expect(
            dialog.getByRole('heading', { name: 'Allocation' })
        ).toBeVisible()

        // Two steps: open the confirmation, then confirm. The confirmation
        // replaces the first button, so the name is never on screen twice.
        await dialog
            .getByRole('button', { name: 'Reject allocation', exact: true })
            .click()
        await expect(dialog.getByText('Reject this allocation?')).toBeVisible()
        await wg.approveTransaction(() =>
            dialog
                .getByRole('button', { name: 'Reject allocation', exact: true })
                .click()
        )

        await expect(dialog).not.toBeVisible({ timeout: 30_000 })
        await expect(row).toHaveCount(0, { timeout: 30_000 })

        await gotoWalletHistory(page, alice, hints.alice)
        await expectHistoryRow(page, {
            activity: 'Allocation reserved',
            amount: '8',
            counterpartyHint: hints.bob,
        })
        await expectHistoryRow(page, {
            activity: 'Allocation withdrawn',
            amount: '8',
            counterpartyHint: 'Self',
        })
    })
})
