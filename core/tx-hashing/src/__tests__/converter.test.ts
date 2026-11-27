// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import { Converter } from '../converter.ts'

describe('Converter', () => {
    const hash = new Converter(Uint8Array.of(0x00, 0x0f, 0xfb, 0xff))

    it('reads the hash in hex', () => {
        expect(hash.toHex()).toBe('000ffbff')
    })

    it('reads the hash in base64', () => {
        expect(hash.toBase64()).toBe('AA/7/w==')
    })
})
