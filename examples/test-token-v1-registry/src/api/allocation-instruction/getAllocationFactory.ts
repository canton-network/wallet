// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TestToken } from '@canton-network/core-splice-codegen'
import { APIError, emptyChoiceContext } from '../common'
import { OffLedger } from '@canton-network/core-token-standard'
import { TExpressOpenApiRequestHandler } from 'openapi-ts-router/express'
import { RegistryState } from '../../common/state'

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
    const fetchedFactories =
        await RegistryState.instance.sdk.ledger.acsReader.readJsContracts({
            filterByParty: true,
            parties: [RegistryState.instance.operator.party],
            templateIds: [TestToken.DAR.TestTokenV1.TokenRules.templateId],
        })

    // multi-sync mode
    if (RegistryState.instance.synchronizerIds.allocationInstruction) {
        const syncFactory = fetchedFactories.find(
            (factory) =>
                factory.synchronizerId ===
                RegistryState.instance.synchronizerIds.allocationInstruction
        )
        if (syncFactory) {
            res.json({
                factoryId: syncFactory.contractId,
                choiceContext: emptyChoiceContext,
            })
            return
        }
        // no multi-sync mode
    } else if (fetchedFactories[0]) {
        res.json({
            factoryId: fetchedFactories[0].contractId,
            choiceContext: emptyChoiceContext,
        })
        return
    }

    // ...and create one otherwise
    const executionResult = await RegistryState.instance.sdk.ledger
        .prepare({
            partyId: RegistryState.instance.operator.party,
            commands: TestToken.commands.create.rules({
                admin: RegistryState.instance.operator.party,
            }),
            ...(RegistryState.instance.synchronizerIds.allocationInstruction
                ? {
                      synchronizerId:
                          RegistryState.instance.synchronizerIds
                              .allocationInstruction,
                  }
                : {}),
        })
        .sign(RegistryState.instance.operator.keys.privateKey)
        .execute({
            partyId: RegistryState.instance.operator.party,
        })

    // fetch the newly created contract id
    const newFactoryContracts =
        await RegistryState.instance.sdk.ledger.acsReader.readJsContracts({
            filterByParty: true,
            parties: [RegistryState.instance.operator.party],
            offset: executionResult.completionOffset,
            templateIds: [TestToken.DAR.TestTokenV1.TokenRules.templateId],
        })

    // multi-sync mode
    if (RegistryState.instance.synchronizerIds.allocationInstruction) {
        const syncFactory = newFactoryContracts.find(
            (factory) =>
                factory.synchronizerId ===
                RegistryState.instance.synchronizerIds.allocationInstruction
        )
        if (syncFactory) {
            res.json({
                factoryId: syncFactory.contractId,
                choiceContext: emptyChoiceContext,
            })
            return
        }
        // no multi-sync mode
    } else if (newFactoryContracts[0]) {
        res.json({
            factoryId: newFactoryContracts[0].contractId,
            choiceContext: emptyChoiceContext,
        })
        return
    }

    next(
        new APIError(
            500,
            `Error instantiating transfer factory (completionOffset=${executionResult.completionOffset}`
        )
    )
    return
}
