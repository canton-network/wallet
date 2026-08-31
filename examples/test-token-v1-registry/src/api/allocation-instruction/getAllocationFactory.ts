// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TestToken } from '@canton-network/core-splice-codegen'
import { APIError } from '../common'
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

    const foundFactory = RegistryState.instance.synchronizerIds
        .allocationInstruction
        ? // multi-sync mode
          fetchedFactories.find(
              (factory) =>
                  factory.synchronizerId ===
                  RegistryState.instance.synchronizerIds.allocationInstruction
          )
        : // no multi-sync mode
          fetchedFactories[0]

    if (foundFactory) {
        res.json({
            factoryId: foundFactory.contractId,
            choiceContext: {
                choiceContextData: {},
                disclosedContracts: [
                    {
                        templateId: foundFactory.templateId,
                        contractId: foundFactory.contractId,
                        createdEventBlob: foundFactory.createdEventBlob ?? '',
                        synchronizerId: foundFactory.synchronizerId,
                    },
                ],
            },
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

    const newFactoryFound = RegistryState.instance.synchronizerIds
        .allocationInstruction
        ? // multi-sync mode
          newFactoryContracts.find(
              (factory) =>
                  factory.synchronizerId ===
                  RegistryState.instance.synchronizerIds.allocationInstruction
          )
        : // no multi-sync mode
          newFactoryContracts[0]

    if (newFactoryFound) {
        res.json({
            factoryId: newFactoryFound.contractId,
            choiceContext: {
                choiceContextData: {},
                disclosedContracts: [
                    {
                        templateId: newFactoryFound.templateId,
                        contractId: newFactoryFound.contractId,
                        createdEventBlob:
                            newFactoryFound.createdEventBlob ?? '',
                        synchronizerId: newFactoryFound.synchronizerId,
                    },
                ],
            },
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
