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

// TODO maybe consts should go to shared file?
const dappApiPort = 3030
const gatewayName = 'remote-da'

test('dApp: execute externally signed tx', async ({
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

    console.log('connecting...')
    await wg.connect({
        customURL: `http://localhost:${dappApiPort}/api/v0/dapp`,
        network: 'Local (OAuth IDP)',
    })
    console.log('connected...')

    await expectDappConnected(dappPage, gatewayName)

    const party1 = `test-${Date.now()}`
    const party2 = `test-${Date.now() + 1}`

    // Create a participant party named `test1`
    await wg.createWalletIfNotExists({
        partyHint: party1,
        signingProvider: 'participant',
    })
    await wg.createWalletIfNotExists({
        partyHint: party2,
        signingProvider: 'wallet-kernel',
        primary: true,
    })

    //press accounts tab
    await dappPage.getByRole('button', { name: 'Accounts' }).click()

    await expect(dappPage.getByText(`${party2}::`)).toBeDefined()

    //press ledger submission
    await dappPage.getByRole('button', { name: 'Ledger Submission' }).click()

    await expect(
        dappPage.getByRole('button', {
            name: 'create Ping contract',
            exact: true,
        })
    ).toBeEnabled()

    // Create a Ping contract through the dapp with the new party
    const commandId = await wg.approveTransaction(() =>
        dappPage
            .getByRole('button', { name: 'create Ping contract', exact: true })
            .click()
    )

    await expect(
        dappPage
            .getByRole('paragraph')
            .filter({ hasText: `"commandId": "${commandId.commandId}"` })
            .filter({ hasText: '"status": "pending"' })
    ).toHaveCount(1)
    await expect(
        dappPage
            .getByRole('paragraph')
            .filter({ hasText: `"commandId": "${commandId.commandId}"` })
            .filter({ hasText: '"status": "signed"' })
    ).toHaveCount(1)
    await expect(
        dappPage
            .getByRole('paragraph')
            .filter({
                hasText: `"commandId": "${commandId.commandId}"`,
            })
            .filter({
                hasText: '"status": "executed"',
            })
            .filter({
                hasText:
                    /"payload": \{[\s\S]*"updateId": "[^"]+"[\s\S]*"completionOffset": \d+/,
            })
    ).toHaveCount(1)

    await wg.expectActivityWithStatus(commandId.commandId, 'executed')
})

test('connection status handling edge cases', async ({ page: dappPage }) => {
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

    await expect(dappPage).toHaveTitle(/Example dApp/)

    const disconnectButton = dappPage.getByTestId('disconnect-wallet')

    // 1. Connect to a gateway -- ensure status is updated
    await expectDappDisconnected(dappPage)
    await wg.connect({
        customURL: `http://localhost:${dappApiPort}/api/v0/dapp`,
        network: 'Local (OAuth IDP)',
    })
    await expectDappConnected(dappPage, gatewayName)

    // 2. Hit disconnect button -- ensure status is updated
    await disconnectButton.click()
    await expectDappDisconnected(dappPage)

    // 3. Reconnect
    await wg.reconnect({
        customURL: `http://localhost:${dappApiPort}/api/v0/dapp`,
        network: 'Local (OAuth IDP)',
    })
    await expectDappConnected(dappPage, gatewayName)

    // 4. Hit logout button inside popup
    await wg.logoutFromPopup()
    await expectDappDisconnected(dappPage)

    // 5. Reconnect
    await wg.reconnect({
        customURL: `http://localhost:${dappApiPort}/api/v0/dapp`,
        network: 'Local (OAuth IDP)',
    })
    await expectDappConnected(dappPage, gatewayName)

    // 6. Refresh page -- ensure still connected & popup is closed
    await dappPage.reload()
    await expect(dappPage).toHaveTitle(/Example dApp/)
    await expectDappConnected(dappPage, gatewayName)
    // Verify popup is closed
    const isPopupOpen = await wg.isPopupOpen()
    expect(isPopupOpen).toBe(false)

    // 7. Open popup
    await wg.openPopup()
    const popupOpenAfterOpen = await wg.isPopupOpen()
    expect(popupOpenAfterOpen).toBe(true)
    // Verify still connected
    await expectDappConnected(dappPage, gatewayName)

    // 8. Close popup -- ensure still connected
    await wg.closePopup()
    await expectDappConnected(dappPage, gatewayName)

    // 9. Disconnect while popup closed -- ensure disconnected
    await disconnectButton.click()
    await expectDappDisconnected(dappPage)
})

test('popup opens with correct userUrl after reconnect', async ({
    page: dappPage,
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

    await expect(dappPage).toHaveTitle(/Example dApp/)

    // 1. Login
    await wg.connect({
        customURL: `http://localhost:${dappApiPort}/api/v0/dapp`,
        network: 'Local (OAuth IDP)',
    })
    await expectDappConnected(dappPage, gatewayName)

    // 2. Disconnect
    await dappPage.getByTestId('disconnect-wallet').click()
    await expectDappDisconnected(dappPage)

    // 3. Login again
    await wg.reconnect({
        customURL: `http://localhost:${dappApiPort}/api/v0/dapp`,
        network: 'Local (OAuth IDP)',
    })
    await expectDappConnected(dappPage, gatewayName)

    // 4. Open wallet and verify it opens with proper userUrl (not dApp URL)
    await wg.closePopup()
    await wg.openPopup()
    await wg.waitForPopupUrl(new RegExp(`localhost:${dappApiPort}`))
})
