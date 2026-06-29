// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { nestedRedact } from './utils.js'

describe('utils', () => {
    it('tests nestedRedact', async () => {
        const keys = ['secret', 'hyphenated-key']
        const redactions = nestedRedact(keys, 3)
        expect(redactions).toEqual([
            'secret',
            '*.secret',
            '*.*.secret',
            '*[*].secret',
            '*.*[*].secret',
            '*.*.*[*].secret',
            '["hyphenated-key"]',
            '*["hyphenated-key"]',
            '*.*["hyphenated-key"]',
            '*[*]["hyphenated-key"]',
            '*.*[*]["hyphenated-key"]',
            '*.*.*[*]["hyphenated-key"]',
        ])
    })
})
