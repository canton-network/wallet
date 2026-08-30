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
    connectWalletGateway,
    createPingDappWalletGateway,
    expectDappConnected,
    expectDappDisconnected,
    GATEWAY_NAME,
} from './ping-test-helpers.js'

test('wallet picker: handling error cases', async ({
    page: dappPage,
}: {
    page: Page
}) => {
    const wg = createPingDappWalletGateway(dappPage)
    const connectButton = dappPage.getByTestId('connect-wallet')

    // 1. Connect via custom wallet API URL and verify connected status.
    await connectPingDapp(wg, dappPage)

    // Modal connect closes the WG login popup; use dApp disconnect instead of WG logout.
    await test.step('disconnect from the dApp', async () => {
        await dappPage.getByTestId('disconnect-wallet').click()
        await expectDappDisconnected(dappPage)
    })

    const picker = await test.step('reopen the wallet picker', async () => {
        await expect(
            connectButton,
            'the dApp should be ready to connect again after logging out'
        ).toBeEnabled()
        return openWalletPicker(dappPage, connectButton)
    })

    expect(picker.kind, 'SDK default picker should be the in-page modal').toBe(
        'modal'
    )

    const host = walletPickerModalHost(dappPage)

    await test.step('an unreachable wallet API URL surfaces an error in the modal', async () => {
        await walletPickerModalRowByTitle(dappPage, 'Remote Wallet').click()
        await host.getByLabel('Remote Wallet URL').fill('thisisnotarealurl')
        await host.locator('.gateway-connect-button').click()

        await expect(
            host.locator('.discovery-modal-error[role="alert"]'),
            'failing to reach a wallet API should show an error alert in the modal'
        ).toBeVisible({ timeout: 30_000 })
        await expect(
            host.getByRole('heading', { name: 'Connect Wallet', level: 2 }),
            'error path should show the list heading together with the alert'
        ).toBeVisible()
    })

    await test.step('retry after error connects through the live gateway', async () => {
        await host.getByLabel('Close modal').click()
        await expect(dappPage.locator(WALLET_PICKER_MODAL_HOST)).toHaveCount(0)

        await connectWalletGateway(wg, dappPage)
        await expectDappConnected(dappPage, GATEWAY_NAME)
    })
})
