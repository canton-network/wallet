// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { getAllocationTransferContext } from './getAllocationTransferContext'
import { Operations } from '../../openapi-ts/allocation-v1'

const ctx = {} as Operations['getAllocationTransferContext']['context']

describe('Allocation', () => {
    it('should return correct allocation transfer context', async () => {
        const result = await getAllocationTransferContext(ctx)

        expect(result).toBeDefined()
    })
})
