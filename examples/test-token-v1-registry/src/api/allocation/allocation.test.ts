// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { getAllocationTransferContext } from './getAllocationTransferContext'
import { getAllocationCancelContext } from './getAllocationCancelContext'
import { getAllocationWithdrawContext } from './getAllocationWithdrawContext'
import { Operations } from '../../openapi-ts/allocation-v1'

const ctx = {} as Operations[
    | 'getAllocationTransferContext'
    | 'getAllocationCancelContext'
    | 'getAllocationWithdrawContext']['context']

describe('Allocation', () => {
    it('should return correct allocation transfer context', async () => {
        const result = await getAllocationTransferContext(ctx)

        expect(result).toBeDefined()
    })

    it('should return correct allocation cancel context', async () => {
        const result = await getAllocationCancelContext(ctx)

        expect(result).toBeDefined()
    })

    it('should return correct allocation withdraw context', async () => {
        const result = await getAllocationWithdrawContext(ctx)

        expect(result).toBeDefined()
    })
})
