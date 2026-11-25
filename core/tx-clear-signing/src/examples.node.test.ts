// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import {
    describeAllocation,
    intent as allocationIntent,
} from '../examples/allocation.ts'
import { describePing, intent as pingIntent } from '../examples/ping.ts'
import {
    describeShowcase,
    intents as showcaseIntents,
} from '../examples/showcase.ts'
import { choiceOf, isComplete } from './__tests__/helpers.ts'

describe('standalone examples', () => {
    it('describes the builtin ping create', async () => {
        const result = await describePing()
        expect(isComplete(result)).toBe(true)
        expect(result.operations).toHaveLength(1)
        expect(result.operations[0]?.intent).toBe(pingIntent)
    })

    it('describes the two-leg allocation', async () => {
        const result = await describeAllocation()
        expect(isComplete(result)).toBe(true)
        expect(result.operations).toHaveLength(1)
        expect(choiceOf(result.operations[0])).toBe(
            'AllocationFactory_Allocate'
        )
        expect(result.operations[0]?.intent).toBe(allocationIntent)
    })

    it('describes the three-root amulet showcase', async () => {
        const result = await describeShowcase()
        expect(isComplete(result)).toBe(true)
        expect(result.operations.map(choiceOf)).toEqual([
            'TransferFactory_Transfer',
            'AllocationFactory_Allocate',
            'Allocation_Withdraw',
        ])
        expect(result.operations.map((op) => op.template?.entityName)).toEqual([
            'ExternalPartyAmuletRules',
            'ExternalPartyAmuletRules',
            'AmuletAllocationV2',
        ])
        expect(result.operations.map((op) => op.intent)).toEqual([
            ...showcaseIntents,
        ])
    })
})
