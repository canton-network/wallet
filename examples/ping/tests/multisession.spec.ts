// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Tests to make sure multiple sessions can be handled correctly.

import {
    test,
    expect,
    WalletGateway,
} from '@canton-network/core-wallet-test-utils'
import { BrowserContext, Page } from '@playwright/test'
import {
    connectWalletGateway,
    createPingDappWalletGateway,
    DAPP_API_PORT,
    DAPP_URL,
    DEFAULT_NETWORK,
} from './ping-test-helpers.js'

// A popup session opened through a dApp and a direct WG tab should be
// independent: logging out of the direct tab must not close the popup.
test('logout from direct WG tab does not close the dApp popup session', async ({
    page: dappPage,
    context,
}: {
    page: Page
    context: BrowserContext
}) => {
    const wgSessionA = createPingDappWalletGateway(dappPage)

    await test.step('session A: connect through the dApp, opening a popup', async () => {
        await dappPage.goto(DAPP_URL)
        await expect(dappPage).toHaveTitle(/Example dApp/)

        await connectWalletGateway(wgSessionA, dappPage)

        expect(
            await wgSessionA.isPopupOpen(),
            'connecting through the dApp should leave its wallet popup open'
        ).toBe(true)
    })

    const directPage = await context.newPage()
    const wgSessionB = new WalletGateway({
        isPopup: false,
        page: directPage,
    })

    await test.step('session B: open the wallet gateway directly and log in', async () => {
        await directPage.goto(`http://localhost:${DAPP_API_PORT}/`)
        await wgSessionB.login(DEFAULT_NETWORK)
    })

    await test.step('logging out of session B leaves session A untouched', async () => {
        await wgSessionB.logout()

        await expect(
            directPage,
            'a directly opened gateway tab should return to /login rather than close'
        ).toHaveURL(/\/login/)
        expect(
            await wgSessionA.isPopupOpen(),
            'logging out of the direct tab should not close the dApp\'s popup session'
        ).toBe(true)
    })
})
