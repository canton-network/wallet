// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    test,
    expect,
    WalletGateway,
} from '@canton-network/core-wallet-test-utils'
import { Page } from '@playwright/test'
import {
    expectDappConnected,
    expectDappDisconnected,
} from './ping-test-helpers.js'

const dappApiPort = 3030

test('wallet picker: handling error cases', async ({
    page: dappPage,
}: {
    page: Page
}) => {
    const wg = new WalletGateway({
        dappPage,
        openButton: (page) =>
            page.getByRole('button', {
                name: 'open Wallet',
            }),
        connectButton: (page) =>
            page.getByRole('button', {
                name: 'connect to Wallet',
            }),
    })
    await dappPage.goto('http://localhost:8080/')

    // Expect a title "to contain" a substring.
    await expect(dappPage).toHaveTitle(/Example dApp/)

    const connectButton = dappPage.getByTestId('connect-wallet')

    // 1. Connect via custom wallet API URL and verify connected status.
    await wg.connect({
        customURL: `http://localhost:${dappApiPort}/api/v0/dapp`,
        network: 'Local (OAuth IDP)',
    })
    await expectDappConnected(dappPage, 'remote-da')

    // 2. Logout from the popup and verify disconnected status.
    await wg.logoutFromPopup()
    await expectDappDisconnected(dappPage)

    // 3. Enter an invalid URL, recover via "Try Again", and connect injected.
    await expect(connectButton).toBeEnabled()
    const discoverPopupPromise = dappPage.waitForEvent('popup')
    await connectButton.click()
    const pickerPopup = await discoverPopupPromise

    await pickerPopup
        .getByRole('textbox', { name: 'Wallet API URL' })
        .fill('thisisnotarealurl')
    await pickerPopup
        .getByRole('button', { name: 'Connect', exact: true })
        .click()
    await expect(
        pickerPopup.getByRole('button', {
            name: 'Try Again',
        })
    ).toBeVisible()
    await pickerPopup.getByRole('button', { name: 'Try Again' }).click()

    await expect(
        pickerPopup.getByRole('textbox', { name: 'Wallet API URL' }),
        'Try Again should return to the wallet picker list'
    ).toBeVisible()
    await expect(
        pickerPopup.getByRole('button', {
            name: 'Connect to thisisnotarealurl',
        }),
        'the entry that failed to connect should not be offered again'
    ).toHaveCount(0)
})
