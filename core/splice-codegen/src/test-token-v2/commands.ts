// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TestTokenV2 } from './dar'

import type { PartyId } from '@canton-network/core-types'
import { generateCommand } from '../common'

import {
    Transfer,
    Allocation as AllocationT,
} from '@daml.js/test-token-v2/Splice/Testing/Tokens/TestTokenV2'

const commands = {
    create: {
        rules: generateCommand.create<{ admin: PartyId }>(
            TestTokenV2.TokenRules.templateId
        ),
        transferOffer: generateCommand.create<Transfer.TokenTransferOffer>(
            TestTokenV2.Transfer.TokenTransferOffer.templateId
        ),
        allocation: generateCommand.create<AllocationT.TokenAllocationV2>(
            TestTokenV2.Allocation.TokenAllocationV2.templateId
        ),
    },
    exercise: {},
}

export default commands
