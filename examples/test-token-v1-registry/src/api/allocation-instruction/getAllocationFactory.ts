// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import z from 'zod'
import { AllocationInstructionAPIHandler } from './common'
import { GetFactoryRequest } from '../../openapi-ts/allocation-instruction-v1'
import sdk from '../../common/sdk'
import { admin } from '../../common/admin'
import { TestTokenV1 } from '@canton-network/core-token-standard'
import { emptyChoiceContext } from '../common'

export const GetTransferFactoryChoiceArguments = z.object({
    sender: z.string(),
    receiver: z.string(),
})

/**
 * Resolves or creates an allocation factory for initiating allocation workflows.
 *
 * @throws {400} When provided body request is invalid.
 * @throws {500} when instantiating new allocation factory contract has failed.
 * @returns Factory identifier with choice context on success.
 */
export const getAllocationFactory: AllocationInstructionAPIHandler<
    'getAllocationFactory'
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

    const factoryContract = (
        await sdk.ledger.acsReader.readJsContracts({
            filterByParty: true,
            parties: [admin.party],
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
            choiceContext: emptyChoiceContext,
        },
    }
}
