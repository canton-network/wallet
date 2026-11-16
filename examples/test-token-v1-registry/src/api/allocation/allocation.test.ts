// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, beforeEach } from 'vitest'
import { getAllocationTransferContext } from './getAllocationTransferContext.ts'
import { getAllocationCancelContext } from './getAllocationCancelContext.ts'
import { getAllocationWithdrawContext } from './getAllocationWithdrawContext.ts'
import { emptyChoiceContext } from '../common.ts'
import { expressContext, type RequestType } from '../../__tests__/mocks.ts'

const { res, next } = expressContext

describe('Allocation', () => {
    beforeEach(() => {})

    it('should return correct allocation transfer context', async () => {
        await getAllocationTransferContext(
            {} as RequestType<typeof getAllocationTransferContext>,
            res,
            next
        )

        expect(res.json).toHaveBeenCalledWith(emptyChoiceContext)
    })

    it('should return correct allocation cancel context', async () => {
        await getAllocationCancelContext(
            {} as RequestType<typeof getAllocationCancelContext>,
            res,
            next
        )

        expect(res.json).toHaveBeenCalledWith(emptyChoiceContext)
    })

    it('should return correct allocation withdraw context', async () => {
        await getAllocationWithdrawContext(
            {} as RequestType<typeof getAllocationWithdrawContext>,
            res,
            next
        )

        expect(res.json).toHaveBeenCalledWith(emptyChoiceContext)
    })
})
