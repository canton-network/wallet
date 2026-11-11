// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { concat, concatAll, fromBase64, hexToBytes, sha256 } from '../bytes.js'
import { toHex } from './helpers/hex.js'

const utf8 = (s: string) => new TextEncoder().encode(s)

describe('concat', () => {
    it('joins byte arrays in order', () =>
        expect(toHex(concat(Uint8Array.of(1, 2), Uint8Array.of(3)))).toBe(
            '010203'
        ))

    it('treats a number as one byte', () =>
        expect(toHex(concat(0x0c, Uint8Array.of(1, 2), 0xff, 0))).toBe(
            '0c0102ff00'
        ))

    it('returns an empty array for no parts', () =>
        expect(concat()).toEqual(new Uint8Array(0)))

    it('returns a copy, not an alias of an input', () => {
        const input = Uint8Array.of(1, 2)
        const out = concat(input)
        out[0] = 9
        expect(input[0]).toBe(1)
    })
})

describe('concatAll', () => {
    it('joins 300,000 parts', () => {
        const parts = Array.from({ length: 300_000 }, () => Uint8Array.of(7))
        const out = concatAll(parts)
        expect(out.length).toBe(300_000)
        expect(out[0]).toBe(7)
        expect(out[299_999]).toBe(7)
    })
})

describe('hexToBytes', () => {
    it.each([
        ['', []],
        ['00', [0]],
        ['00ff', [0, 255]],
    ])('decodes %j', (hex, bytes) =>
        expect(hexToBytes(hex, 'p')).toEqual(Uint8Array.from(bytes))
    )

    it.each(['abc', 'zz', '0x12', 'ab c', ' abc', 'é1', 'ABcd'])(
        'rejects %j with its path',
        (hex) =>
            expect(() => hexToBytes(hex, 'a.b[1]')).toThrow(
                expect.objectContaining({
                    name: 'TxHashingError',
                    code: 'INVALID_HEX',
                    path: 'a.b[1]',
                })
            )
    )

    it('decodes 16 million hex digits', () => {
        const bytes = hexToBytes('ab'.repeat(8_000_000), 'p')
        expect(bytes.length).toBe(8_000_000)
        expect(bytes[7_999_999]).toBe(0xab)
    })
})

describe('fromBase64', () => {
    it.each([
        ['Zg==', 'f'],
        ['Zm8=', 'fo'],
        ['Zm9v', 'foo'],
        ['Zm9vYg==', 'foob'],
        ['Zm9vYmE=', 'fooba'],
        ['Zm9vYmFy', 'foobar'],
    ])('decodes the RFC 4648 vector %s', (b64, plain) =>
        expect(fromBase64(b64)).toEqual(utf8(plain))
    )

    it('decodes the standard alphabet characters + and /', () => {
        expect(fromBase64('++++')).toEqual(Uint8Array.of(0xfb, 0xef, 0xbe))
        expect(fromBase64('////')).toEqual(Uint8Array.of(0xff, 0xff, 0xff))
    })

    it.each([
        ['', 'empty input'],
        ['Zg', 'missing padding'],
        ['Zg===', 'long padding'],
        ['-_-_', 'url-safe alphabet'],
        ['Z===', 'three padding characters'],
        ['Zg==Zg==', 'padding in the middle'],
        [' Zm9', 'leading space'],
        ['Zm\n=', 'newline'],
        ['Zm9é', 'non-ascii letter'],
        ['Zm\u{1f600}', 'astral character'],
        ['Zh==', 'non-zero trailing bits'],
        ['Zm9=', 'trailing bits after two bytes'],
    ])('rejects %j (%s) with DECODE_FAILED', (b64) =>
        expect(() => fromBase64(b64)).toThrow(
            expect.objectContaining({
                name: 'TxHashingError',
                code: 'DECODE_FAILED',
            })
        )
    )

    it('decodes 8 MB of base64', () => {
        const bytes = fromBase64('QUJD'.repeat(2_000_000))
        expect(bytes.length).toBe(6_000_000)
        expect(toHex(bytes.subarray(5_999_997))).toBe('414243')
    })
})

describe('sha256', () => {
    it('hashes only the bytes of a view, not the whole buffer', async () => {
        const backing = utf8('xxabcxx')
        const view = backing.subarray(2, 5)
        expect(view.byteOffset).toBe(2)
        expect(toHex(await sha256(view))).toBe(
            'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
        )
    })
})
