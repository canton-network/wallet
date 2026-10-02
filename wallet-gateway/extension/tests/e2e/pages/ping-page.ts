// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { openWalletPicker } from '@canton-network/core-wallet-test-utils'
import type { Locator, Page } from '@playwright/test'
import { expect } from '../fixtures.js'

const CONNECTED_GATEWAY_ID_PATTERN = /^(browser:ext:canton-wallet|remote-da)$/

export class PingPage {
    constructor(private readonly page: Page) {}

    async expectDisconnected(): Promise<void> {
        await expect(this.page).toHaveTitle(/Example dApp/)
        await expect(
            this.page.getByTestId('connection-indicator-disconnected')
        ).toBeVisible()
        await expect(this.page.getByTestId('connect-wallet')).toBeVisible()
    }

    async connectToExtension(): Promise<void> {
        const picker = await openWalletPicker(
            this.page,
            this.page.getByTestId('connect-wallet')
        )
        const wallet = picker.getByRole('button', {
            name: /Wallet Gateway/,
        })
        await expect(wallet).toBeVisible()
        await expect(picker.getByLabel('Install Canton Wallet')).toHaveCount(0)

        await wallet.click()
        await picker.getByRole('button', { name: 'Connect' }).click()

        await expect(picker.getByText('Logging in')).toHaveCount(0)

        await expect(async () => {
            expect(await this.page.getByTestId('connect-wallet').count()).toBe(
                0
            )
            expect(await this.page.getByTestId('open-wallet').isEnabled()).toBe(
                true
            )
            expect(
                await this.page
                    .getByTestId('connection-indicator-connected')
                    .isVisible()
            ).toBe(true)
            expect(
                await this.page.getByTestId('connected-gateway').textContent()
            ).toMatch(CONNECTED_GATEWAY_ID_PATTERN)
            expect(await this.page.locator('p.error').count()).toBe(0)
        }).toPass({ timeout: 15_000 })
    }

    async expectAccount(partyId: string): Promise<void> {
        await this.page.getByRole('button', { name: 'Accounts' }).click()

        const requestedAccount = this.page
            .getByText(partyId)
            .filter({ visible: true })

        if ((await requestedAccount.count()) > 0) {
            await expect(requestedAccount.first()).toBeVisible()
            return
        }

        await expect(async () => {
            const primaryCount = await this.page
                .locator('li')
                .filter({ hasText: '(primary)' })
                .filter({ visible: true })
                .count()
            expect(primaryCount).toBeGreaterThan(0)
        }).toPass({ timeout: 15_000 })
    }

    async preparePingContract(): Promise<Locator> {
        await this.page
            .getByRole('button', { name: 'Ledger Submission' })
            .click()
        const createButton = this.page.getByRole('button', {
            name: 'create Ping contract',
            exact: true,
        })
        await expect(createButton).toBeEnabled()
        await createButton.click()
        await expect(createButton).toBeEnabled({ timeout: 30_000 })
        await expect(this.page.locator('p.error')).toHaveCount(0)
        return createButton
    }

    async expectNoSubmissionError(): Promise<void> {
        await expect(this.page.locator('p.error')).toHaveCount(0)
    }
}
