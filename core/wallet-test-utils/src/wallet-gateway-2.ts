// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, Page } from '@playwright/test'

// export interface NetworkFormInput {
//     id: string
//     name: string
//     description: string
//     identityProviderId: string
//     ledgerApi: string
//     synchronizerId: string
//     auth: {
//         clientId: string
//         audience: string
//         scope: string
//     }
// }

// export interface IdpFormInput {
//     id: string
//     type: 'oauth' | 'self_signed'
//     issuer: string
//     configUrl: string
// }

// export type ActivityStatus =
//     'pending' | 'signed' | 'executed' | 'failed' | 'rejected'

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

        return partyId
    }

    async allocateWalletParty(partyId: string): Promise<void> {
        await this.gotoPartiesPage()
        const walletCard = this.page
            .locator(`wg-wallet-card[party-id="${partyId}"]`)
            .first()
        await expect(walletCard).toBeVisible({ timeout: 15000 })
        const allocateButton = walletCard.getByRole('button', {
            name: 'Allocate party',
            exact: true,
        })
        if (await allocateButton.isVisible().catch(() => false)) {
            await allocateButton.click()
            await expect(allocateButton).not.toBeVisible({ timeout: 30000 })
        }
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
        if (!this.page.url().includes('/parties')) {
            await this.page.locator('button[aria-haspopup="menu"]').click()
            await this.page
                .getByRole('button', { name: 'Parties', exact: true })
                .click()
            await this.page.waitForURL(/\/parties/, { timeout: 15000 })
        }
        await this.waitForPartiesPageReady()
    }

    private async waitForPartiesPageReady(): Promise<void> {
        await expect(this.page.getByText('Loading parties...')).not.toBeVisible(
            { timeout: 30000 }
        )
        await expect(
            this.page.getByRole('button', { name: 'New' })
        ).toBeVisible({ timeout: 15000 })
    }
}
