// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, Locator, Page } from '@playwright/test'

export interface NetworkFormInput {
    id: string
    name: string
    description: string
    identityProviderId: string
    ledgerApi: string
    synchronizerId: string
    auth: {
        clientId: string
        audience: string
        scope: string
    }
}

export interface IdpFormInput {
    id: string
    type: 'oauth' | 'self_signed'
    issuer: string
    configUrl: string
}

export type ActivityStatus =
    'pending' | 'signed' | 'executed' | 'failed' | 'rejected'

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
        signingProvider:
            | 'participant'
            | 'wallet-kernel'
            | 'blockdaemon'
            | 'dfns'
            | 'fireblocks'
        vaultName?: string
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

        if (args.signingProvider === 'fireblocks') {
            if (!args.vaultName) {
                throw new Error(
                    'vaultName is required when signingProvider is fireblocks'
                )
            }
            const vaultSelect = this.page.getByLabel('Vault name')
            await expect(
                vaultSelect.getByRole('option', { name: args.vaultName })
            ).toBeAttached({ timeout: 15000 })
            await vaultSelect.selectOption({ label: args.vaultName })
        }

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

    async getWalletExternalTxId(partyId: string): Promise<string> {
        await this.gotoPartiesPage()
        const walletCard = this.page
            .locator(`wg-wallet-card[party-id="${partyId}"]`)
            .first()
        await expect(walletCard).toBeVisible({ timeout: 15000 })
        const metaDiv = walletCard.locator('.meta').first()
        await expect(metaDiv).toHaveAttribute(
            'data-test-external-tx-id',
            /.+/,
            { timeout: 15000 }
        )
        const externalTxId = await metaDiv.getAttribute(
            'data-test-external-tx-id'
        )
        if (!externalTxId) {
            throw new Error(`No externalTxId found for party ${partyId}`)
        }
        return externalTxId
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
        network: string
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
            throw new Error('popup closed: call openPopup() first')
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
        signingProvider:
            | 'participant'
            | 'wallet-kernel'
            | 'blockdaemon'
            | 'dfns'
            | 'fireblocks'
        vaultName?: string
        primary?: boolean
    }): Promise<string> {
        const page = await this.getPage()
        return page.createWalletIfNotExists(args)
    }

    async getWalletExternalTxId(partyId: string): Promise<string> {
        const page = await this.getPage()
        return page.getWalletExternalTxId(partyId)
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

    async rejectTransaction(
        start: () => Promise<void>,
        opts?: { waitForClose?: boolean }
    ): Promise<{
        commandId: string
    }> {
        await start()

        const popupPage = await this.popup()
        await expect(
            await popupPage.getByRole('button', { name: 'Reject' })
        ).toBeVisible({ timeout: 15000 })
        const rejectButton = await popupPage.getByRole('button', {
            name: 'Reject',
        })

        const commandId = new URL(popupPage.url()).searchParams.get('commandId')
        if (!commandId) throw new Error('Approve popup has no commandId in URL')
        popupPage.once('dialog', async (dialog) => {
            expect(dialog.type()).toBe('confirm')

            await dialog.accept()
        })

        await rejectButton.click()

        if (opts?.waitForClose !== false) {
            await this.waitForPopupToCloseAfterAction(popupPage)
        }
        return { commandId }
    }

    async executeSignedTransaction(opts?: {
        waitForClose?: boolean
    }): Promise<void> {
        const popupPage = await this.popup()
        const approveButton = await popupPage.getByRole('button', {
            name: 'Approve',
        })
        await expect(approveButton).toBeVisible({ timeout: 15000 })
        await approveButton.click()

        if (opts?.waitForClose !== false) {
            await this.waitForPopupToCloseAfterAction(popupPage)
        }
    }

    async reconnect(args: {
        network: string
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

    private async waitForPopupToCloseAfterAction(
        popupPage: Page
    ): Promise<void> {
        // For dApp-triggered approvals the popup is opened with
        // `closeafteraction`, so success is signalled by the popup closing.
        try {
            await popupPage.waitForEvent('close', { timeout: 30000 })
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

    private async gotoPartiesPage(): Promise<void> {
        const popup = await this.popup()
        await popup.locator('button[aria-haspopup="menu"]').click()
        await popup
            .getByRole('button', { name: 'Parties', exact: true })
            .click()
        await this.waitForPartiesPageReady()
    }

    private async waitForPartiesPageReady(): Promise<void> {
        const popup = await this.popup()
        await expect(popup.getByRole('button', { name: 'New' })).toBeVisible({
            timeout: 15000,
        })
        await expect(popup.getByText('Loading parties...')).not.toBeVisible()
    }

    async gotoNetworksPage(): Promise<void> {
        const popup = await this.popup()
        await popup.locator('button[aria-haspopup="menu"]').click()
        await popup
            .getByRole('button', { name: 'Networks', exact: true })
            .click()
        await this.waitForNetworksPageReady()
    }

    async hasNewNetworkButton(): Promise<boolean> {
        const popup = await this.popup()
        return (
            (await popup
                .getByRole('button', { name: 'New', exact: true })
                .count()) > 0
        )
    }

    async addNetwork(network: NetworkFormInput): Promise<void> {
        await this.gotoNetworksPage()
        const popup = await this.popup()

        const newButton = popup.getByRole('button', {
            name: 'New',
            exact: true,
        })
        await expect(newButton).toBeVisible({ timeout: 15000 })
        await newButton.click()

        await expect(
            popup.getByRole('heading', { name: 'Add a new network' })
        ).toBeVisible({ timeout: 15000 })

        await this.fillNetworkForm(network)

        await popup.locator('[data-test-id="add-network-button"]').click()
        await this.waitForNetworksPageReady()
    }

    async updateNetworkName(networkId: string, newName: string): Promise<void> {
        await this.openNetworkReview(networkId)
        const popup = await this.popup()

        await this.fillNetworkFormField('Name', newName)
        await popup.locator('[data-test-id="update-network-button"]').click()
        await this.waitForNetworksPageReady()
    }

    async findNetworkCard(networkId: string): Promise<Locator> {
        await this.waitForNetworksPageReady()
        return this.findInPaginatedList(
            `Network card for "${networkId}"`,
            (popup) =>
                popup.locator('network-card').filter({ hasText: networkId })
        )
    }

    async expectFirstNetworkNotEditable(): Promise<void> {
        const popup = await this.popup()
        await this.waitForNetworksPageReady()

        const firstCard = popup.locator('network-card').first()
        await expect(firstCard).toBeVisible({ timeout: 15000 })

        // Nothing changes
        await expect(popup).toHaveURL('http://localhost:3030/networks/', {
            timeout: 15000,
        })
    }

    private async openNetworkReview(networkId: string): Promise<void> {
        const card = await this.findNetworkCard(networkId)
        await card.click()

        const popup = await this.popup()
        await expect(
            popup.getByRole('heading', { name: 'Review network' })
        ).toBeVisible({ timeout: 15000 })
    }

    private async fillNetworkForm(network: NetworkFormInput): Promise<void> {
        const popup = await this.popup()

        await this.fillNetworkFormField('Network Id', network.id)
        await this.fillNetworkFormField('Name', network.name)
        await this.fillNetworkFormField('Description', network.description)
        await this.fillNetworkFormField(
            'Synchronizer Id',
            network.synchronizerId
        )
        await this.fillNetworkFormField(
            'Identity Provider Id',
            network.identityProviderId
        )
        await this.fillNetworkFormField(
            'Ledger API Base Url',
            network.ledgerApi
        )

        await popup
            .locator('[data-test-id="auth-editor-client-id-input"]')
            .first()
            .fill(network.auth.clientId)
        await popup
            .locator('[data-test-id="auth-editor-audience-input"]')
            .first()
            .fill(network.auth.audience)
        await popup
            .locator('[data-test-id="auth-editor-scope-input"]')
            .first()
            .fill(network.auth.scope)
    }

    private async fillNetworkFormField(
        label: string,
        value: string
    ): Promise<void> {
        const popup = await this.popup()
        // The form labels aren't associated with their inputs via `for`, so
        // locate the input via the field group that contains the label text.
        const input = popup
            .locator(
                `network-form .field-group:has(> label:has-text("${label}")) input`
            )
            .first()
        await expect(input).toBeVisible({ timeout: 15000 })
        await input.fill(value)
    }

    // Traverse pagination looking for a specific card defined by buildItemLocator
    // Wait for page to be ready (with first page loaded) before calling it
    private async findInPaginatedList(
        itemDescription: string,
        buildItemLocator: (popup: Page) => Locator,
        options?: { afterPageChange?: () => Promise<void> }
    ): Promise<Locator> {
        const popup = await this.popup()
        const pagination = popup.locator('wg-pagination').first()

        for (let guard = 0; guard < 25; guard++) {
            const item = buildItemLocator(popup).first()
            if ((await item.count()) > 0) {
                await expect(item).toBeVisible({ timeout: 5000 })
                return item
            }

            if ((await pagination.count()) === 0) {
                break
            }

            const nextButton = pagination.getByRole('button', {
                name: 'Next page',
            })
            if (!(await nextButton.isEnabled())) {
                break
            }

            const rangeLabel = pagination.locator('.pagination span')
            const before = (await rangeLabel.textContent()) ?? ''
            await nextButton.click()
            await expect(rangeLabel).not.toHaveText(before, {
                timeout: 10000,
            })
            if (options?.afterPageChange) {
                await options.afterPageChange()
            }
        }

        throw new Error(`${itemDescription} not found in the list`)
    }

    private async waitForNetworksPageReady(): Promise<void> {
        const popup = await this.popup()
        await expect(
            popup.getByRole('heading', { name: 'Networks' })
        ).toBeVisible({ timeout: 15000 })

        await expect(popup.locator('network-card').first()).toBeVisible({
            timeout: 15000,
        })
    }

    async gotoIdentityProvidersPage(): Promise<void> {
        const popup = await this.popup()
        await popup.locator('button[aria-haspopup="menu"]').click()
        await popup
            .getByRole('button', { name: 'Identity Providers', exact: true })
            .click()
        await this.waitForIdentityProvidersPageReady()
    }

    async hasNewIdpButton(): Promise<boolean> {
        const popup = await this.popup()
        return (
            (await popup
                .getByRole('button', { name: 'New', exact: true })
                .count()) > 0
        )
    }

    async addIdp(idp: IdpFormInput): Promise<void> {
        await this.gotoIdentityProvidersPage()
        const popup = await this.popup()

        const newButton = popup.getByRole('button', {
            name: 'New',
            exact: true,
        })
        await expect(newButton).toBeVisible({ timeout: 15000 })
        await newButton.click()

        await expect(
            popup.getByRole('heading', {
                name: 'Add a new identity provider',
            })
        ).toBeVisible({ timeout: 15000 })

        await this.fillIdpForm(idp)

        await popup.getByRole('button', { name: 'Add', exact: true }).click()
        await this.waitForIdentityProvidersPageReady()
    }

    async updateIdpIssuer(idpId: string, issuer: string): Promise<void> {
        await this.openIdpReview(idpId)
        const popup = await this.popup()

        await popup.locator('#idp-issuer').fill(issuer)
        await popup.getByRole('button', { name: 'Update', exact: true }).click()
        await this.waitForIdentityProvidersPageReady()
    }

    async findIdpCard(idpId: string): Promise<Locator> {
        await this.waitForIdentityProvidersPageReady()
        return this.findInPaginatedList(
            `Identity provider card for "${idpId}"`,
            (popup) => popup.locator('idp-card').filter({ hasText: idpId })
        )
    }

    async expectFirstIdpNotEditable(): Promise<void> {
        const popup = await this.popup()
        await this.waitForIdentityProvidersPageReady()

        const firstCard = popup.locator('idp-card').first()
        await expect(firstCard).toBeVisible({ timeout: 15000 })
        await firstCard.click()

        await expect(popup).toHaveURL(/\/identity-providers\/?$/, {
            timeout: 15000,
        })
        await expect(
            popup.getByRole('heading', { name: 'Review Identity Provider' })
        ).toHaveCount(0)
    }

    private async openIdpReview(idpId: string): Promise<void> {
        const card = await this.findIdpCard(idpId)
        await card.click()

        const popup = await this.popup()
        await expect(
            popup.getByRole('heading', { name: 'Review Identity Provider' })
        ).toBeVisible({ timeout: 15000 })
    }

    private async fillIdpForm(idp: IdpFormInput): Promise<void> {
        const popup = await this.popup()

        await popup.locator('#idp-id').fill(idp.id)
        await popup.locator('#idp-type').selectOption(idp.type)
        await popup.locator('#idp-issuer').fill(idp.issuer)
        if (idp.type === 'oauth') {
            if (!idp.configUrl) {
                throw new Error('configUrl is required for oauth IDPs')
            }
            await popup.locator('#idp-config-url').fill(idp.configUrl)
        }
    }

    private async waitForIdentityProvidersPageReady(): Promise<void> {
        const popup = await this.popup()
        await expect(
            popup.getByRole('heading', { name: 'Identity Providers' })
        ).toBeVisible({ timeout: 15000 })
        await expect(popup.locator('idp-card').first()).toBeVisible({
            timeout: 15000,
        })
    }

    async expectActivityWithStatus(
        commandId: string,
        status: ActivityStatus
    ): Promise<void> {
        if (!(await this.isPopupOpen())) {
            await this.openPopup()
        }
        await this.gotoActivitiesPage()
        const card = await this.findActivityCard(commandId)
        await expect(card.locator('.status-badge')).toHaveText(status, {
            timeout: 15000,
        })
    }

    async gotoActivitiesPage(): Promise<void> {
        const popup = await this.popup()
        await popup.locator('button[aria-haspopup="menu"]').click()
        await popup
            .getByRole('button', { name: 'Activities', exact: true })
            .click()
        await this.waitForActivitiesPageReady()
    }

    private async findActivityCard(commandId: string): Promise<Locator> {
        await this.waitForActivitiesPageReady()
        const popup = await this.popup()
        return this.findInPaginatedList(
            `Activity card for command id "${commandId}"`,
            (page) =>
                page.getByRole('button', {
                    name: `Open activity ${commandId}`,
                }),
            {
                afterPageChange: async () => {
                    await expect(
                        popup.getByText('Loading activities...')
                    ).not.toBeVisible()
                },
            }
        )
    }

    private async waitForActivitiesPageReady(): Promise<void> {
        const popup = await this.popup()
        await expect(
            popup.getByRole('heading', { name: 'Activities' })
        ).toBeVisible({ timeout: 15000 })
        await expect(popup.getByText('Loading activities...')).not.toBeVisible()
    }
}
