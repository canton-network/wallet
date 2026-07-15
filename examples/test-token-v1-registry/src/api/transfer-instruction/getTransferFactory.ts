// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TestTokenV1 } from '@canton-network/core-token-standard'
import sdk from '../../common/sdk'
import { TransferInstructionAPIHandler } from './common'
import { admin } from '../../common/admin'

export const getTransferFactory: TransferInstructionAPIHandler<
    'getTransferFactory'
> = async () => {
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
                transferKind: 'offer',
                choiceContext: {
                    choiceContextData: {},
                    disclosedContracts: [],
                },
            },
        }
    }

    const executionResult = await sdk.ledger
        .prepare({
            partyId: admin.party,
            commands: sdk.testToken.create.rules({ admin: admin.party }),
        })
        .sign(admin.keys.privateKey)
        .execute({
            partyId: admin.party,
        })

    const factoryContracts = await sdk.ledger.acsReader.readJsContracts({
        filterByParty: true,
        parties: [admin.party],
        offset: executionResult.completionOffset,
        templateIds: [TestTokenV1.TokenRules.templateId],
    })

    const factoryContract = factoryContracts[0]

    if (!factoryContract) {
        return {
            status: 500,
            payload: {
                error: `Error instantiating transfer factory (completionOffset=${executionResult.completionOffset}, contractsAtOffset=${factoryContracts.length}`,
            },
        }
    }

    return {
        payload: {
            factoryId: factoryContract.contractId,
            transferKind: 'offer',
            choiceContext: {
                choiceContextData: {},
                disclosedContracts: [],
            },
        },
    }
}
