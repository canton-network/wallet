// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Shared tests methods for dapp scope

import { expect, WalletGateway } from '@canton-network/core-wallet-test-utils'
import { Page } from '@playwright/test'
import type { ExternalSigningProvider } from './external-signing-test-helpers.js'

export const DAPP_API_PORT = 3030
export const DAPP_URL = 'http://localhost:8080/'

const EXECUTED_PAYLOAD_PATTERN =
    /"payload": \{[\s\S]*"updateId": "[^"]+"[\s\S]*"completionOffset": \d+/

export function createPingDappWalletGateway(dappPage: Page): WalletGateway {
    return new WalletGateway({
        dappPage,
        openButton: (page) =>
            page.getByRole('button', {
                name: 'open Wallet',
            }),
        connectButton: (page) =>
            page.getByRole('button', {
                name: 'connect to Wallet',
            }),
    })
}

export async function connectPingDapp(
    wg: WalletGateway,
    dappPage: Page
): Promise<void> {
    await dappPage.goto(DAPP_URL)
    await expect(dappPage).toHaveTitle(/Example dApp/)

    await wg.connect({
        customURL: `http://localhost:${DAPP_API_PORT}/api/v0/dapp`,
        network: 'Local (OAuth IDP)',
    })

    await expectDappConnected(dappPage, 'remote-da')
}

export async function expectDappConnected(
    dappPage: Page,
    gatewayName: string
): Promise<void> {
    // Wrapped with expect().toPass, because buttons part depends on connectResponse, while <Status> part depends on statusEvent.
    // They come in asynchronously, wrapper mitigates race condition by waiting until every assertion in positive at the same time.
    await expect(async () => {
        const [
            connectCount,
            openEnabled,
            connectedVisible,
            connectedGateway,
            disconnectVisible,
        ] = await Promise.all([
            dappPage.getByTestId('connect-wallet').count(),
            dappPage.getByTestId('open-wallet').isEnabled(),
            dappPage.getByTestId('connection-indicator-connected').isVisible(),
            dappPage.getByTestId('connected-gateway').textContent(),
            dappPage.getByTestId('disconnect-wallet').isVisible(),
        ])

        expect(
            connectCount,
            'a connected dApp should no longer has a connect button'
        ).toBe(0)

        expect(
            openEnabled,
            'a connected dApp should allow opening the wallet'
        ).toBe(true)

        expect(
            connectedVisible,
            'the dApp status line should report the wallet as connected'
        ).toBe(true)

        expect(
            connectedGateway,
            'the dApp should report the gateway it is connected to'
        ).toBe(gatewayName)

        expect(
            disconnectVisible,
            'a connected dApp should have disconnect button'
        ).toBe(true)
    }).toPass({
        timeout: 10_000,
    })
}

export async function expectDappDisconnected(dappPage: Page): Promise<void> {
    // Wrapped with expect().toPass, because buttons part depends on connectResponse, while <Status> part depends on statusEvent.
    // They come in asynchronously, wrapper mitigates race condition by waiting until every assertion in positive at the same time.
    await expect(async () => {
        const [
            disconnectedVisible,
            connectVisible,
            disconnectCount,
            openDisabled,
        ] = await Promise.all([
            dappPage
                .getByTestId('connection-indicator-disconnected')
                .isVisible(),
            dappPage.getByTestId('connect-wallet').isVisible(),
            dappPage.getByTestId('disconnect-wallet').count(),
            dappPage.getByTestId('open-wallet').isDisabled(),
        ])

        expect(disconnectedVisible).toBe(true)
        expect(connectVisible).toBe(true)
        expect(disconnectCount).toBe(0)
        expect(openDisabled).toBe(true)
    }).toPass({
        timeout: 10_000,
    })
}

// TODO check which of those should go to wallet-test-utils
export async function initializeExternalSigningParty(args: {
    wg: WalletGateway
    partyHint: string
    signingProvider: ExternalSigningProvider
    vaultName?: string
}): Promise<{ partyId: string; externalTxId: string }> {
    const partyId = await args.wg.createWalletIfNotExists({
        partyHint: args.partyHint,
        signingProvider: args.signingProvider,
        ...(args.vaultName !== undefined && { vaultName: args.vaultName }),
        primary: true,
    })

    const externalTxId = await args.wg.getWalletExternalTxId(partyId)

    return { partyId, externalTxId }
}

export async function allocateExternalSigningParty(args: {
    wg: WalletGateway
    dappPage: Page
    partyHint: string
    partyId: string
}): Promise<void> {
    await args.wg.allocateWalletParty(args.partyId)

    await args.dappPage.getByRole('button', { name: 'Accounts' }).click()
    expect(
        await args.dappPage
            .getByText(`${args.partyHint}::`)
            .filter({ visible: true })
            .count()
    ).toBe(1)

    await args.wg.setPrimaryWallet(args.partyId)
}

export async function clickCreatePingContract(dappPage: Page): Promise<void> {
    await dappPage.getByRole('button', { name: 'Ledger Submission' }).click()
    await expect(
        dappPage.getByRole('button', {
            name: 'create Ping contract',
            exact: true,
        })
    ).toBeEnabled()
    await dappPage
        .getByRole('button', {
            name: 'create Ping contract',
            exact: true,
        })
        .click()
}

export async function getExternalTxIdFromPendingResult(
    page: Page,
    commandId: string
): Promise<string> {
    const pendingResult = page
        .getByRole('paragraph')
        .filter({ hasText: `"commandId": "${commandId}"` })
        .filter({ hasText: '"status": "pending"' })
        .filter({ hasText: '"externalTxId"' })
        .first()

    await expect(pendingResult).toBeVisible()
    const pendingText = await pendingResult.textContent()
    const externalTxId = pendingText?.match(/"externalTxId":\s*"([^"]+)"/)?.[1]
    if (!externalTxId) {
        throw new Error(
            `did not find externalTxId in pending tx response for commandId ${commandId}`
        )
    }
    return externalTxId
}

export async function createPingContractAndApproveExternal(
    wg: WalletGateway,
    dappPage: Page
): Promise<{ commandId: string; externalTxId: string }> {
    const { commandId } = await wg.approveTransaction(
        () => clickCreatePingContract(dappPage),
        { isExternalSigning: true, waitForClose: false }
    )
    const externalTxId = await getExternalTxIdFromPendingResult(
        dappPage,
        commandId
    )
    return { commandId, externalTxId }
}

type TxStatus = 'pending' | 'signed' | 'executed' | 'failed'

export async function expectTxStatusInDappEvents(
    dappPage: Page,
    commandId: string,
    status: TxStatus
): Promise<void> {
    let locator = dappPage
        .getByRole('paragraph')
        .filter({ hasText: `"commandId": "${commandId}"` })
        .filter({ hasText: `"status": "${status}"` })

    if (status === 'pending' || status === 'signed') {
        locator = locator.filter({ hasText: '"externalTxId"' })
    }
    if (status === 'executed') {
        locator = locator.filter({ hasText: EXECUTED_PAYLOAD_PATTERN })
    }

    await expect(locator).toHaveCount(1)
}
