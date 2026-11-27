// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    type FieldInfo,
    normalizeFieldInfo,
    RepeatType,
    ScalarType,
    WireType,
} from '@protobuf-ts/runtime'

import { TxHashingError } from './errors.ts'

// The generated decoders pick a field by its number whatever its wire type,
// keep the low 32 bits of a longer tag, and read a field to its own length even
// past the end of its message. Strict parsers, such as the Python example
// shipped with Canton, read such bytes as another message or refuse them, so
// their hash would differ.

/** A message type, as far as its encoding goes */
interface Shape {
    readonly typeName: string
    readonly fields: readonly FieldInfo[]
}

interface Frame {
    readonly shape: Shape
    readonly end: number
}

const FIXED64: ReadonlySet<ScalarType> = new Set([
    ScalarType.DOUBLE,
    ScalarType.FIXED64,
    ScalarType.SFIXED64,
])
const FIXED32: ReadonlySet<ScalarType> = new Set([
    ScalarType.FLOAT,
    ScalarType.FIXED32,
    ScalarType.SFIXED32,
])

const byNumber = new WeakMap<Shape, ReadonlyMap<number, FieldInfo>>()
const entryShapes = new WeakMap<FieldInfo, Shape>()

/**
 * Refuses bytes that hold a tag that is not a 32-bit varint, a field with a
 * wire type its definition does not allow, or a field that runs past the end
 * of its message
 */
export function checkFraming(bytes: Uint8Array, type: Shape): void {
    const enclosing: Frame[] = []
    let frame: Frame = { shape: type, end: bytes.length }
    let at = 0
    for (;;) {
        while (at === frame.end) {
            const parent = enclosing.pop()
            if (parent === undefined) return
            frame = parent
        }
        const { shape, end } = frame
        const tagAt = at
        const tag = readVarint(bytes, at, end, () =>
            where('a tag', shape, tagAt)
        )
        // Strict parsers take a tag of at most 5 bytes that fits in 32 bits
        if (tag.next - tagAt > 5 || tag.value > 0xffff_ffff) {
            throw new TxHashingError(
                'DECODE_FAILED',
                `${where('the tag', shape, tagAt)} is not a 32-bit varint`
            )
        }
        const no = Math.floor(tag.value / 8)
        const wireType = tag.value % 8
        const field = fieldsOf(shape).get(no)
        // Not reached after the decoder, which refuses unknown fields first
        if (field === undefined) {
            throw new TxHashingError(
                'UNKNOWN_FIELD',
                `unknown field ${no} in ${shape.typeName}: the hash would not cover it`
            )
        }
        const name = () => where(`field ${no}`, shape, tagAt)
        const expected = wireTypeOf(field)
        const packable =
            field.repeat !== RepeatType.NO &&
            expected !== WireType.LengthDelimited
        if (
            wireType !== expected &&
            !(packable && wireType === WireType.LengthDelimited)
        ) {
            const allowed = packable
                ? `${expected} or ${WireType.LengthDelimited}`
                : `${expected}`
            throw new TxHashingError(
                'DECODE_FAILED',
                `${name()} has wire type ${wireType}, not ${allowed}`
            )
        }
        at = tag.next
        if (wireType !== WireType.LengthDelimited) {
            at = skipValue(bytes, at, end, expected, name)
            continue
        }
        const length = readVarint(bytes, at, end, name)
        if (length.value > end - length.next) throw pastEnd(name())
        const stop = length.next + length.value
        if (field.kind === 'message' || field.kind === 'map') {
            enclosing.push(frame)
            frame = {
                shape: field.kind === 'message' ? field.T() : entryOf(field),
                end: stop,
            }
            at = length.next
        } else {
            if (packable) checkPacked(bytes, length.next, stop, expected, name)
            at = stop
        }
    }
}

function wireTypeOf(field: FieldInfo): WireType {
    switch (field.kind) {
        case 'scalar':
            if (field.T === ScalarType.STRING || field.T === ScalarType.BYTES) {
                return WireType.LengthDelimited
            }
            if (FIXED64.has(field.T)) return WireType.Bit64
            if (FIXED32.has(field.T)) return WireType.Bit32
            return WireType.Varint
        case 'enum':
            return WireType.Varint
        case 'message':
        case 'map':
            return WireType.LengthDelimited
    }
}

function skipValue(
    bytes: Uint8Array,
    at: number,
    end: number,
    wireType: WireType,
    name: () => string
): number {
    if (wireType === WireType.Varint) {
        return readVarint(bytes, at, end, name).next
    }
    const size = wireType === WireType.Bit64 ? 8 : 4
    if (size > end - at) throw pastEnd(name())
    return at + size
}

/** Each value of a packed run must lie whole inside the field */
function checkPacked(
    bytes: Uint8Array,
    start: number,
    stop: number,
    wireType: WireType,
    name: () => string
): void {
    const value = () => `a packed value of ${name()}`
    if (wireType === WireType.Varint) {
        for (let at = start; at < stop;) {
            at = readVarint(bytes, at, stop, value, 'the field').next
        }
    } else if ((stop - start) % (wireType === WireType.Bit64 ? 8 : 4) !== 0) {
        throw pastEnd(value(), 'the field')
    }
}

function readVarint(
    bytes: Uint8Array,
    at: number,
    end: number,
    name: () => string,
    container = 'its message'
): { value: number; next: number } {
    let value = 0
    for (let i = 0; i < 10; i++) {
        if (at + i >= end) throw pastEnd(name(), container)
        const byte = bytes[at + i]
        value += (byte & 0x7f) * 2 ** (7 * i)
        if (byte < 0x80) return { value, next: at + i + 1 }
    }
    throw new TxHashingError(
        'DECODE_FAILED',
        `${name()} has a varint longer than 10 bytes`
    )
}

function fieldsOf(shape: Shape): ReadonlyMap<number, FieldInfo> {
    let fields = byNumber.get(shape)
    if (fields === undefined) {
        fields = new Map(shape.fields.map((field) => [field.no, field]))
        byNumber.set(shape, fields)
    }
    return fields
}

/** A map entry is a message with the key as field 1 and the value as field 2 */
function entryOf(field: FieldInfo & { kind: 'map' }): Shape {
    let entry = entryShapes.get(field)
    if (entry === undefined) {
        entry = {
            typeName: `${field.name} entry`,
            fields: [
                normalizeFieldInfo({
                    no: 1,
                    name: 'key',
                    kind: 'scalar',
                    T: field.K,
                }),
                normalizeFieldInfo({ no: 2, name: 'value', ...field.V }),
            ],
        }
        entryShapes.set(field, entry)
    }
    return entry
}

const where = (what: string, shape: Shape, at: number) =>
    `${what} of ${shape.typeName} at byte ${at}`

const pastEnd = (what: string, container = 'its message') =>
    new TxHashingError(
        'DECODE_FAILED',
        `${what} runs past the end of ${container}`
    )
