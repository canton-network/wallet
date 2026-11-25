// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import { parseJsonStrict, StrictJsonError } from './strict-json.ts'

const examples = import.meta.glob('../examples/descriptors/**/*.json', {
    eager: true,
    import: 'default',
    query: '?raw',
}) as Record<string, string>

describe('parseJsonStrict', () => {
    it.each(Object.entries(examples))(
        'agrees with JSON.parse on %s',
        (name, text) => {
            if (name.endsWith('duplicate-key.json')) return
            expect(parseJsonStrict(text)).toEqual(JSON.parse(text))
        }
    )

    it('rejects a duplicate member name', () => {
        expect(() => parseJsonStrict('{"a":1,"a":2}')).toThrow(
            /duplicate key 'a' at \$/
        )
        expect(() =>
            parseJsonStrict('{"metadata":{"name":"a","name":"b"}}')
        ).toThrow(/duplicate key 'name' at \$\.metadata/)
        expect(() => parseJsonStrict('{"items":[{"a":1,"a":2}]}')).toThrow(
            /duplicate key 'a' at \$\.items\[0\]/
        )
    })

    it('treats an escaped spelling of a key as the same member', () => {
        expect(() => parseJsonStrict('{"a":1,"\\u0061":2}')).toThrow(
            /duplicate key 'a'/
        )
    })

    it('rejects a lone surrogate, escaped or literal', () => {
        expect(() => parseJsonStrict('"\\uDEAD"')).toThrow(/lone surrogate/)
        expect(() =>
            parseJsonStrict(`"${String.fromCharCode(0xdead)}"`)
        ).toThrow(/lone surrogate/)
        expect(parseJsonStrict('"\\uD83D\\uDE00"')).toBe('😀')
    })

    it('rejects a non-finite number and trailing data', () => {
        expect(() => parseJsonStrict('1e309')).toThrow(/non-finite/)
        expect(() => parseJsonStrict('{"a":1} true')).toThrow(/trailing data/)
        expect(() => parseJsonStrict('')).toThrow(/expected a value/)
    })

    it('keeps __proto__ as an own member', () => {
        for (const text of [
            '{"__proto__":"x","b":1}',
            '{"__proto__":{"polluted":true},"b":1}',
        ]) {
            const parsed = parseJsonStrict(text)
            expect(parsed).toEqual(JSON.parse(text))
            expect(Object.getPrototypeOf(parsed)).toBe(Object.prototype)
            expect(Object.hasOwn(parsed as object, '__proto__')).toBe(true)
        }
        const polluted = parseJsonStrict('{"__proto__":{"polluted":true}}') as {
            polluted?: boolean
        }
        expect(polluted.polluted).toBeUndefined()
    })

    it('has no nesting limit, and reports nesting beyond the stack as its own error', () => {
        const nest = (levels: number, wrap: (text: string) => string) => {
            let text = 'null'
            for (let i = 0; i < levels; i++) text = wrap(text)
            return text
        }
        const deep = nest(1000, (text) => `{"k":${text}}`)
        expect(parseJsonStrict(deep)).toEqual(JSON.parse(deep))

        const tooDeep = '['.repeat(1_000_000) + ']'.repeat(1_000_000)
        expect(() => parseJsonStrict(tooDeep)).toThrow(StrictJsonError)
        expect(() => parseJsonStrict(tooDeep)).toThrow(
            'nesting is too deep for this parser'
        )
    })
})
