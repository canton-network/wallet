// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import { buildTransferTokenCommand } from '@canton-network/core-test-token'
import * as SpliceTestTokenV1 from '@canton-network/core-test-token'
import type { Splice as SpliceTestTokenTypes } from '@canton-network/core-test-token'
import type { MultiSyncSetup } from './_setup.js'
import { TRADE_TOKEN_AMOUNT } from './_constants.js'

const TestTokenV1 = SpliceTestTokenV1.Splice.Testing.Tokens.TestTokenV1

const MS_24_HOURS = 24 * 60 * 60 * 1000

export async function aliceSelfTransferToApp(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const { p1Sdk, p2Sdk, alice, tokenAdmin, appSynchronizerId } = setup

    const [aliceTokens, tokenRulesContracts] = await Promise.all([
        p1Sdk.ledger.acs.read({
            templateIds: [TestTokenV1.Token.templateId],
            parties: [alice.partyId],
            filterByParty: true,
        }),
        p2Sdk.ledger.acs.read({
            templateIds: [TestTokenV1.TokenRules.templateId],
            parties: [tokenAdmin.partyId],
            filterByParty: true,
        }),
    ])
    const aliceToken = aliceTokens[0]
    if (!aliceToken)
        throw new Error('Alice: Token holding not found after settlement')
    const tokenRules = tokenRulesContracts.find(
        (c) => c.synchronizerId === appSynchronizerId
    )
    if (!tokenRules) throw new Error('TokenRules not found on app-synchronizer')

    await p1Sdk.ledger.internal.reassign({
        submitter: alice.partyId,
        contractId: aliceToken.contractId,
        source: aliceToken.synchronizerId,
        target: appSynchronizerId,
        skipIfAlreadyOn: true,
    })

    await p1Sdk.ledger
        .prepare({
            partyId: alice.partyId,
            commands: [
                buildTransferTokenCommand({
                    tokenRulesCid: tokenRules.contractId,
                    expectedAdmin: tokenAdmin.partyId,
                    sender: alice.partyId,
                    receiver: alice.partyId,
                    amount: TRADE_TOKEN_AMOUNT,
                    admin: tokenAdmin.partyId,
                    inputHoldingCids: [aliceToken.contractId],
                    requestedAt: new Date(Date.now()).toISOString(),
                    executeBefore: new Date(
                        Date.now() + MS_24_HOURS
                    ).toISOString(),
                }),
            ],
            disclosedContracts: [
                {
                    templateId: tokenRules.templateId,
                    contractId: tokenRules.contractId,
                    createdEventBlob: tokenRules.createdEventBlob!,
                    synchronizerId: tokenRules.synchronizerId,
                },
            ],
            synchronizerId: appSynchronizerId,
        })
        .sign(alice.keyPair.privateKey)
        .execute({ partyId: alice.partyId })

    logger.info(
        `Alice: ${TRADE_TOKEN_AMOUNT} TestToken self-transferred on app-synchronizer`
    )
}

export async function bobSelfTransferToApp(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const { p2Sdk, bob, tokenAdmin, appSynchronizerId } = setup

    const [bobTokens, tokenRulesContracts] = await Promise.all([
        p2Sdk.ledger.acs.read({
            templateIds: [TestTokenV1.Token.templateId],
            parties: [bob.partyId],
            filterByParty: true,
        }),
        p2Sdk.ledger.acs.read({
            templateIds: [TestTokenV1.TokenRules.templateId],
            parties: [tokenAdmin.partyId],
            filterByParty: true,
        }),
    ])

    if (bobTokens.length === 0) {
        logger.info('Bob: no TestToken holdings to self-transfer')
        return
    }
    const tokenRules = tokenRulesContracts.find(
        (c) => c.synchronizerId === appSynchronizerId
    )
    if (!tokenRules) throw new Error('TokenRules not found on app-synchronizer')

    for (const token of bobTokens) {
        const holdingAmount = (
            token as unknown as {
                createArgument: SpliceTestTokenTypes.Testing.Tokens.TestTokenV1.Token
            }
        ).createArgument.holding.amount
        if (!holdingAmount)
            throw new Error('Cannot read amount from Bob Token holding')

        await p2Sdk.ledger.internal.reassign({
            submitter: bob.partyId,
            contractId: token.contractId,
            source: token.synchronizerId,
            target: appSynchronizerId,
            skipIfAlreadyOn: true,
        })

        await p2Sdk.ledger
            .prepare({
                partyId: bob.partyId,
                commands: [
                    buildTransferTokenCommand({
                        tokenRulesCid: tokenRules.contractId,
                        expectedAdmin: tokenAdmin.partyId,
                        sender: bob.partyId,
                        receiver: bob.partyId,
                        amount: holdingAmount,
                        admin: tokenAdmin.partyId,
                        inputHoldingCids: [token.contractId],
                        requestedAt: new Date(Date.now()).toISOString(),
                        executeBefore: new Date(
                            Date.now() + MS_24_HOURS
                        ).toISOString(),
                    }),
                ],
                disclosedContracts: [
                    {
                        templateId: tokenRules.templateId,
                        contractId: tokenRules.contractId,
                        createdEventBlob: tokenRules.createdEventBlob!,
                        synchronizerId: tokenRules.synchronizerId,
                    },
                ],
                synchronizerId: appSynchronizerId,
            })
            .sign(bob.keyPair.privateKey)
            .execute({ partyId: bob.partyId })
    }

    logger.info(
        `Bob: TestToken self-transferred on app-synchronizer ` +
            `(Canton auto-reassigned Bob's Token from global → app)`
    )
}
