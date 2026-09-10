// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    expect,
    openWalletPicker,
    test,
    WALLET_PICKER_MODAL_HOST,
    walletPickerModalHost,
    walletPickerModalRowByTitle,
} from '@canton-network/core-wallet-test-utils'
import type { Page } from '@playwright/test'
import {
    connectPingDapp,
    createPingDappWalletGateway,
    DAPP_URL,
    expectDappConnected,
    expectDappDisconnected,
    GATEWAY_NAME,
} from './ping-test-helpers.js'

test.describe('wallet picker modal (SDK default)', () => {
    test('connect opens an in-page modal, not a picker popup', async ({
        page: dappPage,
    }: {
        page: Page
    }) => {
        await dappPage.goto(DAPP_URL)
        await expect(dappPage).toHaveTitle(/Example dApp/)
        await expectDappDisconnected(dappPage)

        const connectButton = dappPage.getByTestId('connect-wallet')
        const picker = await openWalletPicker(dappPage, connectButton)

        expect(picker.kind).toBe('modal')

        const host = walletPickerModalHost(dappPage)
        await expect(
            host,
            'SDK default should mount the in-page wallet picker modal'
        ).toBeAttached()
        await expect(
            host.getByRole('heading', { name: 'Connect Wallet', level: 2 }),
            'modal title should be Connect Wallet'
        ).toBeVisible()
        await expect(
            walletPickerModalRowByTitle(dappPage, 'Remote Wallet'),
            'modal list should include the Remote Wallet entry'
        ).toBeVisible()
        await expect(
            host.getByRole('link', { name: /Need a wallet/i }),
            'modal footer should offer Need a wallet?'
        ).toBeVisible()

        await host.getByLabel('Close modal').click()
        await expect(host).toHaveCount(0)
        await expectDappDisconnected(dappPage)
    })

    test('backdrop dismiss and Remote Wallet back stay on the dApp page', async ({
        page: dappPage,
    }: {
        page: Page
    }) => {
        await dappPage.goto(DAPP_URL)
        await expectDappDisconnected(dappPage)

        const connectButton = dappPage.getByTestId('connect-wallet')
        const picker = await openWalletPicker(dappPage, connectButton)
        expect(picker.kind).toBe('modal')

        const host = walletPickerModalHost(dappPage)
        await walletPickerModalRowByTitle(dappPage, 'Remote Wallet').click()
        await expect(
            host.getByRole('heading', { name: 'Remote Wallet', level: 2 })
        ).toBeVisible()
        await expect(host.getByLabel('Remote Wallet URL')).toBeVisible()

        await host.getByLabel('Go back').click()
        await expect(
            host.getByRole('heading', { name: 'Connect Wallet', level: 2 })
        ).toBeVisible()
        await expect(host).toBeAttached()
        await expectDappDisconnected(dappPage)

        // Click the backdrop node itself (handler requires target === backdrop).
        await host.locator('.discovery-modal-backdrop').evaluate((el) => {
            el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        })
        await expect(dappPage.locator(WALLET_PICKER_MODAL_HOST)).toHaveCount(0)
        await expectDappDisconnected(dappPage)
    })

    test('connects through the modal to the live remote Wallet Gateway', async ({
        page: dappPage,
    }: {
        page: Page
    }) => {
        const wg = createPingDappWalletGateway(dappPage)
        await connectPingDapp(wg, dappPage)
        await expectDappConnected(dappPage, GATEWAY_NAME)

        await expect(
            dappPage.locator(WALLET_PICKER_MODAL_HOST),
            'modal should be gone after a successful connection'
        ).toHaveCount(0)

        await dappPage.getByTestId('disconnect-wallet').click()
        await expectDappDisconnected(dappPage)
    })
})
