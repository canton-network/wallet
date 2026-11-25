// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import { canonicalize, CanonicalizeError } from './canonical-json.ts'

/** An IEEE 754 double from the hex in RFC 8785 appendix B. */
function numberFromHex(hex: string): number {
    const view = new DataView(new ArrayBuffer(8))
    view.setBigUint64(0, BigInt(`0x${hex}`))
    return view.getFloat64(0)
}

describe('canonicalize', () => {
    it('matches the RFC 8785 section 3.2.3 sample', () => {
        const parsed = JSON.parse(`{
            "numbers": [333333333.33333329, 1E30, 4.50, 2e-3, 0.000000000000000000000000001],
            "string": "\\u20ac$\\u000F\\u000aA'\\u0042\\u0022\\u005c\\\\\\"\\/",
            "literals": [null, true, false]
        }`) as {
            numbers: number[]
            string: string
            literals: unknown[]
        }
        // Keys inserted in the order the RFC's canonical result uses, so JSON.stringify is an
        // oracle for the primitive serialization. The input above is in a different order.
        const expected = JSON.stringify({
            literals: parsed.literals,
            numbers: parsed.numbers,
            string: parsed.string,
        })
        expect(canonicalize(parsed)).toBe(expected)
        expect(JSON.stringify(parsed.numbers)).toBe(
            '[333333333.3333333,1e+30,4.5,0.002,1e-27]'
        )
    })

    it('sorts property names by UTF-16 code unit, including the RFC sample', () => {
        const sorted = canonicalize({
            '\u20ac': 'Euro Sign',
            '\r': 'Carriage Return',
            '\ufb33': 'Hebrew Letter Dalet With Dagesh',
            '1': 'One',
            '\ud83d\ude00': 'Emoji: Grinning Face',
            '\u0080': 'Control',
            '\u00f6': 'Latin Small Letter O With Diaeresis',
        })
        const values = [
            'Carriage Return',
            'One',
            'Control',
            'Latin Small Letter O With Diaeresis',
            'Euro Sign',
            'Emoji: Grinning Face',
            'Hebrew Letter Dalet With Dagesh',
        ]
        let at = 0
        for (const value of values) {
            const found = sorted.indexOf(JSON.stringify(value), at)
            expect(found, value).toBeGreaterThan(at)
            at = found
        }
    })

    it('sorts nested objects and keeps array order', () => {
        expect(canonicalize({ b: { d: 1, c: [2, 1] }, a: true })).toBe(
            '{"a":true,"b":{"c":[2,1],"d":1}}'
        )
    })

    it.each([
        ['0000000000000000', '0'],
        ['8000000000000000', '0'],
        ['0000000000000001', '5e-324'],
        ['8000000000000001', '-5e-324'],
        ['7fefffffffffffff', '1.7976931348623157e+308'],
        ['ffefffffffffffff', '-1.7976931348623157e+308'],
        ['4340000000000000', '9007199254740992'],
        ['c340000000000000', '-9007199254740992'],
        ['4430000000000000', '295147905179352830000'],
        ['44b52d02c7e14af5', '9.999999999999997e+22'],
        ['44b52d02c7e14af6', '1e+23'],
        ['44b52d02c7e14af7', '1.0000000000000001e+23'],
        ['444b1ae4d6e2ef4e', '999999999999999700000'],
        ['444b1ae4d6e2ef4f', '999999999999999900000'],
        ['444b1ae4d6e2ef50', '1e+21'],
        ['3eb0c6f7a0b5ed8c', '9.999999999999997e-7'],
        ['3eb0c6f7a0b5ed8d', '0.000001'],
        ['41b3de4355555553', '333333333.3333332'],
        ['41b3de4355555554', '333333333.33333325'],
        ['41b3de4355555555', '333333333.3333333'],
        ['41b3de4355555556', '333333333.3333334'],
        ['41b3de4355555557', '333333333.33333343'],
        ['becbf647612f3696', '-0.0000033333333333333333'],
        ['43143ff3c1cb0959', '1424953923781206.2'],
    ] as const)('serializes IEEE 754 %s as %s', (hex, json) => {
        expect(canonicalize(numberFromHex(hex))).toBe(json)
    })

    it('does not escape characters outside the ASCII controls', () => {
        expect(canonicalize('\u2028')).toBe('"\u2028"')
        expect(canonicalize('\u2028')).not.toContain('\\u2028')
    })

    it('rejects a lone surrogate, a non-finite number, and a non-JSON value', () => {
        expect(() => canonicalize('\uDEAD')).toThrow(/lone surrogate/)
        expect(() => canonicalize({ '\uDEAD': 1 })).toThrow(/lone surrogate/)
        expect(() => canonicalize(Number.NaN)).toThrow(/finite/)
        expect(() => canonicalize(Number.POSITIVE_INFINITY)).toThrow(/finite/)
        expect(() => canonicalize(undefined)).toThrow(/must be JSON/)
        expect(canonicalize({ a: undefined, b: 1 })).toBe('{"b":1}')
        expect(() => canonicalize([undefined])).toThrow(/undefined/)
        expect(() => canonicalize(new Date(0))).toThrow(/must be JSON/)
    })

    it('rejects a circular structure', () => {
        const value: { self?: unknown } = {}
        value.self = value
        expect(() => canonicalize(value)).toThrow(/circular/)
    })

    it('has no nesting limit, and reports nesting beyond the stack as its own error', () => {
        const nest = (levels: number): unknown => {
            let value: unknown = null
            for (let i = 0; i < levels; i++) value = { k: value }
            return value
        }
        expect(() => canonicalize(nest(1000))).not.toThrow()
        expect(() => canonicalize(nest(1_000_000))).toThrow(CanonicalizeError)
        expect(() => canonicalize(nest(1_000_000))).toThrow(
            'nesting is too deep to canonicalize'
        )
    })
})
