// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import { TestToken } from '@canton-network/core-splice-codegen'
import type { MultiSyncSetup } from './_setup.js'
import { TRADE_TOKEN_AMOUNT } from './_constants.js'
import { pollUntilFound } from './_poll.js'

export async function aliceTransferToCharlie(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const { aliceSdk, charlieSdk, alice, charlie, appSynchronizerId } = setup

    // Resolve the TestToken registry URL from the SDK's configured registries (`token.find`) instead of threading it through the setup object.
    const { registryUrl: testTokenRegistryUrl } = await aliceSdk.token.find(
        TestToken.DAR.TestTokenID
    )

    // Poll app-user until it becomes visible instead of reading once (cross-participant read-after-write).
    const aliceToken = await pollUntilFound(
        async () =>
            (
                await aliceSdk.ledger.acsReader.raw.readJsContracts({
                    templateIds: [TestToken.DAR.TestTokenV1.Token.templateId],
                    parties: [alice.partyId],
                    filterByParty: true,
                })
            )[0],
        'Alice: Token holding not found after settlement'
    )

    // Alice offers her freshly-received TestToken to Charlie via the registry's
    const [transferCommand, transferDisclosed] =
        await aliceSdk.token.v1.transfer.create({
            sender: alice.partyId,
            recipient: charlie.partyId,
            amount: TRADE_TOKEN_AMOUNT,
            instrumentId: TestToken.DAR.TestTokenID,
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

    const transferOffers =
        await charlieSdk.ledger.acsReader.raw.readJsContracts({
            templateIds: [
                TestToken.DAR.TestTokenV1.TokenTransferOffer.templateId,
            ],
            parties: [charlie.partyId],
            filterByParty: true,
        })
    const transferOfferCid = transferOffers[0]?.contractId
    if (!transferOfferCid)
        throw new Error('TokenTransferOffer not found for Charlie')

    const [acceptCommand, acceptDisclosed] =
        await charlieSdk.token.v1.transfer.accept({
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
