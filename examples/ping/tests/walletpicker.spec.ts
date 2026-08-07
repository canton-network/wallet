// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@canton-network/core-wallet-test-utils'
import { Page } from '@playwright/test'
import {
    connectPingDapp,
    createPingDappWalletGateway,
    expectDappDisconnected,
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

    // 2. Logout from the popup and verify disconnected status.
    await test.step('log out from the popup', async () => {
        await wg.logoutFromPopup()
        await expectDappDisconnected(dappPage)
    })

    // 3. Enter an invalid URL, recover via "Try Again", and connect injected.
    const pickerPopup =
        await test.step('reopen the wallet picker', async () => {
            await expect(
                connectButton,
                'the dApp should be ready to connect again after logging out'
            ).toBeEnabled()

            const discoverPopupPromise = dappPage.waitForEvent('popup')
            await connectButton.click()
            return discoverPopupPromise
        })

    await test.step('an unreachable wallet API URL surfaces a retryable error', async () => {
        await pickerPopup
            .getByRole('textbox', { name: 'Wallet API URL' })
            .fill('thisisnotarealurl')
        await pickerPopup
            .getByRole('button', { name: 'Connect', exact: true })
            .click()

        await expect(
            pickerPopup.getByRole('button', { name: 'Try Again' }),
            'failing to reach a wallet API should show retry button'
        ).toBeVisible()
    })

    await test.step('Try Again returns to the picker without the failed entry', async () => {
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
})
