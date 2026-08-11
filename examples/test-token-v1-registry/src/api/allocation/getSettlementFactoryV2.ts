// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { APIError } from '../common'
import {
    buildTokenRulesV2ChoiceContext,
    resolveOrCreateTokenRulesV2,
} from '../token-rules-v2.js'
import { TestTokenV2 } from '@canton-network/core-test-token'
import { OffLedger } from '@canton-network/core-token-standard'
import sdk from '../../common/sdk'
import { operator } from '../../common/operator'
import { TExpressOpenApiRequestHandler } from 'openapi-ts-router/express'

type Disclosed = {
    templateId: string
    contractId: string
    createdEventBlob: string
    synchronizerId: string
}

function toDisclosed(contract: {
    templateId: string
    contractId: string
    createdEventBlob?: string
    synchronizerId?: string
}): Disclosed | null {
    if (!contract.createdEventBlob || !contract.synchronizerId) return null
    return {
        templateId: contract.templateId,
        contractId: contract.contractId,
        createdEventBlob: contract.createdEventBlob,
        synchronizerId: contract.synchronizerId,
    }
}

/**
 * CIP-0112 settlement factory — same TestTokenV2 TokenRules contract implements SettlementFactory.
 * Discloses TokenRules plus allocation contracts (and locked holdings) from choiceArguments
 * so the executor can submit SettleBatch.
 */
export const getSettlementFactoryV2: TExpressOpenApiRequestHandler<
    OffLedger.AllocationV2.paths['/registry/allocation/v2/settlement-factory']['post']
> = async (req, res, next) => {
    try {
        const factoryId = await resolveOrCreateTokenRulesV2()
        const base = await buildTokenRulesV2ChoiceContext()

        const allocationCids = (
            (
                req.body?.choiceArguments as {
                    allocations?: { allocationCid?: string }[]
                }
            )?.allocations ?? []
        )
            .map((a) => a.allocationCid)
            .filter(
                (cid): cid is string =>
                    typeof cid === 'string' && cid.length > 0
            )

        const disclosedByCid = new Map<string, Disclosed>()
        for (const dc of base.disclosedContracts) {
            disclosedByCid.set(dc.contractId, dc)
        }

        if (allocationCids.length > 0) {
            const allocations = await sdk.ledger.acsReader.readJsContracts({
                filterByParty: true,
                parties: [operator.party],
                templateIds: [
                    TestTokenV2.Allocation.TokenAllocationV2.templateId,
                ],
            })

            const lockedHoldingCids = new Set<string>()
            for (const alloc of allocations) {
                if (!allocationCids.includes(alloc.contractId)) continue
                const disclosed = toDisclosed(alloc)
                if (disclosed)
                    disclosedByCid.set(disclosed.contractId, disclosed)

                const args =
                    (
                        alloc as {
                            createArgument?: {
                                lockedTokens?: Record<string, string[]>
                            }
                            payload?: {
                                lockedTokens?: Record<string, string[]>
                            }
                        }
                    ).createArgument ??
                    (
                        alloc as {
                            payload?: {
                                lockedTokens?: Record<string, string[]>
                            }
                        }
                    ).payload
                const locked = args?.lockedTokens
                if (locked) {
                    for (const cids of Object.values(locked)) {
                        for (const cid of cids) lockedHoldingCids.add(cid)
                    }
                }
            }

            if (lockedHoldingCids.size > 0) {
                const holdings = await sdk.ledger.acsReader.readJsContracts({
                    filterByParty: true,
                    parties: [operator.party],
                    templateIds: [TestTokenV2.Holding.Token.templateId],
                })
                for (const holding of holdings) {
                    if (!lockedHoldingCids.has(holding.contractId)) continue
                    const disclosed = toDisclosed(holding)
                    if (disclosed)
                        disclosedByCid.set(disclosed.contractId, disclosed)
                }
            }
        }

        res.json({
            factoryId,
            choiceContext: {
                choiceContextData: base.choiceContextData,
                disclosedContracts: [...disclosedByCid.values()],
            },
        })
    } catch (e) {
        next(e instanceof APIError ? e : new APIError(500, String(e)))
    }
}
