// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getTokenRulesContext } from '../getTokenRulesContext'
import { TestTokenV2 } from '@canton-network/core-splice-codegen'
import { RegistryState } from '../../common/state'
import { APIError } from '../common'
import z from 'zod'

const transferOfferSchema = z.object({
    transfer: z.object({ inputHoldingCids: z.array(z.string()) }),
})

export async function getTransferFactoryContext(
    transferInstructionId?: string
) {
    const context = await getTokenRulesContext()
    const disclosedContracts = []
    if (transferInstructionId) {
        const contracts =
            await RegistryState.instance.sdk.ledger.acsReader.readJsContracts({
                parties: [RegistryState.instance.operator.party],
                filterByParty: true,
                templateIds: [
                    TestTokenV2.DAR.TestTokenV2.Transfer.TokenTransferOffer
                        .templateId,
                    TestTokenV2.DAR.TestTokenV2.Holding.Token.templateId,
                ],
            })
        const instruction = contracts.find(
            (contract) => contract.contractId === transferInstructionId
        )
        if (!instruction) {
            throw new APIError(404, 'Transfer instruction not found')
        }
        const { transfer } = transferOfferSchema.parse(
            instruction.createArgument
        )
        for (const cid of transfer.inputHoldingCids) {
            const holding = contracts.find(
                (contract) => contract.contractId === cid
            )
            if (!holding?.createdEventBlob) {
                throw new APIError(404, `Input holding not found: ${cid}`)
            }
            disclosedContracts.push({
                templateId: holding.templateId,
                contractId: holding.contractId,
                createdEventBlob: holding.createdEventBlob,
                synchronizerId: holding.synchronizerId,
            })
        }
    }
    return {
        ...context,
        choiceContext: {
            ...context.choiceContext,
            disclosedContracts: [
                ...disclosedContracts,
                ...context.choiceContext.disclosedContracts,
            ],
        },
    }
}
