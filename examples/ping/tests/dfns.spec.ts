// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    test,
    expect,
    WalletGateway,
} from '@canton-network/core-wallet-test-utils'
import { Page } from '@playwright/test'
import {
    clickCreatePingContract,
    connectPingDapp,
    initializeExternalSigningParty,
    createPingDappWalletGateway,
    expectTxStatusInDappEvents,
    allocateExternalSigningParty,
    createPingContractAndApproveExternal,
    toMockEndpoint,
    isLocalhost,
} from './external-signing-test-helpers.js'

const dfnsApiUrl = process.env.DFNS_BASE_URL

async function setMockDfnsTransactionState(
    signatureId: string,
    status: 'Signed' | 'Rejected' | 'Failed'
): Promise<void> {
    const isMockedApi = dfnsApiUrl && isLocalhost(new URL(dfnsApiUrl))
    if (!isMockedApi) {
        return
    }
    const setResponse = await fetch(
        toMockEndpoint(dfnsApiUrl, '/_admin/setTransactionState'),
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

test.describe('Dfns external signing', () => {
    test.describe.configure({ mode: 'serial' })

    let dappPage: Page
    let wg: WalletGateway

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext()
        dappPage = await context.newPage()
        wg = createPingDappWalletGateway(dappPage)
        await connectPingDapp(wg, dappPage)

        const partyHint = `dfns${Date.now()}`
        const { partyId, externalTxId } = await initializeExternalSigningParty({
            wg,
            partyHint,
            signingProvider: 'dfns',
        })
        await setMockDfnsTransactionState(externalTxId, 'Signed')
        await allocateExternalSigningParty({
            wg,
            dappPage,
            partyHint,
            partyId,
        })
    })

    test.afterAll(async () => {
        await dappPage.context().close()
    })

    test('executes a successfully signed transaction', async () => {
        const submission = await createPingContractAndApproveExternal(
            wg,
            dappPage
        )
        await setMockDfnsTransactionState(submission.externalTxId, 'Signed')
        await wg.executeSignedTransaction({ waitForClose: false })

        await expectTxStatusInDappEvents(
            dappPage,
            submission.commandId,
            'signed'
        )
        await expectTxStatusInDappEvents(
            dappPage,
            submission.commandId,
            'executed'
        )
    })

    test('rejects a transaction in the wallet UI', async () => {
        await wg.rejectTransaction(() => clickCreatePingContract(dappPage), {
            waitForClose: true,
        })
    })

    test('fails when Dfns rejects signing', async () => {
        const submission = await createPingContractAndApproveExternal(
            wg,
            dappPage
        )
        await setMockDfnsTransactionState(submission.externalTxId, 'Rejected')
        await wg.executeSignedTransaction({ waitForClose: false })

        await expectTxStatusInDappEvents(
            dappPage,
            submission.commandId,
            'failed'
        )
    })

    test('fails when Dfns fails signing', async () => {
        const submission = await createPingContractAndApproveExternal(
            wg,
            dappPage
        )
        await setMockDfnsTransactionState(submission.externalTxId, 'Failed')
        await wg.executeSignedTransaction({ waitForClose: false })

        await expectTxStatusInDappEvents(
            dappPage,
            submission.commandId,
            'failed'
        )
    })
})
