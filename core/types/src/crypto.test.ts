// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { base64ToBytes, fingerprintPublicKey } from './index'

describe('base64ToBytes', () => {
    it('decodes standard Base64 and ignores whitespace', () => {
        expect(base64ToBytes(' AAECAwQF\nBgc= ')).toEqual(
            Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7])
        )
    })

    it.each(['', ' ', 'a', 'not-base64!', 'AAAA==='])(
        'rejects malformed Base64: %j',
        (value) => {
            expect(() => base64ToBytes(value)).toThrow('Invalid Base64 value')
        }
    )
})

describe('fingerprintPublicKey', () => {
    it('creates a Canton public-key fingerprint', async () => {
        await expect(
            fingerprintPublicKey('AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=')
        ).resolves.toBe(
            '122093aa96c5554371f0d1fd471ce282f3b590ab0758f35c124924c8e3715910bbe1'
        )
    })
})
