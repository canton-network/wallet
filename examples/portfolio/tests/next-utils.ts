// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, Page } from '@playwright/test'
import { WalletGateway } from '@canton-network/core-wallet-test-utils'

const BASE_URL = 'http://localhost:8081'

export const createWalletGateway = (dappPage: Page): WalletGateway =>
    new WalletGateway({
        dappPage,
        openButton: (page) =>
            page.getByRole('button', {
                name: 'Wallet Gateway',
            }),
        connectButton: (page) =>
            page.getByRole('button', {
                name: 'Connect Wallet',
            }),
    })

export const gotoConnect = async (page: Page): Promise<void> => {
    await page.goto(`${BASE_URL}/next/connect`)
    await expect(page).toHaveTitle(/dApp Portfolio/)
    await expect(
        page.getByRole('button', { name: 'Connect Wallet' })
    ).toBeVisible({ timeout: 10000 })
}

export const gotoDashboard = async (page: Page): Promise<void> => {
    await page.goto(`${BASE_URL}/next/dashboard`)
    await expect(page).toHaveTitle(/dApp Portfolio/)
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({
        timeout: 10000,
    })
}

export const gotoOffers = async (page: Page): Promise<void> => {
    await page.goto(`${BASE_URL}/next/dashboard/offers`)
    await expect(page).toHaveTitle(/dApp Portfolio/)
    await expect(page.getByRole('heading', { name: 'Offers' })).toBeVisible({
        timeout: 10000,
    })
}

export const setupRegistry = async (page: Page): Promise<void> => {
    await page.goto(`${BASE_URL}/next/dashboard/settings`)
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({
        timeout: 10000,
    })

    const registriesSection = page.locator(
        'section[aria-labelledby="registries-heading"]'
    )
    await registriesSection.getByRole('button', { name: 'Add' }).click()

    const dialog = page.getByRole('dialog')
    await expect(
        dialog.getByRole('heading', { name: 'Add Registry' })
    ).toBeVisible()
    await dialog
        .getByRole('textbox', { name: 'Registry URL' })
        .fill('http://scan.localhost:4000')
    await dialog.getByRole('button', { name: 'Add', exact: true }).click()

    await expect(dialog).not.toBeVisible({ timeout: 10000 })
    await expect(
        registriesSection.getByText('http://scan.localhost:4000')
    ).toBeVisible({ timeout: 10000 })
}

/**
 * TAP via the dashboard settings page, then return to the dashboard.
 */
export const tap = async (
    page: Page,
    wg: WalletGateway,
    amount: string
): Promise<void> => {
    await page.goto(`${BASE_URL}/next/dashboard/settings`)

    const devNetSection = page.locator(
        'section[aria-labelledby="devnet-heading"]'
    )
    await expect(devNetSection.getByText('DevNet Tap')).toBeVisible({
        timeout: 20000,
    })

    await devNetSection.getByRole('button', { name: 'Tap' }).click()

    const dialog = page.getByRole('dialog')
    await expect(
        dialog.getByRole('heading', { name: 'DevNet tap' })
    ).toBeVisible()

    await expect(dialog.getByLabel('Instrument')).toHaveValue('Amulet')

    const amountInput = dialog.getByRole('spinbutton', { name: 'Amount' })
    await amountInput.clear()
    await amountInput.fill(amount)

    await wg.approveTransaction(() =>
        dialog.getByRole('button', { name: 'Tap', exact: true }).click()
    )

    await expect(dialog).not.toBeVisible({ timeout: 15000 })

    await gotoDashboard(page)
}

export const openTransferDialog = async (page: Page): Promise<void> => {
    await page.getByRole('button', { name: 'Transfer' }).click()
    await expect(
        page.getByRole('heading', { name: 'Make a transfer' })
    ).toBeVisible()
}

/**
 * Fill and submit the dashboard Make Transfer dialog.
 * Assumes the dialog is already open.
 */
export const fillAndSubmitTransfer = async (
    page: Page,
    wg: WalletGateway,
    opts: { amount: string; recipient: string; message: string }
): Promise<void> => {
    const dialog = page.getByRole('dialog')

    await dialog
        .getByRole('textbox', { name: 'Recipient Address' })
        .fill(opts.recipient)
    await dialog.getByRole('combobox', { name: 'Select asset' }).click()
    await page.getByRole('option', { name: /AMT/ }).click()
    await dialog.getByRole('spinbutton', { name: 'Amount' }).fill(opts.amount)
    await dialog
        .getByRole('textbox', { name: 'Description' })
        .fill(opts.message)

    await wg.approveTransaction(() =>
        dialog.getByRole('button', { name: 'Make Transfer' }).click()
    )

    await expect(
        dialog.getByRole('heading', { name: 'Transfer Summary' })
    ).toBeVisible({ timeout: 15000 })
    await expect(
        dialog.getByText(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
    ).toHaveCount(2)
    await dialog.getByRole('button', { name: 'Close', exact: true }).click()
    await expect(dialog).not.toBeVisible({ timeout: 10000 })
}

export const openTransferOfferDialog = async (
    page: Page,
    opts: { amount: string; message?: string }
) => {
    const offerRow = opts.message
        ? page.getByRole('button', {
              name: new RegExp(
                  `Open Transfer Offer.*${escapeRegExp(opts.message)}`
              ),
          })
        : page
              .getByRole('button', { name: 'Open Transfer Offer' })
              .filter({ hasText: new RegExp(escapeRegExp(opts.amount)) })
              .first()

    await expect(offerRow).toBeVisible({ timeout: 15000 })
    await offerRow.click()

    const dialog = page.getByRole('dialog')
    await expect(
        dialog.getByRole('heading', { name: 'Transfer Offer' })
    ).toBeVisible()
    await expect(
        dialog.getByText(new RegExp(`[+-]${escapeRegExp(opts.amount)}\\b`))
    ).toBeVisible({ timeout: 15000 })

    if (opts.message) {
        await expect(dialog.getByText(opts.message)).toBeVisible()
    }

    return dialog
}

export const expectTransferOfferGone = async (
    page: Page,
    opts: { amount: string; message?: string }
): Promise<void> => {
    const offerRow = opts.message
        ? page.getByRole('button', {
              name: new RegExp(
                  `Open Transfer Offer.*${escapeRegExp(opts.message)}`
              ),
          })
        : page
              .getByRole('button', { name: 'Open Transfer Offer' })
              .filter({ hasText: new RegExp(escapeRegExp(opts.amount)) })

    await expect(offerRow).not.toBeVisible({ timeout: 15000 })
}

/**
 * Assert the sidebar Offers badge shows the expected count of
 * non-expired offers. Use 0 to assert the badge is hidden.
 */
export const expectOffersBadgeCount = async (
    page: Page,
    count: number
): Promise<void> => {
    const badge = page.getByLabel(/^\d+ pending offers?$/)

    if (count === 0) {
        await expect(badge).not.toBeVisible({ timeout: 15000 })
        return
    }

    await expect(badge).toHaveText(String(count), { timeout: 15000 })
}

export const switchWallet = async (
    page: Page,
    wg: WalletGateway,
    partyId: string
): Promise<void> => {
    await expect(
        page.getByRole('button', { name: 'Wallet Gateway' })
    ).toBeVisible()

    if (!(await wg.isPopupOpen())) {
        await wg.openPopup()
    }

    await wg.setPrimaryWallet(partyId)
}

export const expectWalletBalance = async (
    page: Page,
    walletId: string,
    amount: string
): Promise<void> => {
    await page.goto(
        `${BASE_URL}/next/dashboard/wallet/${encodeURIComponent(walletId)}`
    )
    await expect(page.getByRole('heading', { name: 'Assets' })).toBeVisible({
        timeout: 10000,
    })
    await expect(
        page.getByLabel(
            new RegExp(`Total balance: ${escapeRegExp(amount)} AMT`)
        )
    ).toBeVisible({ timeout: 15000 })
}

export const expectWalletHasNoAssets = async (
    page: Page,
    walletId: string
): Promise<void> => {
    await page.goto(
        `${BASE_URL}/next/dashboard/wallet/${encodeURIComponent(walletId)}`
    )
    await expect(page.getByRole('heading', { name: 'Assets' })).toBeVisible({
        timeout: 10000,
    })
    await expect(
        page.getByText('This wallet is not holding any assets')
    ).toBeVisible({ timeout: 15000 })
}

/**
 * Toggle a preapproval switch on the dashboard settings page.
 * Waits for the status query to resolve, approves the ledger transaction,
 * and waits for the switch to reflect the new state.
 */
export const togglePreapproval = async (
    page: Page,
    wg: WalletGateway,
    opts: { instrument: string; enabled: boolean }
): Promise<void> => {
    await page.goto(`${BASE_URL}/next/dashboard/settings`)

    const preapprovalsSection = page.locator(
        'section[aria-labelledby="preapprovals-heading"]'
    )
    await expect(
        preapprovalsSection.getByRole('heading', {
            name: 'Pre-approved Assets',
        })
    ).toBeVisible({ timeout: 10000 })

    // The switch label flips between Enable/Disable based on current state.
    const action = opts.enabled ? 'Enable' : 'Disable'
    const toggle = preapprovalsSection.getByLabel(
        `${action} preapproval for ${opts.instrument}`
    )

    // Disabled until the status query resolves.
    await expect(toggle).toBeEnabled({ timeout: 30000 })

    await wg.approveTransaction(() => toggle.click())

    // After the toggle, the switch label flips to the opposite action.
    // Enabling an amulet preapproval waits for the validator automation to
    // accept the preapproval proposal, which can take a while on LocalNet.
    const oppositeAction = opts.enabled ? 'Disable' : 'Enable'
    await expect(
        preapprovalsSection.getByLabel(
            `${oppositeAction} preapproval for ${opts.instrument}`
        )
    ).toBeEnabled({ timeout: 90000 })
    await expect(
        preapprovalsSection.getByText(opts.enabled ? 'Enabled' : 'Disabled', {
            exact: true,
        })
    ).toBeVisible()
}

/**
 * Tap funds and create allocation(s) via the Action Required dialog.
 */
export const tapAndCreateAllocation = async (
    page: Page,
    wg: WalletGateway,
    amount: string,
    allocationsToCreate = 1
): Promise<void> => {
    await tap(page, wg, amount)

    await expect(
        page.getByRole('heading', { name: 'Action Required' })
    ).toBeVisible({ timeout: 10000 })

    const allocationRequest = page
        .getByRole('button', { name: 'Open Allocation Request' })
        .first()
    await expect(allocationRequest).toBeVisible({ timeout: 15000 })
    await allocationRequest.click()

    const dialog = page.getByRole('dialog')
    await expect(
        dialog.getByRole('heading', { name: 'Allocation Request' })
    ).toBeVisible()

    const allocateButtons = dialog.getByRole('button', { name: 'Allocate' })
    await expect(allocateButtons).toHaveCount(allocationsToCreate, {
        timeout: 15000,
    })

    for (let i = 0; i < allocationsToCreate; i++) {
        await wg.approveTransaction(() => allocateButtons.first().click())
        await expect(allocateButtons).toHaveCount(allocationsToCreate - i - 1, {
            timeout: 15000,
        })
    }

    if (await dialog.isVisible()) {
        await dialog.getByLabel('Close allocation request dialog').click()
        await expect(dialog).not.toBeVisible({ timeout: 10000 })
    }
}

const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
