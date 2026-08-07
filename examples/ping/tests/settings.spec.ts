// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    test,
    expect,
    WalletGateway,
} from '@canton-network/core-wallet-test-utils'
import { Page } from '@playwright/test'
import { expectDappConnected } from './ping-test-helpers.js'

const dappApiPort = 3030
const dappUrl = 'http://localhost:8080/'
const dappCustomUrl = `http://localhost:${dappApiPort}/api/v0/dapp`

// Network whose user `operator` is the configured gateway admin.
const adminNetwork = 'Local (OAuth IDP)'
// Network whose user `operator2` is a regular, non-admin user.
const nonAdminNetwork = 'Local (OAuth IDP - 2)'

function createWalletGateway(dappPage: Page): WalletGateway {
    return new WalletGateway({
        dappPage,
        openButton: (page) => page.getByRole('button', { name: 'open Wallet' }),
        connectButton: (page) =>
            page.getByRole('button', { name: 'connect to Wallet' }),
    })
}

// TODO should this be a shared function for all ping tests?
async function connect(
    wg: WalletGateway,
    dappPage: Page,
    network: string
): Promise<void> {
    await dappPage.goto(dappUrl)
    await expect(dappPage).toHaveTitle(/Example dApp/)
    await wg.connect({ customURL: dappCustomUrl, network })
    await expectDappConnected(dappPage, 'remote-da')
}

test.describe('Wallet Gateway settings - networks', () => {
    test('admin can add and edit a network', async ({
        page: dappPage,
    }: {
        page: Page
    }) => {
        const wg = createWalletGateway(dappPage)
        await connect(wg, dappPage, adminNetwork)

        const suffix = Date.now()
        const networkId = `e2e-net-${suffix}`
        const networkName = `E2E Network ${suffix}`

        await wg.addNetwork({
            id: networkId,
            name: networkName,
            description: 'Created by the settings e2e test',
            identityProviderId: 'idp-mock-oauth',
            synchronizerId: 'e2esyncid::122012312312312312123',
            ledgerApi: 'http://localhost:5003',
            auth: {
                clientId: 'e2e-client',
                audience: 'e2e-audience',
                scope: 'openid',
            },
        })

        const card = await wg.findNetworkCard(networkId)
        await expect(card).toContainText(networkName)

        const editedName = `${networkName} (edited)`
        await wg.updateNetworkName(networkId, editedName)

        const editedCard = await wg.findNetworkCard(networkId)
        await expect(editedCard).toContainText(editedName)
    })

    test('non-admin cannot add or edit networks', async ({
        page: dappPage,
    }: {
        page: Page
    }) => {
        const wg = createWalletGateway(dappPage)
        await connect(wg, dappPage, nonAdminNetwork)

        await wg.gotoNetworksPage()

        expect(await wg.hasNewNetworkButton()).toBe(false)

        await wg.expectFirstNetworkNotEditable()
    })
})

test.describe('Wallet Gateway settings - identity providers', () => {
    test('admin can add and edit an identity provider', async ({
        page: dappPage,
    }: {
        page: Page
    }) => {
        const wg = createWalletGateway(dappPage)
        await connect(wg, dappPage, adminNetwork)

        const suffix = Date.now()
        const idpId = `e2e-idp-${suffix}`
        const issuer = `http://127.0.0.1:8889/e2e-${suffix}`

        await wg.addIdp({
            id: idpId,
            type: 'oauth',
            issuer,
            configUrl: 'http://127.0.0.1:8889/.well-known/openid-configuration',
        })

        const card = await wg.findIdpCard(idpId)
        await expect(card).toContainText(issuer)

        const editedIssuer = `${issuer}/edited`
        await wg.updateIdpIssuer(idpId, editedIssuer)

        const editedCard = await wg.findIdpCard(idpId)
        await expect(editedCard).toContainText(editedIssuer)
    })

    test('non-admin cannot add or edit identity providers', async ({
        page: dappPage,
    }: {
        page: Page
    }) => {
        const wg = createWalletGateway(dappPage)
        await connect(wg, dappPage, nonAdminNetwork)

        await wg.gotoIdentityProvidersPage()

        expect(await wg.hasNewIdpButton()).toBe(false)

        await wg.expectFirstIdpNotEditable()
    })
})
