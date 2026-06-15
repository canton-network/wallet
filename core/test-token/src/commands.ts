// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Splice } from '@daml.js/splice-test-token-v1-1.0.0'

const T = Splice.Testing.Tokens.TestTokenV1

const TRANSFER_FACTORY_INTERFACE_ID =
    '#splice-api-token-transfer-instruction-v1:Splice.Api.Token.TransferInstructionV1:TransferFactory'
const TRANSFER_INSTRUCTION_INTERFACE_ID =
    '#splice-api-token-transfer-instruction-v1:Splice.Api.Token.TransferInstructionV1:TransferInstruction'

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

/** Build an ExerciseCommand for TransferFactory_Transfer on a TokenRules contract. */
export function buildTransferTokenCommand(params: {
    tokenRulesCid: string
    expectedAdmin: string
    sender: string
    receiver: string
    amount: string
    admin: string
    inputHoldingCids: string[]
    requestedAt: string
    executeBefore: string
}) {
    return {
        ExerciseCommand: {
            templateId: TRANSFER_FACTORY_INTERFACE_ID,
            contractId: params.tokenRulesCid,
            choice: 'TransferFactory_Transfer',
            choiceArgument: {
                expectedAdmin: params.expectedAdmin,
                transfer: {
                    sender: params.sender,
                    receiver: params.receiver,
                    amount: params.amount,
                    instrumentId: { admin: params.admin, id: 'TestToken' },
                    requestedAt: params.requestedAt,
                    executeBefore: params.executeBefore,
                    inputHoldingCids: params.inputHoldingCids,
                    meta: { values: {} },
                },
                extraArgs: {
                    context: { values: {} },
                    meta: { values: {} },
                },
            },
        },
    }
}

/** Build an ExerciseCommand that accepts a pending TransferInstruction (TokenTransferOffer). */
export function buildAcceptTransferInstructionCommand(offerCid: string) {
    return {
        ExerciseCommand: {
            templateId: TRANSFER_INSTRUCTION_INTERFACE_ID,
            contractId: offerCid,
            choice: 'TransferInstruction_Accept',
            choiceArgument: {
                extraArgs: {
                    context: { values: {} },
                    meta: { values: {} },
                },
            },
        },
    }
}
