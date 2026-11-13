// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { errorCodes } from '@canton-network/core-rpc-errors'
import {
    test,
    type WalletGateway,
} from '@canton-network/core-wallet-test-utils'
import type { Page } from '@playwright/test'
import {
    clickCreatePingContract,
    connectPingDapp,
    initializeExternalSigningParty,
    createPingDappWalletGateway,
    expectTxStatusInDappEvents,
    allocateExternalSigningParty,
    createPingContractAndApproveExternal,
} from './ping-test-helpers.js'
import { setMockDfnsTransactionState } from './external-signing-test-helpers.js'

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

        await expectTxStatusInDappEvents(
            dappPage,
            submission.commandId,
            'signed'
        )
        await wg.executeSignedTransaction({ waitForClose: false })

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

        // TODO check dapp event, once removing tx starts emitting one
        await wg.expectActivityRemoved(commandId)
    })

    test('fails when Dfns rejects signing', async () => {
        const submission = await createPingContractAndApproveExternal(
            wg,
            dappPage
        )
        await setMockDfnsTransactionState(
            submission.externalTxId,
            'Rejected',
            'Denied by policy'
        )

        const failureReason =
            'Dfns rejected the signing request (Denied by policy)'

        await expectTxStatusInDappEvents(
            dappPage,
            submission.commandId,
            'failed',
            {
                error: {
                    code: errorCodes.rpc.transactionRejected,
                    message: failureReason,
                },
            }
        )
        await wg.expectActivityWithStatus(submission.commandId, 'failed', {
            failureReason,
        })
    })

    test('fails when Dfns fails signing', async () => {
        const submission = await createPingContractAndApproveExternal(
            wg,
            dappPage
        )
        await setMockDfnsTransactionState(submission.externalTxId, 'Failed')

        const failureReason = 'Dfns failed to sign the request'

        await expectTxStatusInDappEvents(
            dappPage,
            submission.commandId,
            'failed',
            {
                error: {
                    code: errorCodes.rpc.transactionRejected,
                    message: failureReason,
                },
            }
        )
        await wg.expectActivityWithStatus(submission.commandId, 'failed', {
            failureReason,
        })
    })
})
