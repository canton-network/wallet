// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test } from '@playwright/test'
import {
    createGatewayApi,
    connectGateway,
    createWalletGateway,
    expectTransferOfferGone,
    expectWalletBalance,
    fillAndSubmitTransfer,
    gotoConnect,
    gotoDashboard,
    openTransferDialog,
    setupRegistry,
    switchWallet,
    tap,
    togglePreapproval,
} from './utils'

const AMULET_INSTRUMENT = 'Amulet (AMT)'

// Preapproval tests involve multiple ledger transactions (taps + preapproval
// toggles + transfer), and enabling an amulet preapproval waits for validator
// automation, so give them much more time than the default 30s.
test.setTimeout(300_000)

test('toggle preapproval', async ({ page: dappPage }) => {
    const rnd = Math.floor(Math.random() * 100000)
    const wg = createWalletGateway(dappPage)

    // Scaffolding: this test is about the preapproval toggle, not about setup.
    const api = await createGatewayApi()
    await api.createWallet({
        partyHint: `alice-${rnd}`,
        signingProvider: 'participant',
        primary: true,
    })

    await gotoConnect(dappPage)
    await connectGateway(wg)

    await setupRegistry(dappPage)

    await tap(dappPage, wg, '1000')

    await togglePreapproval(dappPage, wg, {
        instrument: AMULET_INSTRUMENT,
        enabled: true,
    })
    await togglePreapproval(dappPage, wg, {
        instrument: AMULET_INSTRUMENT,
        enabled: false,
    })
})

test('one step transfer to preapproved receiver', async ({
    page: dappPage,
}) => {
    const rnd = Math.floor(Math.random() * 100000)
    const wg = createWalletGateway(dappPage)

    // Scaffolding: both wallets come from the wallet's API. Bob is primary
    // because the test funds and preapproves him first.
    const api = await createGatewayApi()
    const alice = await api.createWallet({
        partyHint: `alice-${rnd}`,
        signingProvider: 'participant',
    })
    const bob = await api.createWallet({
        partyHint: `bob-${rnd}`,
        signingProvider: 'participant',
        primary: true,
    })

    await gotoConnect(dappPage)
    await connectGateway(wg)

    await setupRegistry(dappPage)
    await tap(dappPage, wg, '1000')
    await togglePreapproval(dappPage, wg, {
        instrument: AMULET_INSTRUMENT,
        enabled: true,
    })

    // Alice: tap and transfer to bob.
    await switchWallet(api, alice)
    await tap(dappPage, wg, '500')

    const message = 'preapproved transfer test ' + Date.now()
    await openTransferDialog(dappPage)
    await fillAndSubmitTransfer(dappPage, wg, {
        amount: '100',
        recipient: bob,
        message,
    })

    // Bob: the transfer completes in one step, so no offer requires action
    // and the amount lands directly in bob's balance without accepting.
    await switchWallet(api, bob)
    await gotoDashboard(dappPage)
    await expectTransferOfferGone(dappPage, { amount: '100', message })
    await expectWalletBalance(dappPage, bob, '1100')
})
