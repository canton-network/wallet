// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import * as SpliceTestTokenV1 from '@canton-network/core-test-token'
import type { Splice as SpliceTestTokenTypes } from '@canton-network/core-test-token'
import type { MultiSyncSetup } from './_setup.js'
import { TRADE_TOKEN_AMOUNT } from './_constants.js'

const TestTokenV1 = SpliceTestTokenV1.Splice.Testing.Tokens.TestTokenV1

const TOKEN_POLL_TIMEOUT_MS = 30_000
const TOKEN_POLL_INTERVAL_MS = 500

export async function aliceSelfTransferToApp(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const {
        appUserSdk,
        tokenNamespaceAppUser,
        alice,
        appSynchronizerId,
        testTokenRegistryUrl,
    } = setup

    // The settlement is submitted by TradingApp (sv), so Alice's resulting Token
    // holding propagates to her participant (app-user) asynchronously. Poll app-user until it
    // becomes visible instead of reading once (cross-participant read-after-write).
    const deadline = Date.now() + TOKEN_POLL_TIMEOUT_MS
    let aliceToken
    for (;;) {
        const aliceTokens = await appUserSdk.ledger.acs.read({
            templateIds: [TestTokenV1.Token.templateId],
            parties: [alice.partyId],
            filterByParty: true,
        })
        aliceToken = aliceTokens[0]
        if (aliceToken) break
        if (Date.now() >= deadline)
            throw new Error('Alice: Token holding not found after settlement')
        await new Promise((resolve) =>
            setTimeout(resolve, TOKEN_POLL_INTERVAL_MS)
        )
    }

    // The settled holding lands on the global synchronizer; move it to the
    // app-synchronizer before self-transferring there (mirrors Bob's flow).
    if (aliceToken.synchronizerId !== appSynchronizerId) {
        await appUserSdk.ledger.internal.reassign({
            submitter: alice.partyId,
            contractId: aliceToken.contractId,
            source: aliceToken.synchronizerId,
            target: appSynchronizerId,
            skipIfAlreadyOn: true,
        })
    }

    const [transferCommand, transferDisclosed] =
        await tokenNamespaceAppUser.transfer.create({
            sender: alice.partyId,
            recipient: alice.partyId,
            amount: TRADE_TOKEN_AMOUNT,
            instrumentId: 'TestToken',
            registryUrl: testTokenRegistryUrl,
            inputUtxos: [aliceToken.contractId],
        })

    await appUserSdk.ledger
        .prepare({
            partyId: alice.partyId,
            commands: [transferCommand],
            disclosedContracts: transferDisclosed,
            synchronizerId: appSynchronizerId,
        })
        .sign(alice.keyPair.privateKey)
        .execute({ partyId: alice.partyId })

    logger.info(
        `Alice: ${TRADE_TOKEN_AMOUNT} TestToken self-transferred on app-synchronizer via registry transfer-factory`
    )
}

export async function bobSelfTransferToApp(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const {
        appProviderSdk,
        tokenNamespaceAppProvider,
        bob,
        appSynchronizerId,
        testTokenRegistryUrl,
    } = setup

    const bobTokens = await appProviderSdk.ledger.acs.read({
        templateIds: [TestTokenV1.Token.templateId],
        parties: [bob.partyId],
        filterByParty: true,
    })

    if (bobTokens.length === 0) {
        logger.info('Bob: no TestToken holdings to self-transfer')
        return
    }

    for (const token of bobTokens) {
        if (token.synchronizerId !== appSynchronizerId) {
            await appProviderSdk.ledger.internal.reassign({
                submitter: bob.partyId,
                contractId: token.contractId,
                source: token.synchronizerId,
                target: appSynchronizerId,
                skipIfAlreadyOn: true,
            })
        }

        const holdingAmount = (
            token as unknown as {
                createArgument: SpliceTestTokenTypes.Testing.Tokens.TestTokenV1.Token
            }
        ).createArgument.holding.amount
        if (!holdingAmount)
            throw new Error('Cannot read amount from Bob Token holding')

        const [transferCommand, transferDisclosed] =
            await tokenNamespaceAppProvider.transfer.create({
                sender: bob.partyId,
                recipient: bob.partyId,
                amount: holdingAmount,
                instrumentId: 'TestToken',
                registryUrl: testTokenRegistryUrl,
                inputUtxos: [token.contractId],
            })

        await appProviderSdk.ledger
            .prepare({
                partyId: bob.partyId,
                commands: [transferCommand],
                disclosedContracts: transferDisclosed,
                synchronizerId: appSynchronizerId,
            })
            .sign(bob.keyPair.privateKey)
            .execute({ partyId: bob.partyId })
    }

    logger.info(
        `Bob: TestToken self-transferred on app-synchronizer via registry transfer-factory`
    )
}
