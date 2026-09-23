// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { CIP103_ERROR_CODES, isCip103ErrorCode } from './error'

describe('core/errors', () => {
    it('recognizes standard codes and rejects everything else', () => {
        expect(isCip103ErrorCode(CIP103_ERROR_CODES.UserRejectedRequest)).toBe(
            true
        )
        expect(isCip103ErrorCode(9999)).toBe(false)
        expect(isCip103ErrorCode('4001')).toBe(false)
    })
})
