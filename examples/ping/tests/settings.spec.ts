// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@canton-network/core-wallet-test-utils'
import { Page } from '@playwright/test'
import {
    connectPingDapp,
    createPingDappWalletGateway,
    DEFAULT_NETWORK,
} from './ping-test-helpers.js'

// Network whose user `operator` is the configured gateway admin.
const adminNetwork = DEFAULT_NETWORK
// Network whose user `operator2` is a regular, non-admin user.
const nonAdminNetwork = 'Local (OAuth IDP - 2)'

test.describe('Wallet Gateway settings - networks', () => {
    test('admin can add and edit a network', async ({
        page: dappPage,
    }: {
        page: Page
    }) => {
        const wg = createPingDappWalletGateway(dappPage)
        await connectPingDapp(wg, dappPage, adminNetwork)

        const suffix = Date.now()
        const networkId = `e2e-net-${suffix}`
        const networkName = `E2E Network ${suffix}`

        await test.step(`add network ${networkId}`, async () => {
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
            await expect(
                card,
                'the new network should be listed under its given name'
            ).toContainText(networkName)
        })

        const editedName = `${networkName} (edited)`

        await test.step(`rename network ${networkId}`, async () => {
            await wg.updateNetworkName(networkId, editedName)

            const editedCard = await wg.findNetworkCard(networkId)
            await expect(
                editedCard,
                'the network card should show the name it was renamed to'
            ).toContainText(editedName)
        })
    })

    test('non-admin cannot add or edit networks', async ({
        page: dappPage,
    }: {
        page: Page
    }) => {
        const wg = createPingDappWalletGateway(dappPage)
        await connectPingDapp(wg, dappPage, nonAdminNetwork)

        await test.step('the networks page is read-only for a non-admin', async () => {
            await wg.gotoNetworksPage()

            expect(
                await wg.hasNewNetworkButton(),
                'a non-admin should not be offered a way to add a network'
            ).toBe(false)

            await wg.expectFirstNetworkNotEditable()
        })
    })
})

test.describe('Wallet Gateway settings - identity providers', () => {
    test('admin can add and edit an identity provider', async ({
        page: dappPage,
    }: {
        page: Page
    }) => {
        const wg = createPingDappWalletGateway(dappPage)
        await connectPingDapp(wg, dappPage, adminNetwork)

        const suffix = Date.now()
        const idpId = `e2e-idp-${suffix}`
        const issuer = `http://127.0.0.1:8889/e2e-${suffix}`

        await test.step(`add identity provider ${idpId}`, async () => {
            await wg.addIdp({
                id: idpId,
                type: 'oauth',
                issuer,
                configUrl:
                    'http://127.0.0.1:8889/.well-known/openid-configuration',
            })

            const card = await wg.findIdpCard(idpId)
            await expect(
                card,
                'the new identity provider should be listed with its issuer'
            ).toContainText(issuer)
        })

        const editedIssuer = `${issuer}/edited`

        await test.step(`change the issuer of ${idpId}`, async () => {
            await wg.updateIdpIssuer(idpId, editedIssuer)

            const editedCard = await wg.findIdpCard(idpId)
            await expect(
                editedCard,
                'the identity provider card should show the edited issuer'
            ).toContainText(editedIssuer)
        })
    })

    test('non-admin cannot add or edit identity providers', async ({
        page: dappPage,
    }: {
        page: Page
    }) => {
        const wg = createPingDappWalletGateway(dappPage)
        await connectPingDapp(wg, dappPage, nonAdminNetwork)

        await test.step('the identity providers page is read-only for a non-admin', async () => {
            await wg.gotoIdentityProvidersPage()

            expect(
                await wg.hasNewIdpButton(),
                'a non-admin should not be offered a way to add an identity provider'
            ).toBe(false)

            await wg.expectFirstIdpNotEditable()
        })
    })
})
