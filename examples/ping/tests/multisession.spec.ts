// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Tests to make sure multiple sessions can be handled correctly.

import {
    test,
    expect,
    WalletGateway,
    WalletGatewayPage,
} from '@canton-network/core-wallet-test-utils'
import { BrowserContext, Page } from '@playwright/test'

const dappApiPort = 3030

// A popup session opened through a dApp and a direct WG tab should be
// independent: logging out of the direct tab must not close the popup.
test('logout from direct WG tab does not close the dApp popup session', async ({
    page: dappPage,
    context,
}: {
    page: Page
    context: BrowserContext
}) => {
    const wgSessionA = new WalletGateway({
        dappPage,
        openButton: (page) => page.getByRole('button', { name: 'open Wallet' }),
        connectButton: (page) =>
            page.getByRole('button', { name: 'connect to Wallet' }),
    })
    await dappPage.goto('http://localhost:8080/')
    await expect(dappPage).toHaveTitle(/Example dApp/)

    // 1. Connect to the WG through the dApp — this opens a popup (session A).
    await wgSessionA.connect({
        customURL: `http://localhost:${dappApiPort}/api/v0/dapp`,
        network: 'Local (OAuth IDP)',
    })
    expect(await wgSessionA.isPopupOpen()).toBe(true)

    // 2. Open the WG directly in a second tab and log in (session B).
    const directPage = await context.newPage()
    await directPage.goto(`http://localhost:${dappApiPort}/`)
    const wgSessionB = new WalletGatewayPage(directPage)
    await wgSessionB.login('Local (OAuth IDP)')

    // 3. Logout from session B.
    //    The direct tab should redirect to /login, not close.
    //    The popup from session A should remain open.
    await wgSessionB.logout()

    expect(await wgSessionA.isPopupOpen()).toBe(true)
    await expect(directPage).toHaveURL(/\/login/)
})
