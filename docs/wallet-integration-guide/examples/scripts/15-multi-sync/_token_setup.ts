// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import {
    buildCreateTokenRulesCommand,
    buildMintTokenCommand,
} from '@canton-network/core-test-token'
import * as SpliceTestTokenV1 from '@canton-network/core-test-token'
import type { MultiSyncSetup } from './_setup.js'
import { BOB_TOKEN_MINT_AMOUNT } from './_constants.js'

const TestTokenV1 = SpliceTestTokenV1.Splice.Testing.Tokens.TestTokenV1

/**
 * Creates a `TokenRules` contract for the TokenAdmin party on a single
 * synchronizer. Passed to the TestToken registry as its `createTokenRules`
 * callback so the registry can deploy the token's `TokenRules` on each
 * configured synchronizer as part of initialization.
 */
export async function createTokenRules(
    setup: MultiSyncSetup,
    synchronizerId: string
): Promise<void> {
    const { tokenAdminSdk, tokenAdmin } = setup

    await tokenAdminSdk.ledger
        .prepare({
            partyId: tokenAdmin.partyId,
            commands: buildCreateTokenRulesCommand(tokenAdmin.partyId),
            disclosedContracts: [],
            synchronizerId,
        })
        .sign(tokenAdmin.keyPair.privateKey)
        .execute({ partyId: tokenAdmin.partyId })
}

/**
 * Mints TestTokens for the TokenAdmin and offers them to Bob via the registry's
 * transfer-instruction-v1 API, which Bob then accepts. Assumes the TestToken
 * `TokenRules` contracts already exist (created by the registry on start-up).
 */
export async function mintAndTransferTokenToBob(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const {
        appBobSdk,
        tokenAdminSdk,
        bobTokenNamespace,
        tokenAdminTokenNamespace,
        bob,
        tokenAdmin,
        testTokenSynchronizerId,
        testTokenRegistryUrl,
    } = setup

    await tokenAdminSdk.ledger
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
            synchronizerId: testTokenSynchronizerId,
        })
        .sign(tokenAdmin.keyPair.privateKey)
        .execute({ partyId: tokenAdmin.partyId })

    const adminTokenHoldings = await tokenAdminSdk.ledger.acs.read({
        templateIds: [TestTokenV1.Token.templateId],
        parties: [tokenAdmin.partyId],
        filterByParty: true,
    })
    const adminTokenCid = adminTokenHoldings[0]?.contractId
    if (!adminTokenCid)
        throw new Error('TokenAdmin Token holding not found after mint')

    // TokenAdmin offers the freshly-minted TestToken to Bob. The transfer factory
    // and choice context come from the registry's transfer-instruction-v1 API
    // (the TestToken registry is also resolved via the metadata-v1 API).
    const [transferCommand, transferDisclosed] =
        await tokenAdminTokenNamespace.transfer.create({
            sender: tokenAdmin.partyId,
            recipient: bob.partyId,
            amount: BOB_TOKEN_MINT_AMOUNT,
            instrumentId: 'TestToken',
            registryUrl: testTokenRegistryUrl,
            inputUtxos: [adminTokenCid],
        })

    await tokenAdminSdk.ledger
        .prepare({
            partyId: tokenAdmin.partyId,
            commands: [transferCommand],
            disclosedContracts: transferDisclosed,
            synchronizerId: testTokenSynchronizerId,
        })
        .sign(tokenAdmin.keyPair.privateKey)
        .execute({ partyId: tokenAdmin.partyId })

    const transferOffers = await appBobSdk.ledger.acs.read({
        templateIds: [TestTokenV1.TokenTransferOffer.templateId],
        parties: [bob.partyId],
        filterByParty: true,
    })
    const transferOfferCid = transferOffers[0]?.contractId
    if (!transferOfferCid)
        throw new Error('TokenTransferOffer not found for Bob')

    // Bob accepts the transfer offer using the registry's transfer-instruction-v1
    // accept choice context.
    const [acceptCommand, acceptDisclosed] =
        await bobTokenNamespace.transfer.accept({
            transferInstructionCid: transferOfferCid,
            registryUrl: testTokenRegistryUrl,
        })

    await appBobSdk.ledger
        .prepare({
            partyId: bob.partyId,
            commands: [acceptCommand],
            disclosedContracts: acceptDisclosed,
            synchronizerId: testTokenSynchronizerId,
        })
        .sign(bob.keyPair.privateKey)
        .execute({ partyId: bob.partyId })

    logger.info(
        `Bob: ${BOB_TOKEN_MINT_AMOUNT} TestToken minted on app-synchronizer via registry transfer-factory`
    )
}
