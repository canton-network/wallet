// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { concat, concatAll, fromBase64, hexToBytes, sha256 } from '../bytes.js'
import { toHex } from './helpers/hex.js'

const utf8 = (s: string) => new TextEncoder().encode(s)
const toBase64 = (bytes: Uint8Array) =>
    btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''))

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

    it('copies, so the result does not alias an input', () => {
        const input = Uint8Array.of(1, 2)
        const out = concat(input)
        out[0] = 9
        expect(input[0]).toBe(1)
    })
})

describe('concatAll', () => {
    it('joins more parts than a call can take as arguments', () => {
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

    it.each([
        'abc',
        'zz',
        '0x12',
        'ab cd',
        ' abcd',
        'abcd\n',
        'é1',
        '0g',
        'ABcd',
    ])('rejects %j with its path', (hex) =>
        expect(() => hexToBytes(hex, 'a.b[1]')).toThrow(
            expect.objectContaining({
                name: 'TxHashingError',
                code: 'INVALID_HEX',
                path: 'a.b[1]',
            })
        )
    )

    it('accepts exactly the strings of /^([0-9a-f]{2})*$/', () => {
        const alphabet = ['0', 'f', 'F', 'g', ' ', 'é']
        let strings = ['']
        for (let length = 1; length <= 4; length++)
            strings = strings.concat(
                strings
                    .filter((s) => s.length === length - 1)
                    .flatMap((s) => alphabet.map((c) => s + c))
            )
        expect(strings.length).toBe(1555)
        for (const s of strings) {
            let accepted = true
            try {
                hexToBytes(s, 'p')
            } catch {
                accepted = false
            }
            expect([s, accepted]).toEqual([s, /^([0-9a-f]{2})*$/.test(s)])
        }
    })

    it('decodes 16 million hex digits without a stack overflow', () => {
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

    it('round-trips every length from 1 to 300 bytes', () => {
        for (let length = 1; length <= 300; length++) {
            const bytes = Uint8Array.from(
                { length },
                (_, i) => (i * 37 + length * 11) % 256
            )
            expect(fromBase64(toBase64(bytes))).toEqual(bytes)
        }
    })

    it.each([
        ['-_-_', 'url-safe alphabet'],
        ['-_8=', 'url-safe alphabet with padding'],
        ['not base64!', 'garbage'],
        ['', 'empty input'],
        ['Zg', 'missing padding'],
        ['Zg=', 'short padding'],
        ['Zg===', 'long padding'],
        ['Z===', 'three padding characters'],
        ['====', 'only padding'],
        ['Zg==Zg==', 'padding in the middle'],
        ['Zh==', 'non-zero trailing bits'],
        ['Zm9=', 'non-zero trailing bits after two bytes'],
        [' Zm9v', 'leading space'],
        ['Zm9v ', 'trailing space'],
        ['Zm9v\n', 'trailing newline'],
        ['Zm9é', 'non-ascii letter'],
        ['Zm\u{1f600}', 'astral character of the right length'],
    ])('rejects %j (%s) with DECODE_FAILED', (b64) =>
        expect(() => fromBase64(b64)).toThrow(
            expect.objectContaining({
                name: 'TxHashingError',
                code: 'DECODE_FAILED',
            })
        )
    )

    it('decodes several megabytes without hitting regexp or stack limits', () => {
        const bytes = fromBase64('QUJD'.repeat(2_000_000))
        expect(bytes.length).toBe(6_000_000)
        expect(toHex(bytes.subarray(5_999_997))).toBe('414243')
    })
})

describe('sha256', () => {
    it('hashes the empty input', async () =>
        expect(toHex(await sha256(new Uint8Array(0)))).toBe(
            'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        ))

    it('hashes abc', async () =>
        expect(toHex(await sha256(utf8('abc')))).toBe(
            'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
        ))

    it('returns 32 bytes as a Uint8Array', async () => {
        const hash = await sha256(utf8('abc'))
        expect(hash).toBeInstanceOf(Uint8Array)
        expect(hash.length).toBe(32)
    })

    it('hashes only the bytes of a view, not the whole buffer', async () => {
        const backing = utf8('xxabcxx')
        const view = backing.subarray(2, 5)
        expect(view.byteOffset).toBe(2)
        expect(toHex(await sha256(view))).toBe(
            'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
        )
    })
})
