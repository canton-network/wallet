// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, Locator, Page } from '@playwright/test'

/**
 * Encapsulates all wallet gateway UI interactions for a given Page.
 * Can be used with any Page — a popup window, a full page, or an embedded view.
 */
export class WalletGatewayPage {
    constructor(private readonly page: Page) {}

    async setPrimaryWallet(partyId: string): Promise<void> {
        await this.gotoPartiesPage()

        const wallet = this.page
            .locator(`wg-wallet-card[party-id="${partyId}"]`)
            .first()
        await expect(wallet).toBeVisible({ timeout: 15000 })

        const setPrimaryButton = wallet.getByRole('button', {
            name: 'Set as primary',
        })
        if (await setPrimaryButton.isVisible().catch(() => false)) {
            await setPrimaryButton.click()
        }
    }

    async createWalletIfNotExists(args: {
        partyHint: string
        signingProvider: 'participant' | 'wallet-kernel' | 'blockdaemon'
        primary?: boolean
    }): Promise<string> {
        await this.gotoPartiesPage()

        const pattern = new RegExp(`${args.partyHint}::[0-9a-f]+`)
        const wallets = this.page.locator(
            `wg-wallet-card[party-id*="${args.partyHint}"]`
        )
        const walletsCount = await wallets.count()
        if (walletsCount > 0) {
            const partyId = await wallets.first().getAttribute('party-id')
            if (partyId === null || !pattern.test(partyId)) {
                throw new Error(
                    `did not find partyID for ${args.partyHint}, got ${partyId}`
                )
            }

            if (args.primary) {
                const setPrimaryButton = wallets
                    .first()
                    .getByRole('button', { name: 'Set as primary' })
                if (await setPrimaryButton.isVisible().catch(() => false)) {
                    await setPrimaryButton.click()
                }
            }

            return partyId
        }

        await this.page.getByRole('button', { name: 'New' }).click()
        await expect(
            this.page.getByRole('heading', {
                name: 'Create a new party',
            })
        ).toBeVisible({ timeout: 15000 })
        await this.page.getByLabel('Party ID Hint').fill(args.partyHint)
        await this.page
            .getByLabel('Signing Provider')
            .selectOption(args.signingProvider)
        if (args.primary) {
            await this.page
                .getByRole('checkbox', { name: 'Set as primary wallet' })
                .check()
        }
        await this.page.getByRole('button', { name: 'Create' }).click()

        await this.waitForPartiesPageReady()

        const newWallet = this.page
            .locator(`wg-wallet-card[party-id*="${args.partyHint}"]`)
            .first()
        await expect(newWallet).toBeVisible({ timeout: 15000 })

        const partyId = await newWallet.getAttribute('party-id')
        if (partyId === null || !pattern.test(partyId)) {
            throw new Error(`did not find partyID for ${args.partyHint}`)
        }

        if (args.signingProvider == 'blockdaemon') {
            const allocateButton = newWallet.getByRole('button', {
                name: 'Allocate party',
                exact: true,
            })

            if (await allocateButton.isVisible().catch(() => false)) {
                await allocateButton.click()
                await expect(allocateButton).not.toBeVisible({ timeout: 15000 })
            }
        }

        return partyId
    }

    async approveTransaction(
        start: () => Promise<void>,
        opts?: { waitForClose?: boolean; isExternalSigning?: boolean }
    ): Promise<{
        commandId: string
    }> {
        // NOTE(jaspervdj): I am passing in start (which is an async function
        // starting the transaction in the dApp, like clicking a button) as a
        // parameter here. The reason for that is that I was first doing some
        // setup work (like installing something to wait for a popup). This
        // turned out not to be necessary, but I think this API is more
        // forward-proof, since we may change how the popup behaves.
        await start()

        await expect(
            this.page.getByRole('button', { name: 'Approve' })
        ).toBeVisible({ timeout: 15000 })
        const approveButton = this.page.getByRole('button', {
            name: 'Approve',
        })

        let commandId: string | null = null
        for (let i = 0; i < 30 && !commandId; i++) {
            commandId = new URL(this.page.url()).searchParams.get('commandId')
            if (!commandId) {
                await new Promise((resolve) => setTimeout(resolve, 500))
            }
        }
        if (!commandId) throw new Error('Approve popup has no commandId in URL')

        await approveButton.click()

        if (opts?.isExternalSigning) {
            expect(
                this.page.getByText(
                    'Complete signing in your external provider'
                )
            ).toBeVisible({ timeout: 15000 })
            await approveButton.click()
        }

        if (opts?.waitForClose !== false) {
            // For dApp-triggered approvals the popup is opened with
            // `closeafteraction`, so success is signalled by the popup closing.
            try {
                await this.page.waitForEvent('close', { timeout: 30000 })
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : String(e)
                if (
                    !message.includes(
                        'Target page, context or browser has been closed'
                    ) &&
                    !message.includes('Target closed')
                ) {
                    throw e
                }
            }
        }
        return { commandId }
    }

    async login(network: string): Promise<void> {
        const selectNetwork = this.page.getByLabel('Select a network')
        await expect(selectNetwork).toBeVisible({ timeout: 15000 })
        await selectNetwork.selectOption({ label: network })
        await this.page.getByRole('button', { name: 'Connect' }).click()
        // Wait for the OAuth redirect chain to complete and land on the parties page.
        await this.page.waitForURL(/\/parties/, { timeout: 30000 })
    }

    async logout(): Promise<void> {
        await this.page.locator('button[aria-haspopup="menu"]').click()
        await this.page.getByRole('button', { name: 'Logout' }).click()
        // Popup windows close on logout; direct windows redirect to /login.
        await Promise.race([
            this.page.waitForEvent('close', { timeout: 5000 }),
            this.page.waitForURL(/\/login/, { timeout: 5000 }),
        ])
    }

    async close(): Promise<void> {
        await this.page.close()
    }

    async isOpen(): Promise<boolean> {
        return !this.page.isClosed()
    }

    async waitForClosed(timeout = 5000): Promise<void> {
        await this.page.waitForEvent('close', { timeout })
    }

    async waitForUrl(expectedUrl: string | RegExp): Promise<void> {
        return this.page.waitForURL(expectedUrl, { timeout: 5000 })
    }

    private async gotoPartiesPage(): Promise<void> {
        await this.page.locator('button[aria-haspopup="menu"]').click()
        await this.page
            .getByRole('button', { name: 'Parties', exact: true })
            .click()
        await this.waitForPartiesPageReady()
    }

    private async waitForPartiesPageReady(): Promise<void> {
        await expect(
            this.page.getByRole('button', { name: 'New' })
        ).toBeVisible({ timeout: 15000 })
        await expect(
            this.page.getByText('Loading parties...')
        ).not.toBeVisible()
    }
}

/**
 * Manages the wallet gateway popup lifecycle initiated from a dApp page.
 * Use `getPage()` to obtain a `WalletGatewayPage` for direct UI interactions,
 * or use the convenience methods which delegate to the current popup.
 */
export class WalletGateway {
    private readonly dappPage: Page
    private readonly connectButton: (dappPage: Page) => Locator
    private readonly openButton: (dappPage: Page) => Locator
    private _popup: Page | undefined

    constructor(args: {
        dappPage: Page
        connectButton: (dappPage: Page) => Locator
        openButton: (dappPage: Page) => Locator
    }) {
        this.dappPage = args.dappPage
        this.connectButton = args.connectButton
        this.openButton = args.openButton

        // Refresh the popup reference whenever a new popup appears.
        this.dappPage.on('popup', (p) => {
            this._popup = p
            p.on('close', () => {
                // Only unset when this is the last set popup.
                if (this._popup === p) this._popup = undefined
            })
        })
    }

    async connect(args: {
        network: 'LocalNet' | 'Local (OAuth IDP)'
        customURL?: string
    }): Promise<void> {
        const connectButton = this.connectButton(this.dappPage)
        await expect(connectButton).toBeVisible()

        const discoverPopupPromise = this.dappPage.waitForEvent('popup')
        await connectButton.click()
        const pickerPopup = await discoverPopupPromise

        await this.selectFromWalletPicker(pickerPopup, args.customURL)

        const popup = await this.waitForConnectFormPopup(pickerPopup)
        const wg = new WalletGatewayPage(popup)
        await wg.login(args.network)
    }

    async openPopup(): Promise<void> {
        const discoverPopupPromise = this.dappPage.waitForEvent('popup')
        const openButton = this.openButton(this.dappPage)
        await expect(openButton).toBeVisible()
        await openButton.click()
        await discoverPopupPromise
    }

    private async popup(): Promise<Page> {
        // NOTE(jaspervdj): Yes, having `(await this.popup())....` everywhere
        // is a bit ugly, but unfortunately the popup can be closed at any time
        // (in particular, a few seconds after approving a transaction), so
        // having popup async allows us to work around that (even if the popup
        // behaviour would change).

        for (let i = 0; i < 10 && !this._popup; i++) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
        }
        if (!this._popup) {
            if (!this._popup) {
                throw new Error('popup closed: call openPopup() first')
            }
        }
        return this._popup
    }

    /** Returns a WalletGatewayPage wrapping the current popup. */
    async getPage(): Promise<WalletGatewayPage> {
        return new WalletGatewayPage(await this.popup())
    }

    async setPrimaryWallet(partyId: string): Promise<void> {
        const page = await this.getPage()
        return page.setPrimaryWallet(partyId)
    }

    async createWalletIfNotExists(args: {
        partyHint: string
        signingProvider: 'participant' | 'wallet-kernel' | 'blockdaemon'
        primary?: boolean
    }): Promise<string> {
        const page = await this.getPage()
        return page.createWalletIfNotExists(args)
    }

    async approveTransaction(
        start: () => Promise<void>,
        opts?: { waitForClose?: boolean; isExternalSigning?: boolean }
    ): Promise<{
        commandId: string
    }> {
        const page = await this.getPage()
        return page.approveTransaction(start, opts)
    }

    async reconnect(args: {
        network: 'LocalNet' | 'Local (OAuth IDP)'
        customURL?: string
    }): Promise<void> {
        const connectButton = this.connectButton(this.dappPage)
        await expect(connectButton).toBeVisible()

        const discoverPopupPromise = this.dappPage.waitForEvent('popup')
        await connectButton.click()
        const pickerPopup = await discoverPopupPromise

        await this.selectFromWalletPicker(pickerPopup, args.customURL)

        const popup = await this.waitForConnectFormPopup(pickerPopup)
        const selectNetwork = popup.getByLabel('Select a network')
        await expect(selectNetwork).toBeVisible({ timeout: 15000 })
        await selectNetwork.selectOption({ label: args.network })
        const confirmConnectButton = popup.getByRole('button', {
            name: 'Connect',
        })
        await confirmConnectButton.click()
        await expect(confirmConnectButton).not.toBeVisible()
    }

    private async selectFromWalletPicker(
        popup: Page,
        customURL?: string
    ): Promise<void> {
        if (customURL !== undefined) {
            const customUrlInput = popup.locator('.custom-url-input')
            await customUrlInput.waitFor({ state: 'visible', timeout: 3000 })
            await customUrlInput.fill(customURL)
            await popup.locator('.btn-add').click()
            return
        }

        const walletCard = popup.locator('.wallet-card').first()
        await walletCard.waitFor({ state: 'visible', timeout: 3000 })
        await walletCard.click()
    }

    private async waitForConnectFormPopup(initialPopup: Page): Promise<Page> {
        const hasConnectForm = async (page: Page): Promise<boolean> => {
            try {
                await page
                    .getByLabel('Select a network')
                    .waitFor({ state: 'visible', timeout: 300 })
                return true
            } catch {
                try {
                    await page
                        .locator('select#network')
                        .first()
                        .waitFor({ state: 'visible', timeout: 300 })
                    return true
                } catch {
                    return false
                }
            }
        }

        // Pre-fix behavior: picker page itself transitions to connect form.
        if (await hasConnectForm(initialPopup)) {
            return initialPopup
        }

        // New behavior: picker may close and the wallet connect form appears in
        // a fresh popup. Poll the tracked popup first to avoid races.
        for (let i = 0; i < 20; i++) {
            const popup = this._popup
            if (popup && !popup.isClosed() && (await hasConnectForm(popup))) {
                return popup
            }
            await new Promise((resolve) => setTimeout(resolve, 250))
        }

        const popup = await this.dappPage.waitForEvent('popup', {
            timeout: 5000,
        })
        if (await hasConnectForm(popup)) {
            return popup
        }
        throw new Error('wallet connect form popup did not appear')
    }

    async logoutFromPopup(): Promise<void> {
        const page = await this.getPage()
        await page.logout()
        this._popup = undefined
    }

    async closePopup(): Promise<void> {
        const page = await this.getPage()
        await page.close()
        this._popup = undefined
    }

    async isPopupOpen(): Promise<boolean> {
        try {
            const page = await this.getPage()
            return page.isOpen()
        } catch {
            return false
        }
    }

    async waitForPopupClosed(): Promise<void> {
        if (this._popup) {
            await new WalletGatewayPage(this._popup).waitForClosed()
            this._popup = undefined
        }
    }

    async waitForPopupUrl(expectedUrl: string | RegExp): Promise<void> {
        const page = await this.getPage()
        return page.waitForUrl(expectedUrl)
    }
}
