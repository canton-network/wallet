// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import type { Value } from '@canton-network/core-ledger-proto'
import {
    encodeBool,
    encodeHex,
    encodeIdentifier,
    encodeInt32,
    encodeInt64,
    encodeOptional,
    encodeRepeated,
    encodeString,
    encodeValue,
} from '../encoding.js'
import type { TxHashingErrorCode } from '../errors.js'
import {
    bool,
    contractId,
    date,
    enumValue,
    genMap,
    identifier,
    int64,
    list,
    nestedLists,
    numeric,
    optional,
    party,
    record,
    text,
    textMap,
    timestamp,
    unit,
    variant,
} from './helpers/builders.js'
import { toHex } from './helpers/hex.js'
import { hx, rejection } from './helpers/matchers.js'

// The byte vectors for numbers, strings, hex, identifiers and values were produced by running
// daml_transaction_hashing_common.py (canton v3.5.1, 08-interactive-submission) on the same
// inputs. Spaces only group the bytes.
const encoded = (v: Value) => toHex(encodeValue(v, 100, 'v'))
const UNSET: Value = { sum: { oneofKind: undefined } }

const TPL = identifier('pkg', 'Mod.Sub', 'Ent')
const TPL_HEX = `00000003 706b67  00000002 00000003 4d6f64 00000003 537562
                 00000001 00000003 456e74`
const OTHER = identifier('#name', 'A', 'B.C')
const OTHER_HEX = `00000005 236e616d65  00000001 00000001 41
                   00000002 00000001 42 00000001 43`

describe('encodeBool', () => {
    it('writes 01 for true and 00 for false', () => {
        expect(toHex(encodeBool(true))).toBe('01')
        expect(toHex(encodeBool(false))).toBe('00')
    })
})

describe('encodeInt32', () => {
    it.each([
        [0, '00000000'],
        [1, '00000001'],
        [-1, 'ffffffff'],
        [256, '00000100'],
        [2147483647, '7fffffff'],
        [-2147483648, '80000000'],
    ])('encodes %d big-endian', (n, expected) =>
        expect(toHex(encodeInt32(n))).toBe(expected)
    )

    it.each([2147483648, -2147483649, 1.5, NaN, Infinity])(
        'rejects %d as not an int32',
        (n) =>
            expect(() => encodeInt32(n, 'p')).toThrow(
                rejection('INVALID_VALUE', 'p')
            )
    )
})

describe('encodeInt64', () => {
    it.each([
        ['0', '0000000000000000'],
        ['1', '0000000000000001'],
        ['-1', 'ffffffffffffffff'],
        ['256', '0000000000000100'],
        ['9007199254740993', '0020000000000001'],
        ['9223372036854775807', '7fffffffffffffff'],
        ['-9223372036854775808', '8000000000000000'],
    ])('encodes the string %s big-endian', (n, expected) => {
        expect(toHex(encodeInt64(n))).toBe(expected)
        expect(toHex(encodeInt64(BigInt(n)))).toBe(expected)
    })
})

describe('encodeString', () => {
    it.each([
        ['', '00000000'],
        ['abc', '00000003 616263'],
        ['é', '00000002 c3a9'],
        ['日本語', '00000009 e697a5e69cace8aa9e'],
        ['😀', '00000004 f09f9880'],
        ['a\u0000b', '00000003 610062'],
    ])('encodes %j as its utf8 byte length and bytes', (s, expected) =>
        expect(toHex(encodeString(s))).toBe(hx(expected))
    )
})

describe('encodeHex', () => {
    it.each([
        ['', '00000000'],
        ['00', '00000001 00'],
        ['00ff', '00000002 00ff'],
    ])('encodes %j as a length and the decoded bytes', (hex, expected) =>
        expect(toHex(encodeHex(hex, 'p'))).toBe(hx(expected))
    )
})

describe('encodeOptional', () => {
    const f = (n: number) => Uint8Array.of(n)

    it('writes 00 for undefined', () =>
        expect(toHex(encodeOptional(undefined, f))).toBe('00'))

    it('writes 01 and the encoding for a value', () =>
        expect(toHex(encodeOptional(7, f))).toBe('0107'))

    it('treats 0, false and the empty string as present', () => {
        expect(toHex(encodeOptional(0, f))).toBe('0100')
        expect(toHex(encodeOptional(false, (b) => encodeBool(b)))).toBe('0100')
        expect(toHex(encodeOptional('', (s) => encodeString(s)))).toBe(
            '0100000000'
        )
    })
})

describe('encodeRepeated', () => {
    it('writes a zero count for no elements', () =>
        expect(toHex(encodeRepeated([], () => Uint8Array.of(1)))).toBe(
            '00000000'
        ))

    it('writes the count and the elements in order, passing the index', () =>
        expect(
            toHex(
                encodeRepeated(['a', 'b'], (s, i) =>
                    Uint8Array.of(i, s.charCodeAt(0))
                )
            )
        ).toBe('00000002' + '0061' + '0162'))
})

describe('encodeIdentifier', () => {
    it.each([
        ['qualified names', TPL, TPL_HEX],
        [
            'single segments',
            identifier('p', 'M', 'E'),
            '00000001 70  00000001 00000001 4d  00000001 00000001 45',
        ],
        [
            'an empty module as one empty segment',
            identifier('p', '', 'E'),
            '00000001 70  00000001 00000000  00000001 00000001 45',
        ],
        [
            'an empty segment in the middle',
            identifier('p', 'A..B', 'E'),
            `00000001 70  00000003 00000001 41 00000000 00000001 42
             00000001 00000001 45`,
        ],
        [
            'a package name reference',
            identifier('#my-pkg', 'Main', 'T.Sub'),
            `00000007 236d792d706b67  00000001 00000004 4d61696e
             00000002 00000001 54 00000003 537562`,
        ],
    ])('encodes %s', (_name, id, expected) =>
        expect(toHex(encodeIdentifier(id, 'id'))).toBe(hx(expected))
    )

    it('rejects a missing identifier', () =>
        expect(() => encodeIdentifier(undefined, 'n.templateId')).toThrow(
            rejection('MISSING_FIELD', 'n.templateId')
        ))
})

describe('encodeValue', () => {
    it('writes 01 and an empty string for an empty record label', () =>
        expect(toHex(encodeValue(record([['', unit()]]), 100, 'v'))).toBe(
            '0c' + '00' + '00000001' + '01' + '00000000' + '00'
        ))

    it.each<[name: string, value: Value, expected: string]>([
        ['unit', unit(), '00'],
        ['bool true', bool(true), '01 01'],
        ['bool false', bool(false), '01 00'],
        [
            'numeric',
            numeric('1.5000000000'),
            '03 0000000c 312e35303030303030303030',
        ],
        [
            'numeric negative',
            numeric('-0.0000000001'),
            '03 0000000d 2d302e30303030303030303031',
        ],
        ['timestamp', timestamp('1700000000123456'), '04 00060a2418202240'],
        ['timestamp negative', timestamp('-1'), '04 ffffffffffffffff'],
        ['date zero', date(0), '05 00000000'],
        ['date', date(19000), '05 00004a38'],
        ['date negative', date(-1), '05 ffffffff'],
        [
            'party',
            party('Alice::1220abcd'),
            '06 0000000f 416c6963653a3a3132323061626364',
        ],
        ['text empty', text(''), '07 00000000'],
        ['text ascii', text('abc'), '07 00000003 616263'],
        ['contractId', contractId('00ab'), '08 00000002 00ab'],
        ['contractId empty', contractId(''), '08 00000000'],
        ['optional none', optional(), '09 00'],
        ['optional some', optional(int64('7')), '09 01 02 0000000000000007'],
        ['optional nested none', optional(optional()), '09 01 09 00'],
        ['list empty', list(), '0a 00000000'],
        [
            'list of two',
            list([int64('1'), int64('2')]),
            '0a 00000002  02 0000000000000001  02 0000000000000002',
        ],
        [
            'list of lists',
            list([list(), list([unit()])]),
            '0a 00000002  0a 00000000  0a 00000001 00',
        ],
        ['textMap empty', textMap([]), '0b 00000000'],
        [
            'textMap keeps entry order',
            textMap([
                ['b', unit()],
                ['a', text('v')],
                ['', bool(false)],
            ]),
            `0b 00000003  00000001 62 00  00000001 61 07 00000001 76
             00000000 01 00`,
        ],
        ['record empty', record([]), '0c 00 00000000'],
        [
            'record with id',
            record(
                [
                    ['a', int64('1')],
                    ['b', text('x')],
                ],
                TPL
            ),
            `0c 01 ${TPL_HEX} 00000002
             01 00000001 61 02 0000000000000001  01 00000001 62 07 00000001 78`,
        ],
        [
            'record without id',
            record([
                ['a', int64('1')],
                ['b', text('x')],
            ]),
            `0c 00 00000002
             01 00000001 61 02 0000000000000001  01 00000001 62 07 00000001 78`,
        ],
        [
            'variant without id',
            variant('Some', int64('5')),
            '0d 00 00000004 536f6d65 02 0000000000000005',
        ],
        [
            'variant with id',
            variant('Some', int64('5'), OTHER),
            `0d 01 ${OTHER_HEX} 00000004 536f6d65 02 0000000000000005`,
        ],
        ['enum without id', enumValue('Red'), '0e 00 00000003 526564'],
        [
            'enum with id',
            enumValue('Red', OTHER),
            `0e 01 ${OTHER_HEX} 00000003 526564`,
        ],
        ['genMap empty', genMap([]), '0f 00000000'],
        [
            'genMap',
            genMap([
                [text('a'), int64('1')],
                [int64('2'), text('b')],
            ]),
            `0f 00000002  07 00000001 61 02 0000000000000001
             02 0000000000000002 07 00000001 62`,
        ],
    ])('encodes %s', (_name, value, expected) =>
        expect(encoded(value)).toBe(hx(expected))
    )

    it.each<[bound: string, value: Value, hex: string, beyond: Value]>([
        [
            'first Daml timestamp',
            timestamp('-62135596800000000'),
            '04 ff23400100d44000',
            timestamp('-62135596800000001'),
        ],
        [
            'last Daml timestamp',
            timestamp('253402300799999999'),
            '04 0384440ccc735fff',
            timestamp('253402300800000000'),
        ],
        ['first Daml date', date(-719_162), '05 fff506c6', date(-719_163)],
        ['last Daml date', date(2_932_896), '05 002cc0a0', date(2_932_897)],
    ])(
        'encodes the %s and refuses one unit beyond it',
        (_bound, value, hex, beyond) => {
            expect(encoded(value)).toBe(hx(hex))
            expect(() => encodeValue(beyond, 100, 'v')).toThrow(
                rejection('INVALID_VALUE', `v.${beyond.sum.oneofKind}`)
            )
        }
    )

    describe('depth', () => {
        it('counts the outermost value as depth 1', () => {
            expect(encoded(nestedLists(1))).toBe('0a00000000')
            expect(encoded(nestedLists(3))).toBe(
                hx('0a 00000001  0a 00000001  0a 00000000')
            )
            expect(() => encodeValue(nestedLists(1), 1, 'v')).not.toThrow()
            expect(() => encodeValue(nestedLists(2), 1, 'v')).toThrow(
                rejection('DEPTH_LIMIT_EXCEEDED', 'v.list.elements[0]')
            )
        })

        it('names the first value that is too deep', () =>
            expect(() => encodeValue(nestedLists(3), 2, 'v')).toThrow(
                rejection(
                    'DEPTH_LIMIT_EXCEEDED',
                    'v.list.elements[0].list.elements[0]'
                )
            ))

        it('does not add up the depth of siblings', () =>
            expect(() =>
                encodeValue(list([list(), list(), list()]), 2, 'v')
            ).not.toThrow())

        it('carries no depth over to the next call', () => {
            for (let call = 0; call < 2; call++) {
                expect(() =>
                    encodeValue(nestedLists(100), 100, 'v')
                ).not.toThrow()
                expect(() => encodeValue(nestedLists(101), 100, 'v')).toThrow(
                    rejection('DEPTH_LIMIT_EXCEEDED')
                )
            }
        })

        it.each<[name: string, wrap: (inner: Value) => Value]>([
            ['optional', (inner) => optional(inner)],
            ['list', (inner) => list([inner])],
            ['textMap', (inner) => textMap([['k', inner]])],
            ['genMap key', (inner) => genMap([[inner, unit()]])],
            ['genMap value', (inner) => genMap([[unit(), inner]])],
            ['record', (inner) => record([['f', inner]])],
            ['variant', (inner) => variant('C', inner)],
        ])('counts a %s as one level', (_name, wrap) => {
            expect(() => encodeValue(wrap(unit()), 2, 'v')).not.toThrow()
            expect(() => encodeValue(wrap(unit()), 1, 'v')).toThrow(
                rejection('DEPTH_LIMIT_EXCEEDED')
            )
        })

        it('refuses a value nested 100,000 levels deep', () =>
            expect(() => encodeValue(nestedLists(100_000), 100, 'v')).toThrow(
                rejection('DEPTH_LIMIT_EXCEEDED')
            ))
    })

    describe('rejections name the offending value', () => {
        it('rejects a missing value', () =>
            expect(() => encodeValue(undefined, 100, 'v')).toThrow(
                rejection('MISSING_FIELD', 'v')
            ))

        it('names the path of a value with no oneof set', () =>
            expect(() => encodeValue(UNSET, 100, 'tx.arg')).toThrow(
                rejection('INVALID_VALUE', 'tx.arg')
            ))

        it.each<
            [name: string, value: Value, code: TxHashingErrorCode, path: string]
        >([
            [
                'an unset oneof in a list',
                list([unit(), UNSET]),
                'INVALID_VALUE',
                'v.list.elements[1]',
            ],
            [
                'an unset oneof in an optional',
                optional(UNSET),
                'INVALID_VALUE',
                'v.optional.value',
            ],
            [
                'an unset oneof in a record field',
                record([
                    ['a', unit()],
                    ['b', UNSET],
                ]),
                'INVALID_VALUE',
                'v.record.fields[1].value',
            ],
            [
                'a record field without a value',
                {
                    sum: {
                        oneofKind: 'record',
                        record: { fields: [{ label: 'a' }] },
                    },
                },
                'MISSING_FIELD',
                'v.record.fields[0].value',
            ],
            [
                'a variant without a value',
                {
                    sum: {
                        oneofKind: 'variant',
                        variant: { constructor: 'C' },
                    },
                },
                'MISSING_FIELD',
                'v.variant.value',
            ],
            [
                'a text map entry without a value',
                {
                    sum: {
                        oneofKind: 'textMap',
                        textMap: { entries: [{ key: 'k' }] },
                    },
                },
                'MISSING_FIELD',
                'v.textMap.entries[0].value',
            ],
            [
                'a gen map entry without a key',
                {
                    sum: {
                        oneofKind: 'genMap',
                        genMap: { entries: [{ value: unit() }] },
                    },
                },
                'MISSING_FIELD',
                'v.genMap.entries[0].key',
            ],
            [
                'a gen map entry without a value',
                {
                    sum: {
                        oneofKind: 'genMap',
                        genMap: { entries: [{ key: unit() }] },
                    },
                },
                'MISSING_FIELD',
                'v.genMap.entries[0].value',
            ],
            [
                'an odd-length contract id in a record',
                record([
                    ['a', unit()],
                    ['b', unit()],
                    ['c', contractId('abc')],
                ]),
                'INVALID_HEX',
                'v.record.fields[2].value.contractId',
            ],
            [
                'an odd-length contract id in a list',
                list([contractId('abc')]),
                'INVALID_HEX',
                'v.list.elements[0].contractId',
            ],
            ['a fractional date', date(1.5), 'INVALID_VALUE', 'v.date'],
        ])('rejects %s', (_name, value, code, path) =>
            expect(() => encodeValue(value, 100, 'v')).toThrow(
                rejection(code, path)
            )
        )
    })
})
