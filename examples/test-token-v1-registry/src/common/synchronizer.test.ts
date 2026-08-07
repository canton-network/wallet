// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, afterEach } from 'vitest'
import { assignSynchronizerIds, synchronizerId } from './synchronizer'

describe('synchronizer', () => {
    afterEach(() => {
        Object.assign(synchronizerId, {
            transferInstruction: '',
            allocationInstruction: '',
        })
    })
    it('should be set to empty strings by default', () => {
        expect(synchronizerId).toStrictEqual({
            transferInstruction: '',
            allocationInstruction: '',
        })
    })
    it('should properly assign syncrhonizers', () => {
        const expectedResult = {
            transferInstruction: 'transfer-sync-id',
            allocationInstruction: 'allocation-sync-id',
        }

        assignSynchronizerIds(expectedResult)

        expect(synchronizerId).toStrictEqual(expectedResult)
    })
})
