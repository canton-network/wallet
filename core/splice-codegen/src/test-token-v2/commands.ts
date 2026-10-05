// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TestTokenID, TestTokenV2 } from './dar'

import type { PartyId } from '@canton-network/core-types'
import { generateCommand, TestTokenHoldingView } from '../common'

import { HoldingView } from '@canton-network/core-token-standard-v2'
import {
    Transfer,
    Allocation,
    AccountConfig,
} from '@daml.js/test-token-v2/Splice/Testing/Tokens/TestTokenV2'
import { WrappedCommand } from '@canton-network/core-ledger-client-types'
import { Token } from '@daml.js/test-token-v2/Splice/Testing/Tokens/TestTokenV2/Holding'

const commands = {
    create: {
        v1: {
            allocation: generateCommand.create<Allocation.TokenAllocationV1>(
                TestTokenV2.Allocation.TokenAllocationV1.templateId
            ),
            allocationInstruction:
                generateCommand.create<Allocation.TokenAllocationInstructionV1>(
                    TestTokenV2.Allocation.TokenAllocationInstructionV1
                        .templateId
                ),
        },
        rules: generateCommand.create<{ admin: PartyId }>(
            TestTokenV2.TokenRules.templateId
        ),
        transferOffer: generateCommand.create<Transfer.TokenTransferOffer>(
            TestTokenV2.Transfer.TokenTransferOffer.templateId
        ),
        allocation: generateCommand.create<Allocation.TokenAllocationV2>(
            TestTokenV2.Allocation.TokenAllocationV2.templateId
        ),
        allocationInstruction:
            generateCommand.create<Allocation.TokenAllocationInstructionV2>(
                TestTokenV2.Allocation.TokenAllocationInstructionV2.templateId
            ),
        accountConfig: generateCommand.create<AccountConfig.AccountConfig>(
            TestTokenV2.AccountConfig.AccountConfig.templateId
        ),
        token: (
            holding: TestTokenHoldingView<HoldingView>
        ): WrappedCommand<'CreateCommand'> =>
            generateCommand.create<Token>(TestTokenV2.Holding.Token.templateId)(
                {
                    holding: {
                        meta: { values: {} },
                        lock: null,
                        ...holding,
                        instrumentId: {
                            id: TestTokenID,
                            ...holding.instrumentId,
                        },
                    },
                }
            ),
    },
    exercise: {
        rules: {
            offerMint: generateCommand.exercise(
                TestTokenV2.TokenRules.templateId,
                TestTokenV2.TokenRules.TokenRules_OfferMint.choiceName
            ),
        },
    },
}

export default commands
