// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, describe, it } from 'vitest'
import { fromHex, toHex } from './utils.js'

describe('utils', () => {
    it('should convert to hex', () => {
        expect(toHex(new Uint8Array([0x00, 0x0f, 0xff]))).toBe('000fff')
    })

    it('should convert from hex', () => {
        const original = new Uint8Array([0x00, 0x0f, 0xff])
        expect(fromHex(toHex(original))).toEqual(original)
    })
    it(`should throw an error if when converting to hex if there's an invalid string length`, () => {
        expect(() => fromHex('abc')).toThrow('Invalid hex string length')
    })
})
