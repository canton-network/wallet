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

export async function createTokenRulesAndMintForBob(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const {
        appProviderSdk,
        tokenNamespaceAppProvider,
        bob,
        tokenAdmin,
        globalSynchronizerId,
        appSynchronizerId,
        testTokenRegistryUrl,
    } = setup

    await appProviderSdk.ledger.prepareAndExecuteOnSynchronizers(
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

    const adminTokenHoldings = await appProviderSdk.ledger.acs.read({
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
        await tokenNamespaceAppProvider.transfer.create({
            sender: tokenAdmin.partyId,
            recipient: bob.partyId,
            amount: BOB_TOKEN_MINT_AMOUNT,
            instrumentId: 'TestToken',
            registryUrl: testTokenRegistryUrl,
            inputUtxos: [adminTokenCid],
        })

    await appProviderSdk.ledger
        .prepare({
            partyId: tokenAdmin.partyId,
            commands: [transferCommand],
            disclosedContracts: transferDisclosed,
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

    // Bob accepts the transfer offer using the registry's transfer-instruction-v1
    // accept choice context.
    const [acceptCommand, acceptDisclosed] =
        await tokenNamespaceAppProvider.transfer.accept({
            transferInstructionCid: transferOfferCid,
            registryUrl: testTokenRegistryUrl,
        })

    await appProviderSdk.ledger
        .prepare({
            partyId: bob.partyId,
            commands: [acceptCommand],
            disclosedContracts: acceptDisclosed,
            synchronizerId: appSynchronizerId,
        })
        .sign(bob.keyPair.privateKey)
        .execute({ partyId: bob.partyId })

    logger.info(
        `TokenAdmin: TokenRules created on global + app synchronizers; Bob: ${BOB_TOKEN_MINT_AMOUNT} TestToken minted on app-synchronizer via registry transfer-factory`
    )
}
