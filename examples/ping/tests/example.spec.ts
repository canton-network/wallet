// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@canton-network/core-wallet-test-utils'
import { Page } from '@playwright/test'
import {
    connectPingDapp,
    connectWalletGateway,
    createPingDappWalletGateway,
    DAPP_API_PORT,
    DAPP_URL,
    expectDappConnected,
    expectDappDisconnected,
    GATEWAY_NAME,
} from './ping-test-helpers.js'

test('dApp: execute externally signed tx', async ({
    page: dappPage,
}: {
    page: Page
}) => {
    const wg = createPingDappWalletGateway(dappPage)

    const party1 = `test-${Date.now()}`
    const party2 = `test-${Date.now() + 1}`

    await connectPingDapp(wg, dappPage)

    await test.step(`create parties ${party1} (participant) and ${party2} (wallet-kernel, primary)`, async () => {
        await wg.createWalletIfNotExists({
            partyHint: party1,
            signingProvider: 'participant',
        })
        await wg.createWalletIfNotExists({
            partyHint: party2,
            signingProvider: 'wallet-kernel',
            primary: true,
        })
    })

    await test.step('the dApp lists the primary party under Accounts', async () => {
        await dappPage.getByRole('button', { name: 'Accounts' }).click()

        await expect(
            dappPage.getByText(`${party2}::`).filter({ visible: true }),
            `the Accounts tab should list the primary party ${party2}`
        ).toHaveCount(1)
    })

    const { commandId } =
        await test.step('create a Ping contract and approve it in the wallet', async () => {
            await dappPage
                .getByRole('button', { name: 'Ledger Submission' })
                .click()

            const createButton = dappPage.getByRole('button', {
                name: 'create Ping contract',
                exact: true,
            })
            await expect(
                createButton,
                'the dApp should be ready to submit a Ping contract'
            ).toBeEnabled()

            return wg.approveTransaction(() => createButton.click())
        })

    await test.step('the dApp reports the transaction pending, signed and executed', async () => {
        const events = (status: string) =>
            dappPage
                .getByRole('paragraph')
                .filter({ hasText: `"commandId": "${commandId}"` })
                .filter({ hasText: `"status": "${status}"` })

        await expect(
            events('pending'),
            'the dApp should report the transaction as pending'
        ).toHaveCount(1)
        await expect(
            events('signed'),
            'the dApp should report the transaction as signed'
        ).toHaveCount(1)
        await expect(
            events('executed').filter({
                hasText:
                    /"payload": \{[\s\S]*"updateId": "[^"]+"[\s\S]*"completionOffset": \d+/,
            }),
            'the dApp should report the transaction as executed, with an update id and completion offset'
        ).toHaveCount(1)
    })

    await test.step('the wallet lists the transaction as executed', async () => {
        await wg.expectActivityWithStatus(commandId, 'executed')
    })
})

test('connection status handling edge cases', async ({ page: dappPage }) => {
    const wg = createPingDappWalletGateway(dappPage)
    const disconnectButton = dappPage.getByTestId('disconnect-wallet')

    await test.step('a freshly opened dApp reports no wallet session', async () => {
        await dappPage.goto(DAPP_URL)
        await expect(dappPage).toHaveTitle(/Example dApp/)
        await expectDappDisconnected(dappPage)
    })

    await test.step('connecting to a gateway updates the dApp status', async () => {
        await connectWalletGateway(wg, dappPage)
    })

    await test.step('the dApp disconnect button ends the session', async () => {
        await disconnectButton.click()
        await expectDappDisconnected(dappPage)
    })

    await test.step('reconnecting starts a session', async () => {
        await connectWalletGateway(wg, dappPage)
    })

    await test.step('logging out inside the popup disconnects the dApp', async () => {
        await wg.logoutFromPopup()
        await expectDappDisconnected(dappPage)
    })

    await test.step('reconnecting after logout starts a session', async () => {
        await connectWalletGateway(wg, dappPage)
    })

    await test.step('reloading the dApp keeps the session and leaves the popup closed', async () => {
        await dappPage.reload()
        await expect(dappPage).toHaveTitle(/Example dApp/)
        await expectDappConnected(dappPage, GATEWAY_NAME)

        expect(
            await wg.isPopupOpen(),
            'reloading the dApp should not reopen the wallet popup'
        ).toBe(false)
    })

    await test.step('opening the popup keeps the session', async () => {
        await wg.openPopup()

        expect(
            await wg.isPopupOpen(),
            'the wallet popup should be open after opening it'
        ).toBe(true)
        await expectDappConnected(dappPage, GATEWAY_NAME)
    })

    await test.step('closing the popup keeps the session', async () => {
        await wg.closePopup()
        await expectDappConnected(dappPage, GATEWAY_NAME)
    })

    await test.step('disconnecting while the popup is closed still ends the session', async () => {
        await disconnectButton.click()
        await expectDappDisconnected(dappPage)
    })
})

test('popup opens with correct userUrl after reconnect', async ({
    page: dappPage,
}) => {
    const wg = createPingDappWalletGateway(dappPage)

    await connectPingDapp(wg, dappPage)

    await test.step('disconnect and connect again', async () => {
        await dappPage.getByTestId('disconnect-wallet').click()
        await expectDappDisconnected(dappPage)

        await connectWalletGateway(wg, dappPage)
    })

    await test.step('the reopened popup points at the wallet gateway, not the dApp', async () => {
        await wg.closePopup()
        await wg.openPopup()
        await wg.waitForPopupUrl(new RegExp(`localhost:${DAPP_API_PORT}`))
    })
})
