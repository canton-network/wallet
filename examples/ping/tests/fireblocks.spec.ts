// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    test,
    expect,
    WalletGateway,
    MOCK_FIREBLOCKS_VAULT_NAME,
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
    toMockEndpoint, isLocalhost,
} from './external-signing-test-helpers.js'

const fireblocksApiPath = process.env.FIREBLOCKS_API_PATH

async function setMockFireblocksTransactionState(
    txId: string,
    status: 'signed' | 'rejected' | 'failed'
): Promise<void> {
    const isMockedApi = fireblocksApiPath && isLocalhost(new URL(fireblocksApiPath))
    if (!isMockedApi) {
        return
    }
    const setResponse = await fetch(
        toMockEndpoint(fireblocksApiPath, '/_admin/setTransactionState'),
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txId, status }),
        }
    )
    expect(setResponse.ok).toBeTruthy()

    const updated = (await setResponse.json()) as {
        signedMessages?: unknown[]
        status?: string
    }
    if (status === 'signed') {
        expect(updated.signedMessages?.length).toBeGreaterThan(0)
    } else {
        expect(updated.status).toBe(
            status === 'rejected' ? 'REJECTED' : 'FAILED'
        )
    }
}

test.describe('Fireblocks external signing', () => {
    test.describe.configure({ mode: 'serial' })

    let dappPage: Page
    let wg: WalletGateway

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext()
        dappPage = await context.newPage()
        wg = createPingDappWalletGateway(dappPage)
        await connectPingDapp(wg, dappPage)

        const partyHint = `fireblocks${Date.now()}`
        const { partyId, externalTxId } = await initializeExternalSigningParty({
            wg,
            partyHint,
            signingProvider: 'fireblocks',
            vaultName: MOCK_FIREBLOCKS_VAULT_NAME,
        })
        await setMockFireblocksTransactionState(externalTxId, 'signed')
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
        await setMockFireblocksTransactionState(
            submission.externalTxId,
            'signed'
        )
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

    test('fails when Fireblocks rejects signing', async () => {
        const submission = await createPingContractAndApproveExternal(
            wg,
            dappPage
        )
        await setMockFireblocksTransactionState(
            submission.externalTxId,
            'rejected'
        )
        await wg.executeSignedTransaction({ waitForClose: false })

        await expectTxStatusInDappEvents(
            dappPage,
            submission.commandId,
            'failed'
        )
    })

    test('fails when Fireblocks fails signing', async () => {
        const submission = await createPingContractAndApproveExternal(
            wg,
            dappPage
        )
        await setMockFireblocksTransactionState(
            submission.externalTxId,
            'failed'
        )
        await wg.executeSignedTransaction({ waitForClose: false })

        await expectTxStatusInDappEvents(
            dappPage,
            submission.commandId,
            'failed'
        )
    })
})
