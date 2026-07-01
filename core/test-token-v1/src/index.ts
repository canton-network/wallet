// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Splice, packageId } from '@daml.js/splice-test-token-v1-1.0.0'
export { Splice, packageId }

const T = Splice.Testing.Tokens.TestTokenV1

/** Build a CreateCommand that creates a TokenRules contract for the given admin party. */
export function buildCreateTokenRulesCommand(adminParty: string) {
    return {
        CreateCommand: {
            templateId: T.TokenRules.templateId,
            createArguments: { admin: adminParty },
        },
    }
}

/** Build a CreateCommand that mints a Token held by `owner`. */
export function buildMintTokenCommand(params: {
    owner: string
    admin: string
    amount: string
}) {
    return {
        CreateCommand: {
            templateId: T.Token.templateId,
            createArguments: {
                holding: {
                    owner: params.owner,
                    instrumentId: { admin: params.admin, id: 'TestToken' },
                    amount: params.amount,
                    lock: null,
                    meta: { values: {} },
                },
            },
        },
    }
}
