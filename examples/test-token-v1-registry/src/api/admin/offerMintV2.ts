// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Router } from 'express'
import {
    TestTokenV2,
    TestTokenV2ID,
    commandV2,
} from '@canton-network/core-test-token'
import { basicAccount } from '@canton-network/core-token-standard'
import sdk from '../../common/sdk'
import { operator } from '../../common/operator'
import { APIError } from '../common'
import { resolveOrCreateTokenRulesV2 } from '../token-rules-v2.js'

const adminAPIRouter = Router()

/**
 * Dev-only mint helper: TokenRules_OfferMint for a receiver party.
 * Caller must accept the resulting transfer offer to receive holdings.
 */
adminAPIRouter.post('/admin/v2/offer-mint', async (req, res, next) => {
    try {
        const receiver = req.body?.receiver as string | undefined
        const amount = (req.body?.amount as string | undefined) ?? '100.0'
        const instrumentId =
            (req.body?.instrumentId as string | undefined) ?? TestTokenV2ID

        if (!receiver) {
            throw new APIError(400, 'receiver party is required')
        }

        const factoryId = await resolveOrCreateTokenRulesV2()
        const account = basicAccount(receiver)
        const receiverConfig = {
            admin: operator.party,
            account,
            ownerConfig: { canInitiate: true, mustApprove: false },
            providerConfig: { canInitiate: false, mustApprove: false },
        }

        const result = await sdk.ledger
            .prepare({
                partyId: operator.party,
                commands: [
                    commandV2.exercise.rules.offerMint({
                        contractId: factoryId,
                        choiceArgument: {
                            receiver: account,
                            amount,
                            instrumentId: {
                                admin: operator.party,
                                id: instrumentId,
                            },
                            offeredAt: new Date().toISOString(),
                            receiverConfig,
                        },
                    }),
                ],
            })
            .sign(operator.keys.privateKey)
            .execute({ partyId: operator.party })

        const offers = await sdk.ledger.acsReader.readJsContracts({
            filterByParty: true,
            parties: [receiver, operator.party],
            offset: result.completionOffset,
            templateIds: [TestTokenV2.Transfer.TokenTransferOffer.templateId],
        })

        const offer = offers[offers.length - 1]
        if (!offer) {
            throw new APIError(
                500,
                `OfferMint succeeded but no TokenTransferOffer found (offset=${result.completionOffset})`
            )
        }

        res.json({
            offerCid: offer.contractId,
            updateId: result.updateId,
            completionOffset: result.completionOffset,
        })
    } catch (e) {
        next(e instanceof APIError ? e : new APIError(500, String(e)))
    }
})

export default adminAPIRouter
