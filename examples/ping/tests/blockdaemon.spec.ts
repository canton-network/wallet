// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, WalletGateway } from '@canton-network/core-wallet-test-utils'
import { Page } from '@playwright/test'
import {
    clickCreatePingContract,
    connectPingDapp,
    initializeExternalSigningParty,
    createPingDappWalletGateway,
    expectTxStatusInDappEvents,
    allocateExternalSigningParty,
    createPingContractAndApproveExternal,
} from './ping-test-helpers.js'
import { setMockBlockdaemonTransactionState } from './external-signing-test-helpers.js'

test.describe('Blockdaemon external signing', () => {
    test.describe.configure({ mode: 'serial' })

    let dappPage: Page
    let wg: WalletGateway

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext()
        dappPage = await context.newPage()
        wg = createPingDappWalletGateway(dappPage)
        await connectPingDapp(wg, dappPage)

        const partyHint = `blockdaemon${Date.now()}`
        const { partyId, externalTxId } = await initializeExternalSigningParty({
            wg,
            partyHint,
            signingProvider: 'blockdaemon',
        })
        await setMockBlockdaemonTransactionState(externalTxId, 'signed')
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
        await setMockBlockdaemonTransactionState(
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
        await wg.expectActivityWithStatus(submission.commandId, 'executed')
    })

    test('rejects a transaction in the wallet UI', async () => {
        const { commandId } = await wg.rejectTransaction(
            () => clickCreatePingContract(dappPage),
            { waitForClose: true }
        )

        await wg.expectActivityRemoved(commandId)
    })

    test('fails when Blockdaemon rejects signing', async () => {
        const submission = await createPingContractAndApproveExternal(
            wg,
            dappPage
        )
        await setMockBlockdaemonTransactionState(
            submission.externalTxId,
            'rejected'
        )
        await wg.executeSignedTransaction({ waitForClose: false })

        await expectTxStatusInDappEvents(
            dappPage,
            submission.commandId,
            'failed'
        )
        await wg.expectActivityWithStatus(submission.commandId, 'failed')
    })

    test('fails when Blockdaemon fails signing', async () => {
        const submission = await createPingContractAndApproveExternal(
            wg,
            dappPage
        )
        await setMockBlockdaemonTransactionState(
            submission.externalTxId,
            'failed'
        )
        await wg.executeSignedTransaction({ waitForClose: false })

        await expectTxStatusInDappEvents(
            dappPage,
            submission.commandId,
            'failed'
        )
        await wg.expectActivityWithStatus(submission.commandId, 'failed')
    })
})
