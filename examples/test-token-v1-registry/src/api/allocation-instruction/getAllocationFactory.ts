// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import sdk from '../../common/sdk'
import { operator } from '../../common/operator'
import { command, TestTokenV1 } from '@canton-network/core-test-token'
import { emptyChoiceContext } from '../common'
import { APIHandler } from '../../types'
import { OffLedger } from '@canton-network/core-token-standard'

/**
 * Resolves or creates an allocation factory for initiating allocation workflows.
 *
 * @throws {400} When provided body request is invalid.
 * @throws {500} when instantiating new allocation factory contract has failed.
 * @returns Factory identifier with choice context on success.
 */
export const getAllocationFactory: APIHandler<
    OffLedger.AllocationInstructionV1.paths['/registry/allocation-instruction/v1/allocation-factory']['post']
> = async () => {
    // fetch factory contract (if existing)...
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
            choiceContext: emptyChoiceContext,
        },
    }
}
