// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getTokenRulesFactory } from './getTokenRulesFactory'

export async function getTokenRulesContext() {
    const factory = await getTokenRulesFactory()
    return {
        factoryId: factory.contractId,
        choiceContext: {
            choiceContextData: {
                values: {
                    'testTokenV2/tokenRules': {
                        tag: 'AV_ContractId',
                        value: factory.contractId,
                    },
                },
            },
            disclosedContracts: [
                {
                    templateId: factory.templateId,
                    contractId: factory.contractId,
                    createdEventBlob: factory.createdEventBlob ?? '',
                    synchronizerId: factory.synchronizerId,
                },
            ],
        },
    }
}
