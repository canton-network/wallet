// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test'
import {
    createGatewayApi,
    connectGateway,
    createWalletGateway,
    gotoConnect,
    gotoDashboard,
    setupRegistry,
    tap,
} from './utils'

// Wallet detail tests involve wallet setup and a tap transaction, so give them
// more time than the default 30s.
test.setTimeout(120_000)

test('wallet detail page - assets and transaction history', async ({
    page: dappPage,
}) => {
    const rnd = Math.floor(Math.random() * 100000)
    const wg = createWalletGateway(dappPage)

    // Scaffolding: the wallet just has to exist and be primary, so it is
    // created through the wallet's API instead of its UI.
    const api = await createGatewayApi()
    const aliceHint = `alice-${rnd}`
    await api.createWallet({
        partyHint: aliceHint,
        signingProvider: 'participant',
        primary: true,
    })

    await gotoConnect(dappPage)
    await connectGateway(wg)

    await setupRegistry(dappPage)
    await tap(dappPage, wg, '2000')
    await gotoDashboard(dappPage)

    await dappPage
        .getByRole('link', { name: new RegExp(`^${aliceHint}`) })
        .click()

    const main = dappPage.locator('main')
    await expect(main.getByRole('heading', { name: aliceHint })).toBeVisible({
        timeout: 10000,
    })
    await expect(main.getByText('Primary')).toBeVisible()
    await expect(main.getByRole('heading', { name: 'Assets' })).toBeVisible()
    await expect(
        main.getByRole('heading', { name: 'Transaction History' })
    ).toBeVisible()
    await expect(main.getByRole('button', { name: 'Transfer' })).toBeEnabled()

    await expect(main.getByLabel(/Total balance: 2000 AMT/)).toBeVisible({
        timeout: 15000,
    })

    const transactionHistory = main.getByRole('table', {
        name: 'Transaction history',
    })
    await expect(transactionHistory).toBeVisible()
    await expect(
        transactionHistory.getByRole('cell', { name: 'Amulet' }).first()
    ).toBeVisible({ timeout: 15000 })
    await expect(transactionHistory.getByText(/\+2000\b/)).toBeVisible({
        timeout: 15000,
    })

    await dappPage.getByRole('link', { name: 'Dashboard' }).click()
    await expect(
        dappPage.getByRole('heading', { name: 'Dashboard' })
    ).toBeVisible()
})
