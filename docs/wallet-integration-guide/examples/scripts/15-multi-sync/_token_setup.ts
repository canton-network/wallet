// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import {
    buildCreateTokenRulesCommand,
    buildMintTokenCommand,
    buildTransferTokenCommand,
    buildAcceptTransferInstructionCommand,
} from '@canton-network/core-test-token'
import * as SpliceTestTokenV1 from '@canton-network/core-test-token'
import type { MultiSyncSetup } from './_setup.js'
import { BOB_TOKEN_MINT_AMOUNT } from './_constants.js'

const TestTokenV1 = SpliceTestTokenV1.Splice.Testing.Tokens.TestTokenV1

const MS_24_HOURS = 24 * 60 * 60 * 1000

export async function createTokenRulesAndMintForBob(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const {
        appProviderSdk,
        bob,
        tokenAdmin,
        globalSynchronizerId,
        appSynchronizerId,
    } = setup

    await appProviderSdk.ledger.executeOnSynchronizers(
        {
            partyId: tokenAdmin.partyId,
            commands: buildCreateTokenRulesCommand(tokenAdmin.partyId),
            disclosedContracts: [],
        },
        [globalSynchronizerId, appSynchronizerId],
        tokenAdmin.keyPair.privateKey
    )

    await appProviderSdk.ledger
        .prepare({
            partyId: tokenAdmin.partyId,
            commands: [
                buildMintTokenCommand({
                    owner: tokenAdmin.partyId,
                    admin: tokenAdmin.partyId,
                    amount: BOB_TOKEN_MINT_AMOUNT,
                }),
            ],
            disclosedContracts: [],
            synchronizerId: appSynchronizerId,
        })
        .sign(tokenAdmin.keyPair.privateKey)
        .execute({ partyId: tokenAdmin.partyId })

    const [tokenRulesContracts, adminTokenHoldings] = await Promise.all([
        appProviderSdk.ledger.acs.read({
            templateIds: [TestTokenV1.TokenRules.templateId],
            parties: [tokenAdmin.partyId],
            filterByParty: true,
        }),
        appProviderSdk.ledger.acs.read({
            templateIds: [TestTokenV1.Token.templateId],
            parties: [tokenAdmin.partyId],
            filterByParty: true,
        }),
    ])
    const appTokenRules = tokenRulesContracts.find(
        (c) => c.synchronizerId === appSynchronizerId
    )
    if (!appTokenRules)
        throw new Error(
            'TokenRules not found on app synchronizer after creation'
        )
    const adminTokenCid = adminTokenHoldings[0]?.contractId
    if (!adminTokenCid)
        throw new Error('TokenAdmin Token holding not found after mint')

    await appProviderSdk.ledger
        .prepare({
            partyId: tokenAdmin.partyId,
            commands: [
                buildTransferTokenCommand({
                    tokenRulesCid: appTokenRules.contractId,
                    expectedAdmin: tokenAdmin.partyId,
                    sender: tokenAdmin.partyId,
                    receiver: bob.partyId,
                    amount: BOB_TOKEN_MINT_AMOUNT,
                    admin: tokenAdmin.partyId,
                    inputHoldingCids: [adminTokenCid],
                    requestedAt: new Date(Date.now()).toISOString(),
                    executeBefore: new Date(
                        Date.now() + MS_24_HOURS
                    ).toISOString(),
                }),
            ],
            disclosedContracts: [],
            synchronizerId: appSynchronizerId,
        })
        .sign(tokenAdmin.keyPair.privateKey)
        .execute({ partyId: tokenAdmin.partyId })

    const transferOffers = await appProviderSdk.ledger.acs.read({
        templateIds: [TestTokenV1.TokenTransferOffer.templateId],
        parties: [bob.partyId],
        filterByParty: true,
    })
    const transferOfferCid = transferOffers[0]?.contractId
    if (!transferOfferCid)
        throw new Error('TokenTransferOffer not found for Bob')

    await appProviderSdk.ledger
        .prepare({
            partyId: bob.partyId,
            commands: [buildAcceptTransferInstructionCommand(transferOfferCid)],
            disclosedContracts: [],
            synchronizerId: appSynchronizerId,
        })
        .sign(bob.keyPair.privateKey)
        .execute({ partyId: bob.partyId })

    logger.info(
        `TokenAdmin: TokenRules created on global + app synchronizers; Bob: ${BOB_TOKEN_MINT_AMOUNT} TestToken minted on app-synchronizer`
    )
}
