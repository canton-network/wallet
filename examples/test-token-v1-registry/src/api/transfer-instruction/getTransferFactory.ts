// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TestTokenV1, command } from '@canton-network/core-test-token'
import sdk from '../../common/sdk'
import { TransferInstructionAPIHandler } from './common'
import { operator } from '../../common/operator'
import { GetFactoryRequest } from '../../openapi-ts/transfer-instruction-v1'
import z from 'zod'
import { emptyChoiceContext } from '../common'

export const GetTransferFactoryChoiceArguments = z.object({
    sender: z.string(),
    receiver: z.string(),
    transferKind: z.optional(
        z.union([z.literal('self'), z.literal('offer'), z.literal('direct')])
    ),
})

/**
 * Resolves or creates a transfer factory for initiating transfer instruction workflows.
 *
 * @throws {400} When provided body request is invalid.
 * @throws {500} when instantiating new allocation factory contract has failed.
 * @returns Factory identifier, resolved transfer kind, and choice context on success.
 */
export const getTransferFactory: TransferInstructionAPIHandler<
    'getTransferFactory'
> = async (ctx) => {
    // get choice arguments and invalidate them
    const { choiceArguments } = ctx.request.body as GetFactoryRequest

    const parsedChoiceArguments =
        GetTransferFactoryChoiceArguments.safeParse(choiceArguments)

    if (!parsedChoiceArguments.success) {
        return {
            status: 400,
            payload: {
                error: JSON.stringify(
                    JSON.parse(parsedChoiceArguments.error.message)
                ),
            },
        }
    }

    const isToSelf =
        parsedChoiceArguments.data.sender ===
        parsedChoiceArguments.data.receiver

    const transferKind =
        parsedChoiceArguments.data.transferKind ?? (isToSelf ? 'self' : 'offer')

    // fetch the factory contract (if existing)...
    const fetchedFactory = (
        await sdk.ledger.acsReader.readJsContracts({
            filterByParty: true,
            parties: [operator.party],
            templateIds: [TestTokenV1.TokenRules.templateId],
        })
    )[0]

    if (fetchedFactory) {
        return {
            payload: {
                factoryId: fetchedFactory.contractId,
                transferKind,
                choiceContext: emptyChoiceContext,
            },
        }
    }

    // ...and create one otherwise
    const executionResult = await sdk.ledger
        .prepare({
            partyId: operator.party,
            commands: command.create.rules({ admin: operator.party }),
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
            templateIds: [TestTokenV1.TokenRules.templateId],
        })
    )[0]

    if (!factoryContract) {
        return {
            status: 500,
            payload: {
                error: `Error instantiating transfer factory (completionOffset=${executionResult.completionOffset}`,
            },
        }
    }

    return {
        payload: {
            factoryId: factoryContract.contractId,
            transferKind,
            choiceContext: emptyChoiceContext,
        },
    }
}
