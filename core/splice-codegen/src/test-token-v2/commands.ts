// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TestTokenID, TestTokenV2 } from './dar'
import {
    Allocation,
    AllocationFactory,
    TransferFactory,
    TransferInstruction,
} from '@canton-network/core-token-standard'
import type { PartyId } from '@canton-network/core-types'
import type { WrappedCommand } from '@canton-network/core-ledger-client-types'
import { generateCommand } from '../common'
// import type {
//     Token,
//     TokenAllocation,
//     TokenRules,
//     TokenTransferOffer,
// } from './types'
import type { Transfer } from './types'

const commands = {
    create: {
        transferOffer: generateCommand.create<Transfer>(
            TestTokenV2.Transfer.TokenTransferOffer.templateId
        ),
        allocation: generateCommand.create<TokenAllocation>(
            TestTokenV2.Allocation.TokenAllocationV2.templateId
        ),
        rules: generateCommand.create<TokenRules>(
            TestTokenV2.TokenRules.templateId
        ),
        token: (params: {
            owner: PartyId
            admin: PartyId
            amount: string
        }): WrappedCommand<'CreateCommand'> =>
            generateCommand.create<Token>(TestTokenV2.Holding.Token.templateId)(
                {
                    holding: {
                        owner: params.owner,
                        instrumentId: { admin: params.admin, id: TestTokenID },
                        amount: params.amount,
                        lock: null,
                        meta: { values: {} },
                    },
                }
            ),
    },

    exercise: {
        transferOffer: {
            accept: generateCommand.exercise(
                TestTokenV2.Transfer.TokenTransferOffer.templateId,
                TransferInstruction.TransferInstruction_Accept.choiceName
            ),
            reject: generateCommand.exercise(
                TestTokenV2.Transfer.TokenTransferOffer.templateId,
                TransferInstruction.TransferInstruction_Reject.choiceName
            ),
            withdraw: generateCommand.exercise(
                TestTokenV2.Transfer.TokenTransferOffer.templateId,
                TransferInstruction.TransferInstruction_Withdraw.choiceName
            ),
            update: generateCommand.exercise(
                TestTokenV2.Transfer.TokenTransferOffer.templateId,
                TransferInstruction.TransferInstruction_Update.choiceName
            ),
        },
        allocation: {
            executeTransfer: generateCommand.exercise(
                TestTokenV2.Allocation.TokenAllocationV2.templateId,
                Allocation.Allocation_ExecuteTransfer.choiceName
            ),
            cancel: generateCommand.exercise(
                TestTokenV2.Allocation.TokenAllocationV2.templateId,
                Allocation.Allocation_Cancel.choiceName
            ),
            withdraw: generateCommand.exercise(
                TestTokenV2.Allocation.TokenAllocationV2.templateId,
                Allocation.Allocation_Withdraw.choiceName
            ),
        },
        rules: {
            transfer: {
                transfer: generateCommand.exercise(
                    TestTokenV2.Allocation.TokenAllocationV2.templateId,
                    TransferFactory.TransferFactory_Transfer.choiceName
                ),
                publicFetch: generateCommand.exercise(
                    TestTokenV2.Allocation.TokenAllocationV2.templateId,
                    TransferFactory.TransferFactory_PublicFetch.choiceName
                ),
            },
            allocation: {
                allocate: generateCommand.exercise(
                    TestTokenV2.Allocation.TokenAllocationV2.templateId,
                    AllocationFactory.AllocationFactory_Allocate.choiceName
                ),
                publicFetch: generateCommand.exercise(
                    TestTokenV2.Allocation.TokenAllocationV2.templateId,
                    AllocationFactory.AllocationFactory_PublicFetch.choiceName
                ),
            },
        },
    },
}

export default commands
