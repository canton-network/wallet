// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    test,
    expect,
    WalletGateway,
} from '@canton-network/core-wallet-test-utils'
import { Page } from '@playwright/test'

const dappApiPort = 3030
const dfnsApiUrl = process.env.DFNS_BASE_URL ?? 'http://localhost:3032'

function toDfnsMockEndpoint(path: string): string {
    const origin = new URL(dfnsApiUrl).origin
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${origin}${normalizedPath}`
}

async function getExternalTxIdFromPendingResult(
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

async function setMockDfnsTransactionState(
    signatureId: string,
    status: 'Signed' | 'Rejected' | 'Failed'
): Promise<void> {
    const setResponse = await fetch(
        toDfnsMockEndpoint('/_admin/setSignatureState'),
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ signatureId, status }),
        }
    )
    expect(setResponse.ok).toBeTruthy()

    const updated = (await setResponse.json()) as { status: string }
    expect(updated.status).toBe(status)
}

async function startExternalSigningFlow(
    wg: WalletGateway,
    dappPage: Page
): Promise<{ commandId: string; externalTxId: string }> {
    const { commandId } = await wg.approveTransaction(
        () =>
            dappPage
                .getByRole('button', {
                    name: 'create Ping contract',
                    exact: true,
                })
                .click(),
        { isExternalSigning: true, waitForClose: false }
    )
    const externalTxId = await getExternalTxIdFromPendingResult(
        dappPage,
        commandId
    )
    return { commandId, externalTxId }
}

test('dApp: execute externally signed tx with Dfns', async ({
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

    const dfnsPartyHint = `dfns${Date.now()}`

    const dfnsPartyId = await wg.createWalletIfNotExists({
        partyHint: dfnsPartyHint,
        signingProvider: 'dfns',
        primary: true,
        // autoAllocateExternal: false,
    })
    const dfnsExternalTxId =
        await wg.getWalletExternalTxId(dfnsPartyId)
    await setMockDfnsTransactionState(dfnsExternalTxId, 'Signed')
    await wg.allocateWalletParty(dfnsPartyId)

    await dappPage.getByRole('button', { name: 'Accounts' }).click()
    expect(
        await dappPage
            .getByText(`${dfnsPartyHint}::`)
            .filter({ visible: true })
            .count()
    ).toBe(1)

    // Guard against another wallet being selected as primary.
    await wg.setPrimaryWallet(dfnsPartyId)

    await dappPage.getByRole('button', { name: 'Ledger Submission' }).click()

    await expect(
        dappPage.getByRole('button', {
            name: 'create Ping contract',
            exact: true,
        })
    ).toBeEnabled()

    const firstSubmission = await startExternalSigningFlow(wg, dappPage)
    await setMockDfnsTransactionState(firstSubmission.externalTxId, 'Signed')
    await wg.executeSignedTransaction({ waitForClose: false })

    await expect(
        dappPage
            .getByRole('paragraph')
            .filter({ hasText: `"commandId": "${firstSubmission.commandId}"` })
            .filter({ hasText: '"status": "pending"' })
            .filter({ hasText: '"externalTxId"' })
    ).toHaveCount(1)
    await expect(
        dappPage
            .getByRole('paragraph')
            .filter({ hasText: `"commandId": "${firstSubmission.commandId}"` })
            .filter({ hasText: '"status": "signed"' })
            .filter({ hasText: '"externalTxId"' })
    ).toHaveCount(1)
    await expect(
        dappPage
            .getByRole('paragraph')
            .filter({
                hasText: `"commandId": "${firstSubmission.commandId}"`,
            })
            .filter({
                hasText: '"status": "executed"',
            })
            .filter({
                hasText:
                    /"payload": \{[\s\S]*"updateId": "[^"]+"[\s\S]*"completionOffset": \d+/,
            })
    ).toHaveCount(1)

    await wg.rejectTransaction(
        () =>
            dappPage
                .getByRole('button', {
                    name: 'create Ping contract',
                    exact: true,
                })
                .click(),
        { waitForClose: true }
    )
    // TODO this would be nice to check, but removing transaction doesn't emit txChanged and I don't know what should it emit
    // await expect(
    //     dappPage
    //         .getByRole('paragraph')
    //         .filter({ hasText: `"commandId": "${rejectedByUser.commandId}"` })
    // ).toHaveCount(0)

    // TODO fails here
    const adminRejectedSubmission = await startExternalSigningFlow(wg, dappPage)
    await setMockDfnsTransactionState(
        adminRejectedSubmission.externalTxId,
        'Rejected'
    )
    await wg.executeSignedTransaction({ waitForClose: false })
    await expect(
        dappPage
            .getByRole('paragraph')
            .filter({
                hasText: `"commandId": "${adminRejectedSubmission.commandId}"`,
            })
            .filter({ hasText: '"status": "pending"' })
            .filter({ hasText: '"externalTxId"' })
    ).toHaveCount(1)
    await expect(
        dappPage
            .getByRole('paragraph')
            .filter({
                hasText: `"commandId": "${adminRejectedSubmission.commandId}"`,
            })
            .filter({ hasText: '"status": "failed"' })
    ).toHaveCount(1)

    const adminFailedSubmission = await startExternalSigningFlow(wg, dappPage)
    await setMockDfnsTransactionState(
        adminFailedSubmission.externalTxId,
        'Failed'
    )
    await wg.executeSignedTransaction({ waitForClose: false })
    await expect(
        dappPage
            .getByRole('paragraph')
            .filter({
                hasText: `"commandId": "${adminFailedSubmission.commandId}"`,
            })
            .filter({ hasText: '"status": "pending"' })
            .filter({ hasText: '"externalTxId"' })
    ).toHaveCount(1)
    await expect(
        dappPage
            .getByRole('paragraph')
            .filter({
                hasText: `"commandId": "${adminFailedSubmission.commandId}"`,
            })
            .filter({ hasText: '"status": "failed"' })
    ).toHaveCount(1)
})
