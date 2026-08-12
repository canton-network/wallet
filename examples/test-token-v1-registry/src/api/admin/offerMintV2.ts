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

function extractOfferCid(result: unknown): string | undefined {
    if (!result || typeof result !== 'object') return undefined
    const record = result as Record<string, unknown>
    if (typeof record.offerCid === 'string') return record.offerCid
    const exerciseResult = record.exerciseResult
    if (exerciseResult && typeof exerciseResult === 'object') {
        const cid = (exerciseResult as Record<string, unknown>).offerCid
        if (typeof cid === 'string') return cid
    }
    return undefined
}

function offerReceiverOwner(offer: {
    createArgument?: unknown
    payload?: unknown
}): string | undefined {
    const args = (offer.createArgument ?? offer.payload) as
        { transfer?: { receiver?: { owner?: string } } } | undefined
    return args?.transfer?.receiver?.owner
}

/**
 * Dev-only mint helper: TokenRules_OfferMint for a receiver party.
 * Caller must accept the resulting transfer offer to receive holdings.
 * @customize This route only checks that a Bearer header is present. Validate
 * the JWT (or bind to localhost / disable the route) before any non-local deploy.
 */
adminAPIRouter.post('/admin/v2/offer-mint', async (req, res, next) => {
    try {
        const authorization = req.headers.authorization
        const token = Array.isArray(authorization)
            ? authorization[0]
            : authorization
        if (!token?.startsWith('Bearer')) {
            throw new APIError(
                401,
                'Authorization header with Bearer token is required'
            )
        }

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

        const offerCidFromResult = extractOfferCid(result)
        let offerCid = offerCidFromResult
        if (!offerCid) {
            const offers = await sdk.ledger.acsReader.readJsContracts({
                filterByParty: true,
                parties: [receiver, operator.party],
                offset: result.completionOffset,
                templateIds: [
                    TestTokenV2.Transfer.TokenTransferOffer.templateId,
                ],
            })
            const matching = offers.filter(
                (offer) => offerReceiverOwner(offer) === receiver
            )
            let offer = matching[0]
            for (const candidate of matching) {
                if ((candidate.offset ?? 0) > (offer?.offset ?? 0)) {
                    offer = candidate
                }
            }
            offerCid = offer?.contractId
        }

        if (!offerCid) {
            throw new APIError(
                500,
                `OfferMint succeeded but no TokenTransferOffer found (offset=${result.completionOffset})`
            )
        }

        res.json({
            offerCid,
            updateId: result.updateId,
            completionOffset: result.completionOffset,
        })
    } catch (e) {
        next(e instanceof APIError ? e : new APIError(500, String(e)))
    }
})

export default adminAPIRouter
