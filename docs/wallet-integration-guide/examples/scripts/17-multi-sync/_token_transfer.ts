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

export async function aliceTransferToCharlie(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const { aliceSdk, charlieSdk, alice, charlie, appSynchronizerId } = setup

    // Resolve the TestToken registry URL from the SDK's configured registries
    // (`token.find`) instead of threading it through the setup object.
    const { registryUrl: testTokenRegistryUrl } =
        await aliceSdk.token.find('TestToken')

    // The settlement is submitted by TradingApp (sv), so Alice's resulting Token
    // holding propagates to her participant (app-user) asynchronously. Poll app-user until it
    // becomes visible instead of reading once (cross-participant read-after-write).
    const deadline = Date.now() + TOKEN_POLL_TIMEOUT_MS
    let aliceToken
    for (;;) {
        const aliceTokens = await aliceSdk.ledger.acs.read({
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
    // app-synchronizer before transferring it to Charlie there (mirrors Bob's flow).
    // TODO #2097 remove after bugfix in canton
    if (aliceToken.synchronizerId !== appSynchronizerId) {
        await aliceSdk.ledger.internal.reassign({
            submitter: alice.partyId,
            contractId: aliceToken.contractId,
            source: aliceToken.synchronizerId,
            target: appSynchronizerId,
        })
    }

    // Alice offers her freshly-received TestToken to Charlie via the registry's
    const [transferCommand, transferDisclosed] =
        await aliceSdk.token.transfer.create({
            sender: alice.partyId,
            recipient: charlie.partyId,
            amount: TRADE_TOKEN_AMOUNT,
            instrumentId: 'TestToken',
            registryUrl: testTokenRegistryUrl,
            inputUtxos: [aliceToken.contractId],
        })

    await aliceSdk.ledger
        .prepare({
            partyId: alice.partyId,
            commands: [transferCommand],
            disclosedContracts: transferDisclosed,
            synchronizerId: appSynchronizerId,
        })
        .sign(alice.keyPair.privateKey)
        .execute({ partyId: alice.partyId })

    const transferOffers = await charlieSdk.ledger.acs.read({
        templateIds: [TestTokenV1.TokenTransferOffer.templateId],
        parties: [charlie.partyId],
        filterByParty: true,
    })
    const transferOfferCid = transferOffers[0]?.contractId
    if (!transferOfferCid)
        throw new Error('TokenTransferOffer not found for Charlie')

    const [acceptCommand, acceptDisclosed] =
        await charlieSdk.token.transfer.accept({
            transferInstructionCid: transferOfferCid,
            registryUrl: testTokenRegistryUrl,
        })

    await charlieSdk.ledger
        .prepare({
            partyId: charlie.partyId,
            commands: [acceptCommand],
            disclosedContracts: acceptDisclosed,
            synchronizerId: appSynchronizerId,
        })
        .sign(charlie.keyPair.privateKey)
        .execute({ partyId: charlie.partyId })

    logger.info(
        `Alice: ${TRADE_TOKEN_AMOUNT} TestToken transferred to Charlie on app-synchronizer via registry transfer-factory`
    )
}

export async function bobSelfTransferToApp(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const { bobSdk, bob, appSynchronizerId } = setup

    const bobTokens = await bobSdk.ledger.acs.read({
        templateIds: [TestTokenV1.Token.templateId],
        parties: [bob.partyId],
        filterByParty: true,
    })

    if (bobTokens.length === 0) {
        logger.info('Bob: no TestToken holdings to self-transfer')
        return
    }

    // Resolve the TestToken registry URL from the SDK's configured registries.
    const { registryUrl: testTokenRegistryUrl } =
        await bobSdk.token.find('TestToken')

    for (const token of bobTokens) {
        if (token.synchronizerId !== appSynchronizerId) {
            //TODO #2097 remove after bugfix in canton
            await bobSdk.ledger.internal.reassign({
                submitter: bob.partyId,
                contractId: token.contractId,
                source: token.synchronizerId,
                target: appSynchronizerId,
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
            await bobSdk.token.transfer.create({
                sender: bob.partyId,
                recipient: bob.partyId,
                amount: holdingAmount,
                instrumentId: 'TestToken',
                registryUrl: testTokenRegistryUrl,
                inputUtxos: [token.contractId],
            })

        await bobSdk.ledger
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
