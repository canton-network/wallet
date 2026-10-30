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
import { DEFAULT_LIMITS } from '../limits.js'
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

    it.each([
        '9223372036854775808',
        '-9223372036854775809',
        '99999999999999999999',
        '',
        'abc',
        '1.5',
        '1e3',
        '0x10',
        ' 1',
        '1 ',
        '--1',
        '-',
    ])('rejects the string %j', (n) =>
        expect(() => encodeInt64(n, 'p')).toThrow(
            rejection('INVALID_VALUE', 'p')
        )
    )

    it.each([2n ** 63n, -(2n ** 63n) - 1n])('rejects the bigint %d', (n) =>
        expect(() => encodeInt64(n, 'p')).toThrow(
            rejection('INVALID_VALUE', 'p')
        )
    )
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

    it.each(['\ud800', '\udc00', 'a\ud800b', '\udc00\ud800', '😀\ud800'])(
        'rejects the unpaired surrogate in %j like python',
        (s) =>
            expect(() => encodeString(s, 'p')).toThrow(
                rejection('INVALID_VALUE', 'p')
            )
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

    it.each(['abc', 'zz', '0x12', 'ab cd', ' abcd', 'ABCD'])(
        'rejects %j with its path',
        (hex) =>
            expect(() => encodeHex(hex, 'a.contractId')).toThrow(
                rejection('INVALID_HEX', 'a.contractId')
            )
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

    it('encodes a list longer than a call can take as arguments', () => {
        const out = encodeRepeated(
            Array.from({ length: 300_000 }, () => 7),
            (n) => Uint8Array.of(n)
        )
        expect(out.length).toBe(4 + 300_000)
        expect(toHex(out.subarray(0, 6))).toBe('000493e00707')
    })
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
            'an empty module as one empty segment, like python split',
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

    it('rejects an unpaired surrogate and names the part', () =>
        expect(() =>
            encodeIdentifier(identifier('p', 'M\ud800', 'E'), 'id')
        ).toThrow(rejection('INVALID_VALUE', 'id.moduleName')))
})

describe('encodeValue', () => {
    it('encodes an empty record label like the Python example', () =>
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
    ])('encodes %s like the Python example', (_name, value, expected) =>
        expect(encoded(value)).toBe(hx(expected))
    )

    it('encodes a record holding all 16 kinds like the Python example', () => {
        const value = record(
            [
                ['unit', unit()],
                ['bool', bool(true)],
                ['int64', int64('42')],
                ['numeric', numeric('3.1415926536')],
                ['timestamp', timestamp('1700000000000000')],
                ['date', date(19000)],
                ['party', party('Alice::1220abcd')],
                ['text', text('héllo')],
                ['contractId', contractId('0011aabb')],
                ['optional', optional(text('some'))],
                ['list', list([int64('1'), int64('2'), int64('3')])],
                ['textMap', textMap([['k', int64('9')]])],
                ['record', record([['inner', bool(false)]], OTHER)],
                ['variant', variant('V', unit(), OTHER)],
                ['enum', enumValue('E', OTHER)],
                ['genMap', genMap([[int64('1'), text('one')]])],
            ],
            TPL
        )
        expect(encoded(value)).toBe(
            hx(`0c 01 ${TPL_HEX} 00000010
                01 00000004 756e6974 00
                01 00000004 626f6f6c 01 01
                01 00000005 696e743634 02 000000000000002a
                01 00000007 6e756d65726963 03 0000000c 332e31343135393236353336
                01 00000009 74696d657374616d70 04 00060a24181e4000
                01 00000004 64617465 05 00004a38
                01 00000005 7061727479 06 0000000f 416c6963653a3a3132323061626364
                01 00000004 74657874 07 00000006 68c3a96c6c6f
                01 0000000a 636f6e74726163744964 08 00000004 0011aabb
                01 00000008 6f7074696f6e616c 09 01 07 00000004 736f6d65
                01 00000004 6c697374 0a 00000003 02 0000000000000001
                   02 0000000000000002 02 0000000000000003
                01 00000007 746578744d6170 0b 00000001 00000001 6b 02 0000000000000009
                01 00000006 7265636f7264 0c 01 ${OTHER_HEX} 00000001
                   01 00000005 696e6e6572 01 00
                01 00000007 76617269616e74 0d 01 ${OTHER_HEX} 00000001 56 00
                01 00000004 656e756d 0e 01 ${OTHER_HEX} 00000001 45
                01 00000006 67656e4d6170 0f 00000001
                   02 0000000000000001 07 00000003 6f6e65`)
        )
    })

    it('encodes a list longer than a call can take as arguments', () => {
        const out = encodeValue(
            list(Array.from({ length: 200_000 }, () => unit())),
            100,
            'v'
        )
        expect(out.length).toBe(1 + 4 + 200_000)
        expect(toHex(out.subarray(0, 7))).toBe('0a' + '00030d40' + '0000')
    })

    // The participant's decoder refuses a Timestamp or Date value outside
    // Daml's range. The time-bounds vectors hold the four values at its ends
    describe("Daml's range of timestamps and dates", () => {
        const refused = (value: Value, path: string) =>
            expect(() => encodeValue(value, 100, 'v')).toThrow(
                rejection('INVALID_VALUE', path)
            )

        it('encodes a timestamp of 0001-01-01T00:00:00Z, the first Daml timestamp, and refuses a microsecond earlier', () => {
            expect(encoded(timestamp('-62135596800000000'))).toBe(
                hx('04 ff23400100d44000')
            )
            refused(timestamp('-62135596800000001'), 'v.timestamp')
        })

        it('encodes a timestamp of 9999-12-31T23:59:59.999999Z, the last Daml timestamp, and refuses a microsecond later', () => {
            expect(encoded(timestamp('253402300799999999'))).toBe(
                hx('04 0384440ccc735fff')
            )
            refused(timestamp('253402300800000000'), 'v.timestamp')
        })

        it('encodes a date of 0001-01-01, the first Daml date, and refuses a day earlier', () => {
            expect(encoded(date(-719_162))).toBe(hx('05 fff506c6'))
            refused(date(-719_163), 'v.date')
        })

        it('encodes a date of 9999-12-31, the last Daml date, and refuses a day later', () => {
            expect(encoded(date(2_932_896))).toBe(hx('05 002cc0a0'))
            refused(date(2_932_897), 'v.date')
        })
    })

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

        it('takes the depth of the value itself as a fourth argument', () => {
            expect(() => encodeValue(unit(), 100, 'v', 100)).not.toThrow()
            expect(() => encodeValue(unit(), 100, 'v', 101)).toThrow(
                rejection('DEPTH_LIMIT_EXCEEDED', 'v')
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

        it('carries no depth over to the next call, whether it accepted or rejected the value', () => {
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

        it('stops a very deep value before the stack can overflow', () =>
            expect(() => encodeValue(nestedLists(100_000), 100, 'v')).toThrow(
                rejection('DEPTH_LIMIT_EXCEEDED')
            ))

        it.each([NaN, undefined as unknown as number])(
            'fails closed when the limit is %s',
            (limit) =>
                expect(() => encodeValue(unit(), limit, 'v')).toThrow(
                    rejection('DEPTH_LIMIT_EXCEEDED')
                )
        )
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
                'a non-hex contract id',
                contractId('zz'),
                'INVALID_HEX',
                'v.contractId',
            ],
            [
                'a contract id in upper case',
                contractId('00AB'),
                'INVALID_HEX',
                'v.contractId',
            ],
            [
                'an int64 above the maximum',
                int64('9223372036854775808'),
                'INVALID_VALUE',
                'v.int64',
            ],
            [
                'an int64 that is not a number',
                list([int64('abc')]),
                'INVALID_VALUE',
                'v.list.elements[0].int64',
            ],
            ['a fractional date', date(1.5), 'INVALID_VALUE', 'v.date'],
            [
                'an unpaired surrogate in text',
                text('\ud800'),
                'INVALID_VALUE',
                'v.text',
            ],
        ])('rejects %s', (_name, value, code, path) =>
            expect(() => encodeValue(value, 100, 'v')).toThrow(
                rejection(code, path)
            )
        )
    })
})

describe('DEFAULT_LIMITS', () => {
    it('has the documented values', () =>
        expect(DEFAULT_LIMITS).toEqual({
            maxNodes: 10_000,
            maxNodeDepth: 100,
            maxValueDepth: 101,
        }))

    it('cannot be changed by a caller', () =>
        expect(Object.isFrozen(DEFAULT_LIMITS)).toBe(true))
})
