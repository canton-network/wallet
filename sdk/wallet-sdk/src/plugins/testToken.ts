// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    Allocation,
    AllocationFactory,
    Transfer,
    TransferFactory,
    TransferInstruction,
    TestTokenV1,
    AllocationSpecification,
} from '@canton-network/core-token-standard'
import { SDKContext, SDKPlugin } from '../wallet'
import { WrappedCommand } from '@/wallet/namespace/ledger'
import { PartyId } from '@canton-network/core-types'

export class WalletSDKTestTokenPlugin extends SDKPlugin {
    constructor(protected readonly ctx: SDKContext) {
        super('testToken', ctx)
    }

    private readonly generateCommand = {
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

    public readonly create = {
        transferOffer: this.generateCommand.create<{ transfer: Transfer }>(
            TestTokenV1.TokenTransferOffer.templateId
        ),
        allocation: this.generateCommand.create<{
            allocation: AllocationSpecification
        }>(TestTokenV1.TokenAllocation.templateId),
        rules: this.generateCommand.create<{ admin: PartyId }>(
            TestTokenV1.TokenRules.templateId
        ),
    }

    public readonly exercise = {
        transferOffer: {
            accept: this.generateCommand.exercise(
                TestTokenV1.TokenTransferOffer.templateId,
                TransferInstruction.TransferInstruction_Accept.choiceName
            ),
            reject: this.generateCommand.exercise(
                TestTokenV1.TokenTransferOffer.templateId,
                TransferInstruction.TransferInstruction_Reject.choiceName
            ),
            withdraw: this.generateCommand.exercise(
                TestTokenV1.TokenTransferOffer.templateId,
                TransferInstruction.TransferInstruction_Withdraw.choiceName
            ),
            update: this.generateCommand.exercise(
                TestTokenV1.TokenTransferOffer.templateId,
                TransferInstruction.TransferInstruction_Update.choiceName
            ),
        },
        allocation: {
            executeTransfer: this.generateCommand.exercise(
                TestTokenV1.TokenAllocation.templateId,
                Allocation.Allocation_ExecuteTransfer.choiceName
            ),
            cancel: this.generateCommand.exercise(
                TestTokenV1.TokenAllocation.templateId,
                Allocation.Allocation_Cancel.choiceName
            ),
            withdraw: this.generateCommand.exercise(
                TestTokenV1.TokenAllocation.templateId,
                Allocation.Allocation_Withdraw.choiceName
            ),
        },
        rules: {
            transfer: {
                transfer: this.generateCommand.exercise(
                    TestTokenV1.TokenRules.templateId,
                    TransferFactory.TransferFactory_Transfer.choiceName
                ),
                publicFetch: this.generateCommand.exercise(
                    TestTokenV1.TokenRules.templateId,
                    TransferFactory.TransferFactory_PublicFetch.choiceName
                ),
            },
            allocation: {
                allocate: this.generateCommand.exercise(
                    TestTokenV1.TokenRules.templateId,
                    AllocationFactory.AllocationFactory_Allocate.choiceName
                ),
                publicFetch: this.generateCommand.exercise(
                    TestTokenV1.TokenRules.templateId,
                    AllocationFactory.AllocationFactory_PublicFetch.choiceName
                ),
            },
        },
    }
}
