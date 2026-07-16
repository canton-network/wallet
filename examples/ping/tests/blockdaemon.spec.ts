// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    test,
    expect,
    WalletGateway,
} from '@canton-network/core-wallet-test-utils'
import { Page } from '@playwright/test'

const dappApiPort = 3030
const blockdaemonApiUrl = process.env.BLOCKDAEMON_API_URL ?? 'http://localhost:6666'

function toBlockdaemonMockEndpoint(path: string): string {
    const base = blockdaemonApiUrl.endsWith('/')
        ? blockdaemonApiUrl
        : `${blockdaemonApiUrl}/`
    const relativePath = path.startsWith('/') ? path.slice(1) : path
    return new URL(relativePath, base).toString()
}

async function signMockBlockdaemonTransaction(
    txId: string
): Promise<void> {
    const promoteResponse = await fetch(
        toBlockdaemonMockEndpoint('/_admin/setTransactionState'),
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                txId,
                status: 'signed',
            }),
        }
    )
    expect(promoteResponse.ok).toBeTruthy()
}

test('dApp: execute externally signed tx with Blockdaemon', async ({
    page: dappPage,
}: {
    page: Page
}) => {
    const wg = new WalletGateway({
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

    await dappPage.goto('http://localhost:8080/')
    await expect(dappPage).toHaveTitle(/Example dApp/)

    await wg.connect({
        customURL: `http://localhost:${dappApiPort}/api/v0/dapp`,
        network: 'Local (OAuth IDP)',
    })

    await expect(dappPage.getByText('Loading...')).toHaveCount(0)
    await expect(dappPage.getByText(/.*gateway: remote-da*/)).toBeVisible()

    const blockdaemonPartyHint = `blockdaemon${Date.now()}`

    const blockdaemonPartyId = await wg.createWalletIfNotExists({
        partyHint: blockdaemonPartyHint,
        signingProvider: 'blockdaemon',
        primary: true,
    })
    const blockdaemonExternalTxId =
        await wg.getWalletExternalTxId(blockdaemonPartyId)
    await signMockBlockdaemonTransaction(blockdaemonExternalTxId)

    await dappPage.getByRole('button', { name: 'Accounts' }).click()
    expect(
        await dappPage
            .getByText(`${blockdaemonPartyHint}::`)
            .filter({ visible: true })
            .count()
    ).toBe(1)

    // Guard against another wallet being selected as primary.
    await wg.setPrimaryWallet(blockdaemonPartyId)

    await dappPage.getByRole('button', { name: 'Ledger Submission' }).click()

    await expect(
        dappPage.getByRole('button', {
            name: 'create Ping contract',
            exact: true,
        })
    ).toBeEnabled()

    const commandId = await wg.approveTransaction(
        () =>
            dappPage
                .getByRole('button', {
                    name: 'create Ping contract',
                    exact: true,
                })
                .click(),
        { isExternalSigning: true }
    )

    await expect(
        dappPage
            .getByRole('paragraph')
            .filter({ hasText: `"commandId": "${commandId.commandId}"` })
            .filter({ hasText: '"status": "pending"' })
            .filter({ hasText: '"externalTxId"' })
    ).toHaveCount(1)
    await expect(
        dappPage
            .getByRole('paragraph')
            .filter({ hasText: `"commandId": "${commandId.commandId}"` })
            .filter({ hasText: '"status": "signed"' })
            .filter({ hasText: '"externalTxId"' })
    ).toHaveCount(1)
    await expect(
        dappPage
            .getByRole('paragraph')
            .filter({
                hasText: `"commandId": "${commandId.commandId}"`,
            })
            .filter({
                hasText: '"status": "executed"',
            })
            .filter({
                hasText:
                    /"payload": \{[\s\S]*"updateId": "[^"]+"[\s\S]*"completionOffset": \d+/,
            })
    ).toHaveCount(1)
})
