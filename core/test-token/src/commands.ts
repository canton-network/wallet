// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TestTokenID, TestTokenV1, TestTokenV2, type Token } from './token'
import {
    Allocation,
    AllocationFactory,
    Transfer,
    TransferFactory,
    TransferInstruction,
    AllocationSpecification,
} from '@canton-network/core-token-standard'
import { PartyId } from '@canton-network/core-types'
import { WrappedCommand } from '@canton-network/core-ledger-client-types'

const generateCommand = {
    create<CreateArgs>(templateId: string) {
        return (
            createArguments: CreateArgs
        ): WrappedCommand<'CreateCommand'> => ({
            CreateCommand: {
                templateId,
                createArguments,
            },
        })
    },
    exercise(templateId: string, choice: string) {
        return (
            args: Pick<
                WrappedCommand<'ExerciseCommand'>['ExerciseCommand'],
                'contractId' | 'choiceArgument'
            >
        ): WrappedCommand<'ExerciseCommand'> => ({
            ExerciseCommand: {
                templateId,
                contractId: args.contractId,
                choice,
                choiceArgument: args.choiceArgument,
            },
        })
    },
}

export const command = {
    create: {
        transferOffer: generateCommand.create<{ transfer: Transfer }>(
            TestTokenV1.TokenTransferOffer.templateId
        ),
        allocation: generateCommand.create<{
            allocation: AllocationSpecification
        }>(TestTokenV1.TokenAllocation.templateId),
        rules: generateCommand.create<{ admin: PartyId }>(
            TestTokenV1.TokenRules.templateId
        ),
        token: (params: {
            owner: PartyId
            admin: PartyId
            amount: string
        }): WrappedCommand<'CreateCommand'> =>
            generateCommand.create<Token>(TestTokenV1.Token.templateId)({
                holding: {
                    owner: params.owner,
                    instrumentId: { admin: params.admin, id: TestTokenID },
                    amount: params.amount,
                    lock: null,
                    meta: { values: {} },
                },
            }),
    },

    exercise: {
        transferOffer: {
            accept: generateCommand.exercise(
                TestTokenV1.TokenTransferOffer.templateId,
                TransferInstruction.TransferInstruction_Accept.choiceName
            ),
            reject: generateCommand.exercise(
                TestTokenV1.TokenTransferOffer.templateId,
                TransferInstruction.TransferInstruction_Reject.choiceName
            ),
            withdraw: generateCommand.exercise(
                TestTokenV1.TokenTransferOffer.templateId,
                TransferInstruction.TransferInstruction_Withdraw.choiceName
            ),
            update: generateCommand.exercise(
                TestTokenV1.TokenTransferOffer.templateId,
                TransferInstruction.TransferInstruction_Update.choiceName
            ),
        },
        allocation: {
            executeTransfer: generateCommand.exercise(
                TestTokenV1.TokenAllocation.templateId,
                Allocation.Allocation_ExecuteTransfer.choiceName
            ),
            cancel: generateCommand.exercise(
                TestTokenV1.TokenAllocation.templateId,
                Allocation.Allocation_Cancel.choiceName
            ),
            withdraw: generateCommand.exercise(
                TestTokenV1.TokenAllocation.templateId,
                Allocation.Allocation_Withdraw.choiceName
            ),
        },
        rules: {
            transfer: {
                transfer: generateCommand.exercise(
                    TestTokenV1.TokenRules.templateId,
                    TransferFactory.TransferFactory_Transfer.choiceName
                ),
                publicFetch: generateCommand.exercise(
                    TestTokenV1.TokenRules.templateId,
                    TransferFactory.TransferFactory_PublicFetch.choiceName
                ),
            },
            allocation: {
                allocate: generateCommand.exercise(
                    TestTokenV1.TokenRules.templateId,
                    AllocationFactory.AllocationFactory_Allocate.choiceName
                ),
                publicFetch: generateCommand.exercise(
                    TestTokenV1.TokenRules.templateId,
                    AllocationFactory.AllocationFactory_PublicFetch.choiceName
                ),
            },
        },
    },
}

export const commandV2 = {
    create: {
        rules: generateCommand.create<{ admin: PartyId }>(
            TestTokenV2.TokenRules.templateId
        ),
        accountConfig: (params: {
            admin: PartyId
            owner: PartyId
            accountId?: string
            provider?: PartyId | null
            ownerConfig?: { canInitiate: boolean; mustApprove: boolean }
            providerConfig?: { canInitiate: boolean; mustApprove: boolean }
        }): WrappedCommand<'CreateCommand'> =>
            generateCommand.create<{
                admin: PartyId
                account: {
                    owner: string
                    provider: string | null
                    id: string
                }
                ownerConfig: { canInitiate: boolean; mustApprove: boolean }
                providerConfig: { canInitiate: boolean; mustApprove: boolean }
            }>(TestTokenV2.AccountConfig.AccountConfig.templateId)({
                admin: params.admin,
                account: {
                    owner: params.owner,
                    provider: (params.provider ?? null) as string | null,
                    id: params.accountId ?? '',
                },
                ownerConfig: params.ownerConfig ?? {
                    canInitiate: true,
                    mustApprove: false,
                },
                providerConfig: params.providerConfig ?? {
                    canInitiate: false,
                    mustApprove: false,
                },
            }),
    },
    exercise: {
        rules: {
            offerMint: generateCommand.exercise(
                TestTokenV2.TokenRules.templateId,
                'TokenRules_OfferMint'
            ),
        },
    },
}
