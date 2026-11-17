// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import type { Value } from '@canton-network/core-ledger-proto'
import type { Field } from './descriptor.js'
import { formatValue, FormatError } from './format.js'

const text = (t: string): Value => ({ sum: { oneofKind: 'text', text: t } })
const int64 = (n: string): Value => ({ sum: { oneofKind: 'int64', int64: n } })
const relTime = (micros: string): Value => ({
    sum: {
        oneofKind: 'record',
        record: {
            recordId: {
                packageId: '0'.repeat(64),
                moduleName: 'DA.Time.Types',
                entityName: 'RelTime',
            },
            fields: [{ label: 'microseconds', value: int64(micros) }],
        },
    },
})
const field = (format: Field['format'], ref?: string): Field => ({
    path: 'x',
    ...(format && { format }),
    ...(ref && { params: { $ref: ref } }),
})
// Written as a code point: a literal right-to-left override would be invisible in the source.
const RLO = String.fromCodePoint(0x202e)
const enums = { side: { SenderSide: 'send to', true: 'yes' } }

describe('formatValue', () => {
    it.each([
        ['0', '0s'],
        ['1500000', '1.5s'],
        ['90061000001', '1d 1h 1m 1.000001s'],
        ['-3600000000', '-1h'],
    ])('formats a duration of %s µs as %s', (micros, expected) => {
        expect(formatValue(relTime(micros), field('duration'), {})).toBe(
            expected
        )
    })

    it('does not treat a record of the same shape as a duration', () => {
        const bare = {
            sum: {
                oneofKind: 'record' as const,
                record: {
                    fields: [
                        { label: 'microseconds', value: int64('1000000') },
                    ],
                },
            },
        }
        expect(formatValue(bare, field('raw'), {})).toBe(
            '{"microseconds":"1000000"}'
        )
        expect(() => formatValue(bare, field('duration'), {})).toThrow(
            "format 'duration' does not accept record"
        )
    })

    it('formats timestamps before the epoch and on whole seconds', () => {
        const ts = (micros: string): Value => ({
            sum: { oneofKind: 'timestamp', timestamp: micros },
        })
        expect(formatValue(ts('-1'), field('dateTime'), {})).toBe(
            '1969-12-31T23:59:59.999999Z'
        )
        expect(formatValue(ts('0'), field('dateTime'), {})).toBe(
            '1970-01-01T00:00:00Z'
        )
    })

    it('maps enum constructors, bools and unit variants through the table', () => {
        const ref = '$.metadata.enums.side'
        const variant: Value = {
            sum: {
                oneofKind: 'variant',
                variant: { constructor: 'SenderSide' },
            },
        }
        const bool: Value = { sum: { oneofKind: 'bool', bool: true } }
        expect(formatValue(variant, field('enum', ref), enums)).toBe('send to')
        expect(formatValue(bool, field('enum', ref), enums)).toBe('yes')
    })

    it('fails on a value missing from the enum table', () => {
        const ref = '$.metadata.enums.side'
        const value: Value = {
            sum: { oneofKind: 'enum', enum: { constructor: 'ReceiverSide' } },
        }
        expect(() => formatValue(value, field('enum', ref), enums)).toThrow(
            "'ReceiverSide' is not in enum table"
        )
        expect(() =>
            formatValue(text('toString'), field('enum', ref), enums)
        ).toThrow(FormatError)
    })

    it('never coerces', () => {
        expect(() => formatValue(int64('1'), field('string'), {})).toThrow(
            "format 'string' does not accept int64"
        )
        expect(() => formatValue(text('1'), field('number'), {})).toThrow(
            FormatError
        )
        expect(() => formatValue(text('1d'), field('duration'), {})).toThrow(
            FormatError
        )
    })

    it('quotes text, and escapes control and bidirectional characters', () => {
        expect(formatValue(text(`a\nb${RLO}c`), field('string'), {})).toBe(
            '"a\\nb\\u{202e}c"'
        )
    })

    it('quotes text shown raw', () => {
        expect(formatValue(text('a "b"'), field('raw'), {})).toBe('"a \\"b\\""')
        expect(formatValue(int64('5'), field('raw'), {})).toBe('5')
    })

    it('shows a value without format as raw', () => {
        expect(formatValue(int64('5'), field(undefined), {})).toBe('5')
    })

    it('rejects a number or party that could extend the sentence', () => {
        const numeric = (n: string): Value => ({
            sum: { oneofKind: 'numeric', numeric: n },
        })
        const party = (p: string): Value => ({
            sum: { oneofKind: 'party', party: p },
        })
        expect(() =>
            formatValue(numeric('1 and send 1000'), field('number'), {})
        ).toThrow(FormatError)
        expect(() => formatValue(int64('0x10'), field('number'), {})).toThrow(
            FormatError
        )
        expect(() =>
            formatValue(int64('9223372036854775808'), field('number'), {})
        ).toThrow(FormatError)
        expect(formatValue(numeric('1.0000000000'), field('number'), {})).toBe(
            '1.0000000000'
        )
        expect(formatValue(int64('-42'), field('number'), {})).toBe('-42')
        expect(() =>
            formatValue(party('alice and bob'), field('party'), {})
        ).toThrow(FormatError)
        expect(formatValue(party('alice::1220abcd'), field('party'), {})).toBe(
            'alice::1220abcd'
        )
    })

    it('fails a raw value it does not recognise', () => {
        expect(() =>
            formatValue({ sum: {} } as Value, field('raw'), {})
        ).toThrow("format 'raw' does not accept an empty value")
    })

    it('shows a list of records as key-value JSON', () => {
        const party = (p: string): Value => ({
            sum: { oneofKind: 'party', party: p },
        })
        const numeric = (n: string): Value => ({
            sum: { oneofKind: 'numeric', numeric: n },
        })
        const none: Value = { sum: { oneofKind: 'optional', optional: {} } }
        const some = (value: Value): Value => ({
            sum: { oneofKind: 'optional', optional: { value } },
        })
        const rec = (fields: { label: string; value: Value }[]): Value => ({
            sum: { oneofKind: 'record', record: { fields } },
        })
        const side: Value = {
            sum: { oneofKind: 'enum', enum: { constructor: 'SenderSide' } },
        }
        const legs: Value = {
            sum: {
                oneofKind: 'list',
                list: {
                    elements: [
                        rec([
                            { label: 'transferLegId', value: text('leg-1') },
                            { label: 'side', value: side },
                            {
                                label: 'otherside',
                                value: rec([
                                    {
                                        label: 'owner',
                                        value: some(party('alice::1')),
                                    },
                                    { label: 'provider', value: none },
                                ]),
                            },
                            {
                                label: 'amount',
                                value: numeric('0.3000000000'),
                            },
                        ]),
                    ],
                },
            },
        }
        expect(formatValue(legs, field('raw'), {})).toBe(
            '[{"transferLegId":"leg-1","side":"SenderSide","otherside":{"owner":"alice::1","provider":null},"amount":"0.3000000000"}]'
        )
    })
})
