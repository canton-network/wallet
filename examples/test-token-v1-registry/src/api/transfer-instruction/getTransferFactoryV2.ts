// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { APIError } from '../common'
import {
    buildTokenRulesV2ChoiceContext,
    resolveOrCreateTokenRulesV2,
} from '../token-rules-v2.js'
import { OffLedger } from '@canton-network/core-token-standard'
import { TExpressOpenApiRequestHandler } from 'openapi-ts-router/express'
import z from 'zod'

const accountSchema = z.object({
    owner: z.string().nullable().optional(),
    provider: z.string().nullable().optional(),
    id: z.string(),
})

export const getTransferFactoryV2ChoiceArgumentsSchema = z.object({
    transfer: z
        .object({
            sender: accountSchema,
            receiver: accountSchema,
        })
        .passthrough(),
    actors: z.array(z.string()).optional(),
    transferKind: z.optional(
        z.union([z.literal('self'), z.literal('offer'), z.literal('direct')])
    ),
})

/**
 * Resolves or creates a CIP-0112 transfer factory (TestTokenV2 TokenRules).
 */
export const getTransferFactoryV2: TExpressOpenApiRequestHandler<
    OffLedger.TransferInstructionV2.paths['/registry/transfer-instruction/v2/transfer-factory']['post']
> = async (req, res, next) => {
    const { choiceArguments } = req.body

    const parsedChoiceArguments =
        getTransferFactoryV2ChoiceArgumentsSchema.safeParse(choiceArguments)

    if (!parsedChoiceArguments.success) {
        next(
            new APIError(
                400,
                JSON.stringify(JSON.parse(parsedChoiceArguments.error.message))
            )
        )
        return
    }

    const senderOwner = parsedChoiceArguments.data.transfer.sender.owner
    const receiverOwner = parsedChoiceArguments.data.transfer.receiver.owner
    const isToSelf = senderOwner != null && senderOwner === receiverOwner
    const transferKind =
        parsedChoiceArguments.data.transferKind ?? (isToSelf ? 'self' : 'offer')

    try {
        const factoryId = await resolveOrCreateTokenRulesV2()
        res.json({
            factoryId,
            transferKind,
            choiceContext: await buildTokenRulesV2ChoiceContext(),
        })
    } catch (e) {
        next(e instanceof APIError ? e : new APIError(500, String(e)))
    }
}
