// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TestToken } from '@canton-network/core-splice-codegen'
import sdk from '../../common/sdk'
import { operator } from '../../common/operator'
import z from 'zod'
import { APIError, emptyChoiceContext } from '../common'
import { OffLedger } from '@canton-network/core-token-standard'
import { TExpressOpenApiRequestHandler } from 'openapi-ts-router/express'
import { synchronizerId } from '../../common/synchronizer'

export const getTransferFactoryChoiceArgumentsSchema = z.object({
    sender: z.string(),
    receiver: z.string(),
    transferKind: z
        .union([z.literal('self'), z.literal('offer'), z.literal('direct')])
        .optional(),
})

/**
 * Resolves or creates a transfer factory for initiating transfer instruction workflows.
 *
 * @throws {400} When provided body request is invalid.
 * @throws {500} when instantiating new allocation factory contract has failed.
 * @returns Factory identifier, resolved transfer kind, and choice context on success.
 */
export const getTransferFactory: TExpressOpenApiRequestHandler<
    OffLedger.TransferInstructionV1.paths['/registry/transfer-instruction/v1/transfer-factory']['post']
> = async (req, res, next) => {
    // get choice arguments and invalidate them
    const { choiceArguments } = req.body

    const parsedChoiceArguments =
        getTransferFactoryChoiceArgumentsSchema.safeParse(choiceArguments)

    if (!parsedChoiceArguments.success) {
        next(
            new APIError(
                400,
                JSON.stringify(JSON.parse(parsedChoiceArguments.error.message))
            )
        )
        return
    }

    const isToSelf =
        parsedChoiceArguments.data.sender ===
        parsedChoiceArguments.data.receiver

    const transferKind =
        parsedChoiceArguments.data.transferKind ?? (isToSelf ? 'self' : 'offer')

    // fetch the factory contract (if existing)...
    const fetchedFactories = await sdk.ledger.acsReader.readJsContracts({
        filterByParty: true,
        parties: [operator.party],
        templateIds: [TestToken.DAR.TestTokenV1.TokenRules.templateId],
    })

    // multi-sync mode
    if (synchronizerId.transferInstruction) {
        const syncFactory = fetchedFactories.find(
            (factory) =>
                factory.synchronizerId === synchronizerId.transferInstruction
        )
        if (syncFactory) {
            res.json({
                factoryId: syncFactory.contractId,
                transferKind,
                choiceContext: emptyChoiceContext,
            })
            return
        }
    }

    if (fetchedFactories[0]) {
        res.json({
            factoryId: fetchedFactories[0].contractId,
            transferKind,
            choiceContext: emptyChoiceContext,
        })
        return
    }

    // ...and create one otherwise
    const executionResult = await sdk.ledger
        .prepare({
            partyId: operator.party,
            commands: TestToken.commands.create.rules({
                admin: operator.party,
            }),
            ...(synchronizerId.transferInstruction
                ? { synchronizerId: synchronizerId.transferInstruction }
                : {}),
        })
        .sign(operator.keys.privateKey)
        .execute({
            partyId: operator.party,
        })

    // fetch the newly created contract id
    const factoryContract = (
        await sdk.ledger.acsReader.readJsContracts({
            filterByParty: true,
            parties: [operator.party],
            offset: executionResult.completionOffset,
            templateIds: [TestToken.DAR.TestTokenV1.TokenRules.templateId],
        })
    )[0]

    if (!factoryContract) {
        next(
            new APIError(
                500,
                `Error instantiating transfer factory (completionOffset=${executionResult.completionOffset}`
            )
        )
        return
    }

    res.json({
        factoryId: factoryContract.contractId,
        transferKind,
        choiceContext: emptyChoiceContext,
    })
}
