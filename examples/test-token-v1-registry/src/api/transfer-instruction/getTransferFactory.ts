// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TestToken } from '@canton-network/core-splice-codegen'
import z from 'zod'
import { APIError, emptyChoiceContext } from '../common'
import { OffLedger } from '@canton-network/core-token-standard'
import { TExpressOpenApiRequestHandler } from 'openapi-ts-router/express'
import { RegistryState } from '../../common/state'

export const getTransferFactoryChoiceArgumentsSchema = z.looseObject({
    transfer: z.looseObject({
        sender: z.string(),
        receiver: z.string(),
        transferKind: z
            .union([z.literal('self'), z.literal('offer'), z.literal('direct')])
            .optional(),
    }),
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

    const transfer = parsedChoiceArguments.data.transfer
    const isToSelf = transfer.sender === transfer.receiver
    const transferKind = transfer.transferKind ?? (isToSelf ? 'self' : 'offer')

    // fetch the factory contract (if existing)...
    const fetchedFactories =
        await RegistryState.instance.sdk.ledger.acsReader.readJsContracts({
            filterByParty: true,
            parties: [RegistryState.instance.operator.party],
            templateIds: [TestToken.DAR.TestTokenV1.TokenRules.templateId],
        })

    // multi-sync mode
    if (RegistryState.instance.synchronizerIds.transferInstruction) {
        const syncFactory = fetchedFactories.find(
            (factory) =>
                factory.synchronizerId ===
                RegistryState.instance.synchronizerIds.transferInstruction
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
    const executionResult = await RegistryState.instance.sdk.ledger
        .prepare({
            partyId: RegistryState.instance.operator.party,
            commands: TestToken.commands.create.rules({
                admin: RegistryState.instance.operator.party,
            }),
            ...(RegistryState.instance.synchronizerIds.transferInstruction
                ? {
                      synchronizerId:
                          RegistryState.instance.synchronizerIds
                              .transferInstruction,
                  }
                : {}),
        })
        .sign(RegistryState.instance.operator.keys.privateKey)
        .execute({
            partyId: RegistryState.instance.operator.party,
        })

    // fetch the newly created contract id
    const factoryContract = (
        await RegistryState.instance.sdk.ledger.acsReader.readJsContracts({
            filterByParty: true,
            parties: [RegistryState.instance.operator.party],
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
