// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import sdk from '../../common/sdk'
import { operator } from '../../common/operator'
import { TestToken } from '@canton-network/core-splice-codegen'
import { APIError, emptyChoiceContext } from '../common'
import { OffLedger } from '@canton-network/core-token-standard'
import { TExpressOpenApiRequestHandler } from 'openapi-ts-router/express'

/**
 * Resolves or creates an allocation factory for initiating allocation workflows.
 *
 * @throws {500} when instantiating new allocation factory contract has failed.
 * @returns Factory identifier with choice context on success.
 */
export const getAllocationFactory: TExpressOpenApiRequestHandler<
    OffLedger.AllocationInstructionV1.paths['/registry/allocation-instruction/v1/allocation-factory']['post']
> = async (_req, res, next) => {
    // fetch factory contract (if existing)...
    const fetchedFactory = (
        await sdk.ledger.acsReader.readJsContracts({
            filterByParty: true,
            parties: [operator.party],
            templateIds: [TestToken.DAR.TestTokenV1.TokenRules.templateId],
        })
    )[0]

    if (fetchedFactory) {
        res.json({
            factoryId: fetchedFactory.contractId,
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
        choiceContext: emptyChoiceContext,
    })
}
