// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    testWithGatewayCapture as test,
    expect,
} from '@canton-network/core-wallet-test-utils'
import { Page } from '@playwright/test'
import { WalletGateway } from '@canton-network/core-wallet-test-utils'
import {
    createWalletGateway,
    expectOffersBadgeCount,
    expectTransferOfferGone,
    expectWalletBalance,
    expectWalletHasNoAssets,
    fillAndSubmitTransfer,
    gotoConnect,
    gotoDashboard,
    gotoOffers,
    openTransferDialog,
    openTransferOfferDialog,
    setupRegistry,
    switchWallet,
    tap,
} from './utils'

// Transfer tests share wallet gateway state (primary wallet) with the backend,
// so they must run serially to avoid races on which wallet is primary.
test.describe.configure({ mode: 'serial' })

// Transfer tests involve multiple ledger transactions (tap + transfer + accept/reject/withdraw),
// so give them more time than the default 30s.
test.setTimeout(120_000)

interface TransferTestContext {
    wg: WalletGateway
    alice: string
    bob: string
}

const setupTransferTest = async (page: Page): Promise<TransferTestContext> => {
    const rnd = Math.floor(Math.random() * 100000)
    const wg = createWalletGateway(page)

    await gotoConnect(page)
    await wg.connect({ network: 'LocalNet' })

    const alice = await wg.createWalletIfNotExists({
        partyHint: `alice-${rnd}`,
        signingProvider: 'participant',
    })
    const bob = await wg.createWalletIfNotExists({
        partyHint: `bob-${rnd}`,
        signingProvider: 'participant',
    })

    await wg.setPrimaryWallet(alice)
    await setupRegistry(page)
    await gotoDashboard(page)

    return { wg, alice, bob }
}

test.describe('dashboard transfer flow', () => {
    test('two step transfer - accept', async ({ page: dappPage }) => {
        const { wg, alice, bob } = await setupTransferTest(dappPage)

        // Alice: tap and create transfer.
        await tap(dappPage, wg, '1234')

        // Verify alice's holdings on the wallet detail page.
        await expectWalletBalance(dappPage, alice, '1234')

        const message = 'accept transfer test ' + Date.now()
        await gotoDashboard(dappPage)

        // No offers yet, so the sidebar badge is hidden.
        await expectOffersBadgeCount(dappPage, 0)

        await openTransferDialog(dappPage)
        await fillAndSubmitTransfer(dappPage, wg, {
            amount: '321',
            recipient: bob,
            message,
        })

        // Alice's outgoing offer is counted on the sidebar badge.
        await expectOffersBadgeCount(dappPage, 1)

        // Switch to bob to see the pending transfer as receiver.
        await switchWallet(dappPage, wg, bob)
        await gotoDashboard(dappPage)

        // Bob's incoming offer is counted on the sidebar badge.
        await expectOffersBadgeCount(dappPage, 1)

        const dialog = await openTransferOfferDialog(dappPage, {
            amount: '321',
            message,
        })

        await wg.approveTransaction(() =>
            dialog.getByRole('button', { name: 'Accept' }).click()
        )

        // Verify bob received the transferred amount.
        await expectWalletBalance(dappPage, bob, '321')

        // The accepted offer no longer counts towards the badge.
        await expectOffersBadgeCount(dappPage, 0)

        // Verify alice's balance decreased.
        await switchWallet(dappPage, wg, alice)
        await expectWalletBalance(dappPage, alice, '913')
    })

    test('two step transfer - rejection', async ({ page: dappPage }) => {
        const { wg, alice, bob } = await setupTransferTest(dappPage)

        // Alice: tap and create transfer.
        await tap(dappPage, wg, '500')

        const message = 'reject transfer test ' + Date.now()
        await openTransferDialog(dappPage)
        await fillAndSubmitTransfer(dappPage, wg, {
            amount: '100',
            recipient: bob,
            message,
        })

        // Switch to bob to see the pending transfer as receiver.
        await switchWallet(dappPage, wg, bob)
        await gotoDashboard(dappPage)

        const dialog = await openTransferOfferDialog(dappPage, {
            amount: '100',
            message,
        })

        await wg.approveTransaction(() =>
            dialog.getByRole('button', { name: 'Reject' }).click()
        )

        // Reload dashboard and verify the rejected transfer is gone.
        await gotoDashboard(dappPage)
        await expectTransferOfferGone(dappPage, { amount: '100', message })

        // Verify alice's balance is restored after rejection.
        await switchWallet(dappPage, wg, alice)
        await expectWalletBalance(dappPage, alice, '500')

        // Verify bob has no holdings.
        await switchWallet(dappPage, wg, bob)
        await expectWalletHasNoAssets(dappPage, bob)
    })

    test('two step transfer - withdrawal by sender', async ({
        page: dappPage,
    }) => {
        const { wg, alice, bob } = await setupTransferTest(dappPage)

        // Alice: tap and create transfer.
        await tap(dappPage, wg, '500')

        const message = 'withdraw transfer test ' + Date.now()
        await openTransferDialog(dappPage)
        await fillAndSubmitTransfer(dappPage, wg, {
            amount: '100',
            recipient: bob,
            message,
        })

        // Re-assert alice as primary wallet and wait for the outgoing transfer
        // to load on Offers.
        await switchWallet(dappPage, wg, alice)
        await gotoOffers(dappPage)
        const loadedDialog = await openTransferOfferDialog(dappPage, {
            amount: '100',
            message,
        })
        await loadedDialog.getByLabel('Close transfer offer dialog').click()

        // Outgoing transfers do not appear as actions required on the dashboard.
        await gotoDashboard(dappPage)
        await expectTransferOfferGone(dappPage, { amount: '100', message })

        // The transfer remains available on Offers so the sender can withdraw it.
        await gotoOffers(dappPage)
        const dialog = await openTransferOfferDialog(dappPage, {
            amount: '100',
            message,
        })

        await wg.approveTransaction(() =>
            dialog.getByRole('button', { name: 'Withdraw' }).click()
        )

        // Verify the transfer is gone from Offers.
        await gotoOffers(dappPage)
        await expectTransferOfferGone(dappPage, { amount: '100', message })

        // Verify alice's balance is restored after withdrawal.
        await expectWalletBalance(dappPage, alice, '500')

        // Verify bob has no holdings.
        await switchWallet(dappPage, wg, bob)
        await expectWalletHasNoAssets(dappPage, bob)
    })

    test('transfer detail dialog', async ({ page: dappPage }) => {
        const { wg, bob } = await setupTransferTest(dappPage)

        // Alice: tap and create transfer.
        await tap(dappPage, wg, '800')

        const message = 'dialog detail test ' + Date.now()
        await openTransferDialog(dappPage)
        await fillAndSubmitTransfer(dappPage, wg, {
            amount: '200',
            recipient: bob,
            message,
        })

        // Switch to bob (receiver) to see the transfer.
        await switchWallet(dappPage, wg, bob)
        await gotoDashboard(dappPage)

        const dialog = await openTransferOfferDialog(dappPage, {
            amount: '200',
            message,
        })

        // Verify the Transfer Offer dialog.
        await expect(
            dialog.getByRole('heading', { name: 'Transfer Offer' })
        ).toBeVisible()
        await expect(dialog.getByText(/[+-]200\b/)).toBeVisible()
        await expect(dialog.getByText(message)).toBeVisible()

        // Verify dialog has Accept and Reject buttons.
        await expect(
            dialog.getByRole('button', { name: 'Accept' })
        ).toBeVisible()
        await expect(
            dialog.getByRole('button', { name: 'Reject' })
        ).toBeVisible()

        // Accept via the dialog.
        await wg.approveTransaction(() =>
            dialog.getByRole('button', { name: 'Accept' }).click()
        )
    })
})
