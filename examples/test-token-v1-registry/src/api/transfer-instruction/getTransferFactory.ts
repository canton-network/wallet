// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TestTokenV1 } from '@canton-network/core-token-standard'
import sdk from '../../common/sdk'
import { emptyChoiceContext, TransferInstructionAPIHandler } from './common'
import { admin } from '../../common/admin'
import { GetFactoryRequest } from '../../openapi-ts/transfer-instruction-v1'
import z from 'zod'

export const GetTransferFactoryChoiceArguments = z.object({
    sender: z.string(),
    receiver: z.string(),
    transferKind: z.optional(
        z.union([z.literal('self'), z.literal('offer'), z.literal('direct')])
    ),
})

export const getTransferFactory: TransferInstructionAPIHandler<
    'getTransferFactory'
> = async (ctx) => {
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

    const transferKind =
        (parsedChoiceArguments.data.transferKind ??
        parsedChoiceArguments.data.sender ===
            parsedChoiceArguments.data.receiver)
            ? 'self'
            : 'offer'

    const fetchedFactory = (
        await sdk.ledger.acsReader.readJsContracts({
            filterByParty: true,
            parties: [admin.party],
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

    const executionResult = await sdk.ledger
        .prepare({
            partyId: admin.party,
            commands: sdk.testToken.create.rules({ admin: admin.party }),
        })
        .sign(admin.keys.privateKey)
        .execute({
            partyId: admin.party,
        })

    const factoryContracts = await sdk.ledger.acsReader.readJsContracts({
        filterByParty: true,
        parties: [admin.party],
        offset: executionResult.completionOffset,
        templateIds: [TestTokenV1.TokenRules.templateId],
    })

    const factoryContract = factoryContracts[0]

    if (!factoryContract) {
        return {
            status: 500,
            payload: {
                error: `Error instantiating transfer factory (completionOffset=${executionResult.completionOffset}, contractsAtOffset=${factoryContracts.length}`,
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
