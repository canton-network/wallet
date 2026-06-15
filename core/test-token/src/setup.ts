// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import type { PrivateKey } from '@canton-network/core-signing-lib'
import type { SDKInterface } from '@canton-network/wallet-sdk'
import { Splice } from '@daml.js/splice-test-token-v1-1.0.0'
import {
    buildCreateTokenRulesCommand,
    buildMintTokenCommand,
    buildTransferTokenCommand,
    buildAcceptTransferInstructionCommand,
} from './commands.js'

const TestTokenV1 = Splice.Testing.Tokens.TestTokenV1

/** Default validity window for a mint's transfer offer: 24 hours. */
const DEFAULT_TRANSFER_VALIDITY_MS = 24 * 60 * 60 * 1000

export interface SigningParty {
    partyId: string
    privateKey: PrivateKey
}

export interface CreateTokenRulesParams {
    sdk: SDKInterface<'token'>
    admin: SigningParty
    synchronizerIds: string[]
    logger?: Logger
}

/**
 * Creates a `TokenRules` contract administered by `admin` on each of the given
 * synchronizers (prepared, signed, and executed in parallel per synchronizer).
 */
export async function createTokenRules(
    params: CreateTokenRulesParams
): Promise<void> {
    const { sdk, admin, synchronizerIds, logger } = params

    await sdk.ledger.executeOnSynchronizers(
        {
            partyId: admin.partyId,
            commands: buildCreateTokenRulesCommand(admin.partyId),
            disclosedContracts: [],
        },
        synchronizerIds,
        admin.privateKey
    )

    logger?.info(
        `TokenRules created on ${synchronizerIds.length} synchronizer(s)`
    )
}

export interface MintTestTokenParams {
    sdk: SDKInterface<'token'>
    admin: SigningParty
    receiver: SigningParty
    amount: string
    synchronizerId: string
    transferValidityMs?: number
    logger?: Logger
}

/**
 * Mints `amount` TestToken into `receiver`'s wallet on `synchronizerId`.
 *
 * The TestToken DAR has no direct mint-to-arbitrary-party choice, so this runs
 * the full flow: `admin` mints a holding to itself, transfers it to `receiver`
 * (creating a `TokenTransferOffer`), and `receiver` accepts the offer.
 */
export async function mintTestToken(
    params: MintTestTokenParams
): Promise<void> {
    const { sdk, admin, receiver, amount, synchronizerId, logger } = params
    const validityMs = params.transferValidityMs ?? DEFAULT_TRANSFER_VALIDITY_MS

    await sdk.ledger
        .prepare({
            partyId: admin.partyId,
            commands: [
                buildMintTokenCommand({
                    owner: admin.partyId,
                    admin: admin.partyId,
                    amount,
                }),
            ],
            disclosedContracts: [],
            synchronizerId,
        })
        .sign(admin.privateKey)
        .execute({ partyId: admin.partyId })

    const [tokenRulesContracts, adminTokenHoldings] = await Promise.all([
        sdk.ledger.acs.read({
            templateIds: [TestTokenV1.TokenRules.templateId],
            parties: [admin.partyId],
            filterByParty: true,
        }),
        sdk.ledger.acs.read({
            templateIds: [TestTokenV1.Token.templateId],
            parties: [admin.partyId],
            filterByParty: true,
        }),
    ])
    const tokenRules = tokenRulesContracts.find(
        (c) => c.synchronizerId === synchronizerId
    )
    if (!tokenRules)
        throw new Error('TokenRules not found on synchronizer after creation')
    const adminTokenCid = adminTokenHoldings[0]?.contractId
    if (!adminTokenCid)
        throw new Error('Admin Token holding not found after mint')

    await sdk.ledger
        .prepare({
            partyId: admin.partyId,
            commands: [
                buildTransferTokenCommand({
                    tokenRulesCid: tokenRules.contractId,
                    expectedAdmin: admin.partyId,
                    sender: admin.partyId,
                    receiver: receiver.partyId,
                    amount,
                    admin: admin.partyId,
                    inputHoldingCids: [adminTokenCid],
                    requestedAt: new Date(Date.now()).toISOString(),
                    executeBefore: new Date(
                        Date.now() + validityMs
                    ).toISOString(),
                }),
            ],
            disclosedContracts: [],
            synchronizerId,
        })
        .sign(admin.privateKey)
        .execute({ partyId: admin.partyId })

    const transferOffers = await sdk.ledger.acs.read({
        templateIds: [TestTokenV1.TokenTransferOffer.templateId],
        parties: [receiver.partyId],
        filterByParty: true,
    })
    const transferOfferCid = transferOffers[0]?.contractId
    if (!transferOfferCid)
        throw new Error('TokenTransferOffer not found for receiver')

    await sdk.ledger
        .prepare({
            partyId: receiver.partyId,
            commands: [buildAcceptTransferInstructionCommand(transferOfferCid)],
            disclosedContracts: [],
            synchronizerId,
        })
        .sign(receiver.privateKey)
        .execute({ partyId: receiver.partyId })

    logger?.info(`${amount} TestToken minted to receiver on synchronizer`)
}
