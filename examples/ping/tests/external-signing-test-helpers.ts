// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, WalletGateway } from '@canton-network/core-wallet-test-utils'
import { Page } from '@playwright/test'

export const isLocalhost = (url: URL) =>
    ['localhost', '127.0.0.1'].includes(url.hostname)

export const DAPP_API_PORT = 3030
export const DAPP_URL = 'http://localhost:8080/'

const EXECUTED_PAYLOAD_PATTERN =
    /"payload": \{[\s\S]*"updateId": "[^"]+"[\s\S]*"completionOffset": \d+/

export type ExternalSigningProvider = 'blockdaemon' | 'dfns' | 'fireblocks'

export function toMockEndpoint(baseUrl: string, path: string): string {
    const origin = new URL(baseUrl).origin
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${origin}${normalizedPath}`
}

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

    await expect(dappPage.getByText('Loading...')).toHaveCount(0)
    await expect(dappPage.getByText(/.*gateway: remote-da*/)).toBeVisible({
        timeout: 15000,
    })
}

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
