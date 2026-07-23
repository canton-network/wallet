// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AllocationInstructionAPIHandler } from './common'
import sdk from '../../common/sdk'
import { admin } from '../../common/admin'
import { command, TestTokenV1 } from '@canton-network/core-test-token'
import { emptyChoiceContext } from '../common'

/**
 * Resolves or creates an allocation factory for initiating allocation workflows.
 *
 * @throws {400} When provided body request is invalid.
 * @throws {500} when instantiating new allocation factory contract has failed.
 * @returns Factory identifier with choice context on success.
 */
export const getAllocationFactory: AllocationInstructionAPIHandler<
    'getAllocationFactory'
> = async () => {
    // fetch factory contract (if existing)...
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

    // ...and create one otherwise
    const executionResult = await sdk.ledger
        .prepare({
            partyId: admin.party,
            commands: command.create.rules({ admin: admin.party }),
        })
        .sign(admin.keys.privateKey)
        .execute({
            partyId: admin.party,
        })

    // fetch the newly created contract id
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
