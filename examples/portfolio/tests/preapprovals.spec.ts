// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test } from '@playwright/test'
import {
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
} from './next-utils'
import { fundValidatorOperator } from './fund-validator'

const AMULET_INSTRUMENT = 'Amulet (AMT)'

// Preapproval tests share wallet gateway state (primary wallet) with the backend,
// so they must run serially to avoid races on which wallet is primary.
test.describe.configure({ mode: 'serial' })

// Preapproval tests involve multiple ledger transactions (taps + preapproval
// toggles + transfer), and enabling an amulet preapproval waits for validator
// automation, so give them much more time than the default 30s.
test.setTimeout(300_000)

// The validator operator pays the preapproval purchase fee when accepting a
// preapproval proposal. On a fresh LocalNet (e.g. CI) the operator holds no
// amulet, so fund it first or proposals are never accepted.
test.beforeAll(async () => {
    await fundValidatorOperator()
})

test('toggle preapproval', async ({ page: dappPage }) => {
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

    await gotoConnect(dappPage)
    await wg.connect({ network: 'LocalNet' })

    const alice = await wg.createWalletIfNotExists({
        partyHint: `alice-${rnd}`,
        signingProvider: 'participant',
    })
    const bob = await wg.createWalletIfNotExists({
        partyHint: `bob-${rnd}`,
        signingProvider: 'participant',
    })

    // Bob: fund the wallet and enable the amulet preapproval.
    await wg.setPrimaryWallet(bob)
    await setupRegistry(dappPage)
    await tap(dappPage, wg, '1000')
    await togglePreapproval(dappPage, wg, {
        instrument: AMULET_INSTRUMENT,
        enabled: true,
    })

    // Alice: tap and transfer to bob.
    await switchWallet(dappPage, wg, alice)
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
    await switchWallet(dappPage, wg, bob)
    await gotoDashboard(dappPage)
    await expectTransferOfferGone(dappPage, { amount: '100', message })
    await expectWalletBalance(dappPage, bob, '1100')
})
