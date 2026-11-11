// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { OffLedger } from '@canton-network/core-token-standard-v2'
import type { TExpressOpenApiRequestHandler } from 'openapi-ts-router/express'
import { getTokenRulesContext } from '../getTokenRulesContext'
import { TestTokenV2 } from '@canton-network/core-splice-codegen'
import { RegistryState } from '../../common/state'
import { APIError } from '../common'
import z from 'zod'

const settlementArgumentsSchema = z.looseObject({
    allocations: z.array(z.object({ allocationCid: z.string() })),
})

const allocationSchema = z.looseObject({
    lockedTokens: z.record(z.string(), z.array(z.string())),
})

export const getSettlementFactory: TExpressOpenApiRequestHandler<
    OffLedger.AllocationV2.paths['/registry/allocation/v2/settlement-factory']['post']
> = async (req, res, next) => {
    const parsed = settlementArgumentsSchema.safeParse(req.body.choiceArguments)
    if (!parsed.success) {
        next(new APIError(400, parsed.error.message))
        return
    }

    try {
        const context = await getTokenRulesContext()
        const contracts =
            await RegistryState.instance.sdk.ledger.acsReader.readJsContracts({
                parties: [RegistryState.instance.operator.party],
                filterByParty: true,
                templateIds: [
                    TestTokenV2.DAR.TestTokenV2.Allocation.TokenAllocationV2
                        .templateId,
                    TestTokenV2.DAR.TestTokenV2.Holding.Token.templateId,
                ],
            })
        const requiredCids = new Set<string>()
        for (const { allocationCid } of parsed.data.allocations) {
            const allocation = contracts.find(
                (contract) => contract.contractId === allocationCid
            )
            if (!allocation) {
                throw new APIError(
                    404,
                    `Allocation not found: ${allocationCid}`
                )
            }
            requiredCids.add(allocationCid)
            const { lockedTokens } = allocationSchema.parse(
                allocation.createArgument
            )
            for (const cid of Object.values(lockedTokens).flat()) {
                requiredCids.add(cid)
            }
        }
        const disclosedContracts = [...requiredCids].map((cid) => {
            const contract = contracts.find(
                (contract) => contract.contractId === cid
            )
            if (!contract?.createdEventBlob) {
                throw new APIError(404, `Settlement contract not found: ${cid}`)
            }
            return {
                templateId: contract.templateId,
                contractId: contract.contractId,
                createdEventBlob: contract.createdEventBlob,
                synchronizerId: contract.synchronizerId,
            }
        })
        res.json({
            ...context,
            choiceContext: {
                ...context.choiceContext,
                disclosedContracts: [
                    ...context.choiceContext.disclosedContracts,
                    ...disclosedContracts,
                ],
            },
        })
    } catch (e) {
        next(e)
    }
}
