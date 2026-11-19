// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import { parseJsonStrict } from './strict-json.ts'

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
})
