// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect, Page } from '@playwright/test'
import { WalletGateway } from '@canton-network/core-wallet-test-utils'
import {
    createWalletGateway,
    expectOffersBadgeCount,
    expectWalletBalance,
    fillAndSubmitTransfer,
    gotoConnect,
    gotoDashboard,
    openTransferDialog,
    openTransferOfferDialog,
    setupRegistry,
    switchWallet,
    tap,
} from './utils'

test.describe.configure({ mode: 'serial' })

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
        partyHint: `alice-cip112-${rnd}`,
        signingProvider: 'participant',
    })
    const bob = await wg.createWalletIfNotExists({
        partyHint: `bob-cip112-${rnd}`,
        signingProvider: 'participant',
    })

    await wg.setPrimaryWallet(alice)
    await setupRegistry(page)
    await gotoDashboard(page)

    return { wg, alice, bob }
}

const mockAmuletInstruments = async (
    page: Page,
    instrument: {
        paused?: boolean
        pauseInfo?: { reason?: string; until?: string }
        supportedApis?: Record<string, string>
    }
): Promise<void> => {
    await page.route('**/registry/metadata/v1/instruments**', async (route) => {
        await route.fulfill({
            json: {
                instruments: [
                    {
                        id: 'Amulet',
                        name: 'Amulet',
                        symbol: 'AMT',
                        decimals: 10,
                        paused: instrument.paused ?? false,
                        ...(instrument.pauseInfo
                            ? { pauseInfo: instrument.pauseInfo }
                            : {}),
                        supportedApis: instrument.supportedApis ?? {},
                    },
                ],
            },
        })
    })
}

const collectTransferInstructionPosts = (page: Page): string[] => {
    const urls: string[] = []
    page.on('request', (request) => {
        if (request.method() !== 'POST') return
        const url = request.url()
        if (url.includes('/registry/transfer-instruction/')) {
            urls.push(url)
        }
    })
    return urls
}

test.describe('CIP-112 portfolio transfer', () => {
    test('paused instrument disables Make Transfer', async ({
        page: dappPage,
    }) => {
        const { wg } = await setupTransferTest(dappPage)

        await tap(dappPage, wg, '100')
        await mockAmuletInstruments(dappPage, {
            paused: true,
            pauseInfo: { reason: 'e2e-pause' },
        })
        await gotoDashboard(dappPage)

        await openTransferDialog(dappPage)

        const dialog = dappPage.getByRole('dialog')
        await dialog.getByRole('combobox', { name: 'Select asset' }).click()
        await dappPage.getByRole('option', { name: /AMT/ }).click()

        await expect(
            dialog.getByText(/This instrument is paused: e2e-pause/)
        ).toBeVisible()
        await expect(
            dialog.getByRole('button', { name: 'Make Transfer' })
        ).toBeDisabled()
    })

    test('two-step Amulet transfer with apiVersion auto', async ({
        page: dappPage,
    }) => {
        const { wg, alice, bob } = await setupTransferTest(dappPage)
        const transferPosts = collectTransferInstructionPosts(dappPage)

        await tap(dappPage, wg, '1234')
        await expectWalletBalance(dappPage, alice, '1234')

        const message = 'cip112 auto transfer ' + Date.now()
        await gotoDashboard(dappPage)
        await expectOffersBadgeCount(dappPage, 0)

        await openTransferDialog(dappPage)
        const dialog = dappPage.getByRole('dialog')
        await dialog.getByRole('combobox', { name: 'Select asset' }).click()
        await expect(
            dappPage.getByRole('option', { name: /AMT/ })
        ).toBeVisible()
        await expect(
            dappPage.getByRole('option', { name: /paused/i })
        ).toHaveCount(0)
        await dappPage.keyboard.press('Escape')

        await fillAndSubmitTransfer(dappPage, wg, {
            amount: '321',
            recipient: bob,
            message,
        })

        expect(
            transferPosts.some((url) =>
                url.includes('/registry/transfer-instruction/v1/transfer-factory')
            )
        ).toBe(true)

        await expectOffersBadgeCount(dappPage, 1)

        await switchWallet(dappPage, wg, bob)
        await gotoDashboard(dappPage)
        await expectOffersBadgeCount(dappPage, 1)

        const offerDialog = await openTransferOfferDialog(dappPage, {
            amount: '321',
            message,
        })

        await wg.approveTransaction(() =>
            offerDialog.getByRole('button', { name: 'Accept' }).click()
        )

        expect(
            transferPosts.some((url) =>
                url.includes('/choice-contexts/accept')
            )
        ).toBe(true)

        await expectWalletBalance(dappPage, bob, '321')
        await expectOffersBadgeCount(dappPage, 0)

        await switchWallet(dappPage, wg, alice)
        await expectWalletBalance(dappPage, alice, '913')
    })

    test('auto falls back from advertised V2 to V1 factory', async ({
        page: dappPage,
    }) => {
        const { wg, alice, bob } = await setupTransferTest(dappPage)
        const transferPosts = collectTransferInstructionPosts(dappPage)

        await tap(dappPage, wg, '1234')
        await mockAmuletInstruments(dappPage, {
            supportedApis: {
                'splice-api-token-transfer-instruction-v2': '1.0.0',
            },
        })
        await gotoDashboard(dappPage)

        const message = 'cip112 v2 fallback ' + Date.now()
        await openTransferDialog(dappPage)
        await fillAndSubmitTransfer(dappPage, wg, {
            amount: '321',
            recipient: bob,
            message,
        })

        expect(
            transferPosts.some((url) =>
                url.includes('/registry/transfer-instruction/v2/transfer-factory')
            )
        ).toBe(true)
        expect(
            transferPosts.some((url) =>
                url.includes('/registry/transfer-instruction/v1/transfer-factory')
            )
        ).toBe(true)

        await switchWallet(dappPage, wg, bob)
        await gotoDashboard(dappPage)

        const offerDialog = await openTransferOfferDialog(dappPage, {
            amount: '321',
            message,
        })

        await wg.approveTransaction(() =>
            offerDialog.getByRole('button', { name: 'Accept' }).click()
        )

        expect(
            transferPosts.some((url) => url.includes('/choice-contexts/accept'))
        ).toBe(true)

        await expectWalletBalance(dappPage, bob, '321')
        await switchWallet(dappPage, wg, alice)
        await expectWalletBalance(dappPage, alice, '913')
    })
})
