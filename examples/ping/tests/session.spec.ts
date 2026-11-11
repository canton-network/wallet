// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Tests that a gateway session survives what other tabs and the network do to it.

import {
    test,
    expect,
    WalletGateway,
} from '@canton-network/core-wallet-test-utils'
import type { Page } from '@playwright/test'
import {
    DAPP_API_PORT,
    DEFAULT_NETWORK,
    SECOND_OAUTH_NETWORK,
} from './ping-test-helpers.js'

const GATEWAY_URL = `http://localhost:${DAPP_API_PORT}`

const openGateway = async (page: Page): Promise<WalletGateway> => {
    await page.goto(`${GATEWAY_URL}/`)
    return new WalletGateway({ isPopup: false, page })
}

test('an OAuth login connects to the network chosen in its tab', async ({
    page,
    context,
}) => {
    const wgA = await openGateway(page)
    const wgB = await openGateway(await context.newPage())

    // While tab A waits at the IdP, the user logs in to another network in tab B
    await wgA.login(DEFAULT_NETWORK, {
        whileAtIdp: () => wgB.login(SECOND_OAUTH_NETWORK),
    })

    await wgA.expectConnectedNetwork('canton:local-oauth')
    await wgB.expectConnectedNetwork('canton:local-oauth-2')
})

test('a session survives a page load without a gateway response', async ({
    page,
}) => {
    const wg = await openGateway(page)
    await wg.login(DEFAULT_NETWORK)

    await test.step('reload while user API requests get no response', async () => {
        await page.route('**/api/v0/user', (route) => route.abort())
        await page.reload()

        await expect(
            page.getByText('Resource Unavailable').first(),
            'the failed session check should be reported'
        ).toBeVisible()
        expect(page.url(), 'the gateway should not log out').toMatch(
            /\/parties/
        )
    })

    await test.step('reload once the gateway responds again', async () => {
        await page.unroute('**/api/v0/user')
        await page.reload()

        await expect(
            page.getByRole('heading', { name: 'Parties' }),
            'the session should still be valid'
        ).toBeVisible()
        await expect(page).toHaveURL(/\/parties/)
    })
})
