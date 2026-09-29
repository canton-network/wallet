// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { CIP103_ERROR_CODES, isCip103ErrorCode } from './error'

describe('core/errors', () => {
    it('recognizes standard codes and rejects everything else', () => {
        for (const code of Object.values(CIP103_ERROR_CODES))
            expect(isCip103ErrorCode(code)).toBe(true)
        expect(isCip103ErrorCode(9999)).toBe(false)
        expect(isCip103ErrorCode('4001')).toBe(false)
    })

    /** Pins the table in https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md */
    it('covers every code CIP-103 defines, and no others', () => {
        expect(new Set(Object.values(CIP103_ERROR_CODES))).toStrictEqual(
            new Set([
                4001, 4100, 4200, 4900, 4901, -32700, -32600, -32601, -32602,
                -32603, -32000, -32001, -32002, -32003, -32004, -32005,
            ])
        )
    })
})
