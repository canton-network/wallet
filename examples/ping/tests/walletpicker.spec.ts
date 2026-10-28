// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    test,
    expect,
    openWalletPicker,
} from '@canton-network/core-wallet-test-utils'
import type { Page } from '@playwright/test'
import {
    connectPingDapp,
    createPingDappWalletGateway,
    DAPP_API_URL,
    DAPP_URL,
    DEFAULT_NETWORK,
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
                name: /^Connect to (custom wallet )?thisisnotarealurl/,
            }),
            'the entry that failed to connect should not be offered again'
        ).toHaveCount(0)
    })
})

// The same gateway as DAPP_API_URL, but under a URL the dApp does not
// register, so the picker lists it as a custom wallet.
const CUSTOM_API_URL = DAPP_API_URL.replace('localhost', '127.0.0.1')

test('wallet picker: renaming a saved custom wallet', async ({
    page: dappPage,
}: {
    page: Page
}) => {
    const wg = createPingDappWalletGateway(dappPage)
    const connectButton = dappPage.getByTestId('connect-wallet')
    const customName = 'My local gateway'

    const customWalletCard = (picker: Page, name: string) =>
        picker.getByRole('button', { name: `Connect to custom wallet ${name}` })

    // 1. Connecting via the custom wallet API URL saves it in the picker.
    await test.step('connect the ping dApp via a custom wallet API URL', async () => {
        await dappPage.goto(DAPP_URL)
        await wg.connect({
            customURL: CUSTOM_API_URL,
            network: DEFAULT_NETWORK,
        })
        await expectDappConnected(dappPage, GATEWAY_NAME)
    })

    await test.step('log out from the popup', async () => {
        await wg.logoutFromPopup()
        await expectDappDisconnected(dappPage)
    })

    // 2. Rename the saved entry and connect through it.
    await wg.connect({
        network: DEFAULT_NETWORK,
        selectWallet: async (picker) => {
            await test.step('the saved custom wallet is named after its URL', async () => {
                const card = customWalletCard(picker, CUSTOM_API_URL)
                await expect(
                    card,
                    'connecting via a custom URL should save it in the picker'
                ).toBeVisible()
            })

            await test.step(`rename the saved custom wallet to ${customName}`, async () => {
                await picker
                    .getByRole('button', { name: 'Rename', exact: true })
                    .click()

                const nameInput = picker.getByRole('textbox', { name: 'Label' })
                await expect(
                    nameInput,
                    'the rename input should be focused'
                ).toBeFocused()
                await expect(
                    nameInput,
                    'an unnamed custom wallet should start with an empty name'
                ).toHaveValue('')
                await nameInput.fill(customName)
                await nameInput.press('Enter')
            })

            await test.step('the renamed wallet still reveals its URL', async () => {
                const card = customWalletCard(picker, customName)
                await expect(
                    card,
                    'the custom wallet should be shown with its new name'
                ).toBeVisible()
                await expect(
                    card,
                    'a renamed custom wallet should show its URL to prevent impersonation'
                ).toContainText(CUSTOM_API_URL)
                await card.click()
            })
        },
    })
    await expectDappConnected(dappPage, GATEWAY_NAME)

    await test.step('log out from the popup', async () => {
        await wg.logoutFromPopup()
        await expectDappDisconnected(dappPage)
    })

    // 3. The SDK saves the selected name again on connect, so it must keep it.
    const pickerPopup = await openWalletPicker(dappPage, connectButton)

    await test.step('the new name survives reconnecting', async () => {
        await expect(
            customWalletCard(pickerPopup, customName),
            'reconnecting via a renamed wallet should keep its name'
        ).toBeVisible()
    })

    await test.step('cancelling a rename keeps the current name', async () => {
        await pickerPopup
            .getByRole('button', { name: 'Rename', exact: true })
            .click()
        const nameInput = pickerPopup.getByRole('textbox', { name: 'Label' })
        await expect(
            nameInput,
            'renaming should start from the current name'
        ).toHaveValue(customName)
        await nameInput.fill('Discarded name')
        await pickerPopup.getByRole('button', { name: 'Cancel' }).click()

        await expect(
            customWalletCard(pickerPopup, customName),
            'cancelling should discard the edited name'
        ).toBeVisible()
    })

    await test.step('saving an empty name resets it to the URL', async () => {
        await pickerPopup
            .getByRole('button', { name: 'Rename', exact: true })
            .click()
        await pickerPopup.getByRole('textbox', { name: 'Label' }).clear()
        await pickerPopup.getByRole('button', { name: 'Save' }).click()

        await expect(
            customWalletCard(pickerPopup, CUSTOM_API_URL),
            'an empty name should fall back to the URL'
        ).toBeVisible()
        await expect(
            customWalletCard(pickerPopup, customName),
            'the old name should be gone'
        ).toHaveCount(0)
    })

    await test.step('the reset survives reopening the picker', async () => {
        await pickerPopup.close()
        await expect(
            connectButton,
            'closing the picker should let the dApp connect again'
        ).toBeEnabled()
        const reopenedPicker = await openWalletPicker(dappPage, connectButton)
        await expect(
            customWalletCard(reopenedPicker, CUSTOM_API_URL),
            'the reset name should be persisted'
        ).toBeVisible()
    })
})
