// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TestTokenV2, commandV2 } from '@canton-network/core-test-token'
import sdk from '../common/sdk'
import { operator } from '../common/operator'
import { APIError, emptyChoiceContext } from './common'

const TOKEN_RULES_CONTEXT_KEY = 'testTokenV2/tokenRules'

/** Resolve or create the CIP-0112 TestTokenV2 TokenRules factory (transfer/allocation/settlement). */
export async function resolveOrCreateTokenRulesV2(): Promise<string> {
    const contract = await fetchOrCreateTokenRulesContract()
    return contract.contractId
}

async function fetchOrCreateTokenRulesContract() {
    const fetchedFactory = (
        await sdk.ledger.acsReader.readJsContracts({
            filterByParty: true,
            parties: [operator.party],
            templateIds: [TestTokenV2.TokenRules.templateId],
        })
    )[0]

    if (fetchedFactory) {
        return fetchedFactory
    }

    const executionResult = await sdk.ledger
        .prepare({
            partyId: operator.party,
            commands: commandV2.create.rules({ admin: operator.party }),
        })
        .sign(operator.keys.privateKey)
        .execute({
            partyId: operator.party,
        })

    const factoryContract = (
        await sdk.ledger.acsReader.readJsContracts({
            filterByParty: true,
            parties: [operator.party],
            offset: executionResult.completionOffset,
            templateIds: [TestTokenV2.TokenRules.templateId],
        })
    )[0]

    if (!factoryContract) {
        throw new APIError(
            500,
            `Error instantiating TestTokenV2 TokenRules (completionOffset=${executionResult.completionOffset})`
        )
    }

    return factoryContract
}

/**
 * Choice context that discloses TokenRules and wires `testTokenV2/tokenRules`
 * for TestTokenV2 Accept / Allocate / SettleBatch choices.
 */
export async function buildTokenRulesV2ChoiceContext() {
    const contract = await fetchOrCreateTokenRulesContract()
    if (!contract.createdEventBlob || !contract.synchronizerId) {
        throw new APIError(
            500,
            'TokenRules missing createdEventBlob or synchronizerId for disclosure'
        )
    }

    return {
        choiceContextData: {
            values: {
                [TOKEN_RULES_CONTEXT_KEY]: {
                    tag: 'AV_ContractId',
                    value: contract.contractId,
                },
            },
        },
        disclosedContracts: [
            {
                templateId: contract.templateId,
                contractId: contract.contractId,
                createdEventBlob: contract.createdEventBlob,
                synchronizerId: contract.synchronizerId,
            },
        ],
    }
}

export { emptyChoiceContext }
