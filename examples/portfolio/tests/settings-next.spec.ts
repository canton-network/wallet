// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test'
import {
    createWalletGateway,
    expectWalletBalance,
    gotoConnect,
    setupRegistry,
    tap,
} from './next-utils'

// Settings tests involve wallet setup and a tap transaction, so give them
// more time than the default 30s.
test.setTimeout(120_000)

test('registry management', async ({ page: dappPage }) => {
    const wg = createWalletGateway(dappPage)

    // The dashboard settings page requires a connected wallet.
    await gotoConnect(dappPage)
    await wg.connect({ network: 'LocalNet' })

    // Wait for the connect page to redirect once the connection is established,
    // otherwise navigating to settings bounces back to the connect page.
    await expect(
        dappPage.getByRole('heading', { name: 'Dashboard' })
    ).toBeVisible({ timeout: 15000 })

    await setupRegistry(dappPage)

    const registriesSection = dappPage.locator(
        'section[aria-labelledby="registries-heading"]'
    )

    // Verify the registry was added with the DSO party ID and registry URL.
    await expect(
        registriesSection.getByRole('heading', { name: 'Registries' })
    ).toBeVisible()
    await expect(registriesSection.getByText(/^DSO::/)).toBeVisible()
    await expect(
        registriesSection.getByText('http://scan.localhost:4000')
    ).toBeVisible()

    // Delete the registry and verify the table is empty again.
    await registriesSection.getByRole('button', { name: 'Delete' }).click()
    await expect(
        registriesSection.getByText('No registries configured')
    ).toBeVisible({ timeout: 10000 })
})

test('tap via settings page', async ({ page: dappPage }) => {
    const rnd = Math.floor(Math.random() * 100000)
    const wg = createWalletGateway(dappPage)

    await gotoConnect(dappPage)
    await wg.connect({ network: 'LocalNet' })

    const alice = await wg.createWalletIfNotExists({
        partyHint: `alice-${rnd}`,
        signingProvider: 'participant',
    })
    await wg.setPrimaryWallet(alice)

    await setupRegistry(dappPage)
    await tap(dappPage, wg, '5000')

    // The wallet is freshly created, so its balance equals the tapped amount.
    await expectWalletBalance(dappPage, alice, '5000')
})
