// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Value } from '@canton-network/core-ledger-proto'
import {
    type FieldInfo,
    MessageType,
    RepeatType,
    ScalarType,
} from '@protobuf-ts/runtime'
import { describe, expect, it } from 'vitest'

import { concat } from '../bytes.ts'
import { checkFraming } from '../framing.ts'
import { enumValue, record, text, unit } from './helpers/builders.ts'
import { rejection } from './helpers/matchers.ts'

const varint = (n: number): Uint8Array => {
    const out: number[] = []
    for (; n > 0x7f; n = Math.floor(n / 0x80)) out.push((n % 0x80) | 0x80)
    out.push(n)
    return Uint8Array.from(out)
}
const tag = (no: number, wireType: number) => varint(no * 8 + wireType)
const delimited = (...parts: Uint8Array[]) => {
    const content = concat(...parts)
    return concat(varint(content.length), content)
}
const utf8 = (s: string) => new TextEncoder().encode(s)

const fieldNo = (fields: readonly FieldInfo[], name: string): number => {
    const field = fields.find((f) => f.name === name)
    if (field === undefined) throw new Error(`no field ${name}`)
    return field.no
}
const of = (name: string) => fieldNo(Value.fields, name)

const ELEMENTS = (() => {
    const list = Value.fields.find((f) => f.name === 'list')
    if (list?.kind !== 'message') throw new Error('Value.list is no message')
    return fieldNo(list.T().fields, 'elements')
})()

// A Value holding a list whose first element is `bytes`, and a unit after it
const inList = (bytes: Uint8Array) =>
    concat(
        tag(of('list'), 2),
        delimited(
            tag(ELEMENTS, 2),
            delimited(bytes),
            tag(ELEMENTS, 2),
            delimited(Value.toBinary(unit()))
        )
    )

// A payload that fits each wire type, so that only the tag is wrong
const PAYLOAD: Readonly<Record<number, Uint8Array>> = {
    0: Uint8Array.of(1),
    1: new Uint8Array(8),
    2: Uint8Array.of(0),
    3: new Uint8Array(0),
    5: new Uint8Array(4),
}

describe('checkFraming', () => {
    describe('wire types', () => {
        it.each([
            ['text', 0],
            ['text', 1],
            ['text', 3],
            ['text', 5],
            ['bool', 1],
            ['bool', 2],
            ['bool', 5],
            ['timestamp', 0],
            ['timestamp', 2],
            ['timestamp', 5],
            ['enum', 0],
        ])('rejects Value.%s with wire type %i', (name, wireType) =>
            expect(() =>
                checkFraming(
                    concat(tag(of(name), wireType), PAYLOAD[wireType]),
                    Value
                )
            ).toThrow(rejection('DECODE_FAILED'))
        )

        it('names the field, its message and the byte', () =>
            expect(() =>
                checkFraming(
                    concat(tag(of('bool'), 0), 1, tag(of('text'), 0), 1),
                    Value
                )
            ).toThrow(
                rejection(
                    'DECODE_FAILED',
                    undefined,
                    'field 8 of com.daml.ledger.api.v2.Value at byte 2 has wire type 0, not 2'
                )
            ))
    })

    describe('tags', () => {
        // Field 8, `text`, with wire type 2 is the varint 0x42
        it('accepts a tag of 5 bytes', () =>
            expect(() =>
                checkFraming(
                    Uint8Array.of(0xc2, 0x80, 0x80, 0x80, 0x00, 0),
                    Value
                )
            ).not.toThrow())

        it.each([
            [
                'of 6 bytes',
                Uint8Array.of(0xc2, 0x80, 0x80, 0x80, 0x80, 0x00, 0),
            ],
            ['over 32 bits', Uint8Array.of(0xc2, 0x80, 0x80, 0x80, 0x10, 0)],
        ])('rejects a tag %s', (_case, bytes) =>
            expect(() => checkFraming(bytes, Value)).toThrow(
                rejection('DECODE_FAILED')
            )
        )
    })

    describe('lengths', () => {
        it('rejects a message whose last field runs past its length', () => {
            const short = Value.toBinary(record([['a', text('bc')]]))
            short[1] -= 1
            expect(() => checkFraming(short, Value)).toThrow(
                rejection('DECODE_FAILED')
            )
        })

        it.each([
            ['a length past its end', concat(tag(of('text'), 2), 5, 0x61)],
            ['a cut varint', concat(tag(of('bool'), 0), 0x81)],
            [
                'a cut fixed value',
                concat(tag(of('timestamp'), 1), new Uint8Array(7)),
            ],
            ['a cut tag', Uint8Array.of(0x82)],
        ])('rejects %s in a nested message', (_case, bytes) =>
            expect(() => checkFraming(inList(bytes), Value)).toThrow(
                rejection('DECODE_FAILED')
            )
        )

        it('rejects a varint longer than 10 bytes', () =>
            expect(() =>
                checkFraming(
                    concat(
                        tag(of('bool'), 0),
                        new Uint8Array(10).fill(0x80),
                        0
                    ),
                    Value
                )
            ).toThrow(rejection('DECODE_FAILED')))
    })

    it('rejects an unknown field', () =>
        expect(() => checkFraming(concat(tag(99, 0), 1), Value)).toThrow(
            rejection('UNKNOWN_FIELD')
        ))

    it.each([
        ['an empty message', unit()],
        ['messages that end at the same byte', record([['a', record([])]])],
        ['a two-byte tag', enumValue('A')],
    ])('accepts %s', (_case, value) =>
        expect(() => checkFraming(Value.toBinary(value), Value)).not.toThrow()
    )

    describe('repeated numbers', () => {
        const numbers = new MessageType<object>('test.Numbers', [
            {
                no: 1,
                name: 'counts',
                kind: 'scalar',
                T: ScalarType.UINT64,
                repeat: RepeatType.PACKED,
            },
            {
                no: 2,
                name: 'stamps',
                kind: 'scalar',
                T: ScalarType.SFIXED64,
                repeat: RepeatType.PACKED,
            },
            {
                no: 3,
                name: 'kinds',
                kind: 'enum',
                T: () => ['test.Kind', { A: 0, B: 1 }],
                repeat: RepeatType.PACKED,
            },
            {
                no: 4,
                name: 'weights',
                kind: 'scalar',
                T: ScalarType.FIXED32,
                repeat: RepeatType.PACKED,
            },
        ])

        it.each([
            [
                'packed',
                concat(
                    tag(1, 2),
                    delimited(varint(1), varint(300)),
                    tag(3, 2),
                    delimited(varint(1)),
                    tag(4, 2),
                    delimited(new Uint8Array(8))
                ),
            ],
            [
                'unpacked',
                concat(
                    tag(1, 0),
                    varint(300),
                    tag(3, 0),
                    varint(1),
                    tag(4, 5),
                    new Uint8Array(4)
                ),
            ],
        ])('accepts them %s', (_case, bytes) =>
            expect(() => checkFraming(bytes, numbers)).not.toThrow()
        )

        it.each([
            [
                'varint',
                concat(tag(1, 2), delimited(varint(1), Uint8Array.of(0x81))),
            ],
            ['fixed value', concat(tag(2, 2), delimited(new Uint8Array(7)))],
        ])('rejects a packed run that ends in part of a %s', (_case, bytes) =>
            expect(() => checkFraming(bytes, numbers)).toThrow(
                rejection('DECODE_FAILED')
            )
        )

        it('names both wire types a repeated number may have', () =>
            expect(() =>
                checkFraming(concat(tag(3, 1), new Uint8Array(8)), numbers)
            ).toThrow(
                rejection(
                    'DECODE_FAILED',
                    undefined,
                    'field 3 of test.Numbers at byte 0 has wire type 1, not 0 or 2'
                )
            ))
    })

    describe('maps', () => {
        const counts = new MessageType<object>('test.Counts', [
            {
                no: 1,
                name: 'counts',
                kind: 'map',
                K: ScalarType.STRING,
                V: { kind: 'scalar', T: ScalarType.UINT64 },
            },
        ])

        it('accepts an entry', () =>
            expect(() =>
                checkFraming(
                    concat(
                        tag(1, 2),
                        delimited(
                            tag(1, 2),
                            delimited(utf8('a')),
                            tag(2, 0),
                            varint(5)
                        )
                    ),
                    counts
                )
            ).not.toThrow())

        it('rejects an entry whose key has the wrong wire type', () =>
            expect(() =>
                checkFraming(
                    concat(
                        tag(1, 2),
                        delimited(tag(1, 0), varint(1), tag(2, 0), varint(5))
                    ),
                    counts
                )
            ).toThrow(rejection('DECODE_FAILED')))
    })
})
