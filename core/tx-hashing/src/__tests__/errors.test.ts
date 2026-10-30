// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { TxHashingError } from '../errors.js'

describe('TxHashingError', () => {
    it('carries code, path and name', () => {
        const e = new TxHashingError(
            'CYCLE',
            'node 3 is its own ancestor',
            'transaction.nodes[3]'
        )
        expect(e).toBeInstanceOf(Error)
        expect(e).toBeInstanceOf(TxHashingError)
        expect(e.name).toBe('TxHashingError')
        expect(e.code).toBe('CYCLE')
        expect(e.message).toBe('node 3 is its own ancestor')
        expect(e.path).toBe('transaction.nodes[3]')
    })

    it('does not require a path', () => {
        const e = new TxHashingError('MISSING_FIELD', 'metadata is missing')
        expect(e.code).toBe('MISSING_FIELD')
        expect(e.path).toBeUndefined()
    })
})
