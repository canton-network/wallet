// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Identifier, Value } from '@canton-network/core-ledger-proto'
import { concat, concatAll, hexToBytes } from './bytes.js'
import { TxHashingError } from './errors.js'

// Mirrors daml_transaction_hashing_common.py (canton v3.5.1,
// 08-interactive-submission). Where the input is invalid, `path` names the
// offending field in the error.

const utf8 = new TextEncoder()
const UNPAIRED_SURROGATE = /\p{Surrogate}/u
const INT64_DECIMAL = /^-?[0-9]{1,19}$/
const INT64_MIN = -(2n ** 63n)
const INT64_MAX = 2n ** 63n - 1n
/** 0001-01-01T00:00:00Z and 9999-12-31T23:59:59.999999Z, in microseconds */
const TIMESTAMP_MIN = -62_135_596_800_000_000n
const TIMESTAMP_MAX = 253_402_300_799_999_999n
/** 0001-01-01 and 9999-12-31, in days since 1970-01-01 */
const DATE_MIN = -719_162
const DATE_MAX = 2_932_896

export function encodeBool(b: boolean): Uint8Array {
    return Uint8Array.of(b ? 1 : 0)
}

export function encodeInt32(n: number, path?: string): Uint8Array {
    if (!Number.isInteger(n) || n < -(2 ** 31) || n >= 2 ** 31) {
        throw new TxHashingError(
            'INVALID_VALUE',
            `${n} is not a valid int32`,
            path
        )
    }
    const out = new Uint8Array(4)
    new DataView(out.buffer).setInt32(0, n, false)
    return out
}

/** A string is the decimal form protobuf-ts gives for int64 fields. */
export function encodeInt64(n: bigint | string, path?: string): Uint8Array {
    if (typeof n === 'string' && !INT64_DECIMAL.test(n)) {
        throw new TxHashingError(
            'INVALID_VALUE',
            'int64 is not a decimal integer string',
            path
        )
    }
    const value = BigInt(n)
    if (value < INT64_MIN || value > INT64_MAX) {
        throw new TxHashingError(
            'INVALID_VALUE',
            `${value} is out of int64 range`,
            path
        )
    }
    const out = new Uint8Array(8)
    new DataView(out.buffer).setBigInt64(0, value, false)
    return out
}

/**
 * A time of the metadata, a uint64 of microseconds since 1970. The participant
 * writes it from a signed 64-bit number, so a time before 1970 arrives as 2^64
 * minus its magnitude. It is read back as that signed number and hashed as an
 * int64.
 */
export function encodeTime(time: bigint, path: string): Uint8Array {
    return encodeTimestamp(BigInt.asIntN(64, time), path)
}

/**
 * Microseconds since 1970 as an int64, refused outside Daml's timestamp range,
 * as the participant's decoder refuses a time of the metadata or a Timestamp
 * value there
 */
function encodeTimestamp(micros: bigint | string, path: string): Uint8Array {
    const encoded = encodeInt64(micros, path)
    const value = BigInt(micros)
    if (!(value >= TIMESTAMP_MIN && value <= TIMESTAMP_MAX)) {
        throw new TxHashingError(
            'INVALID_VALUE',
            `time ${value} is outside the range of a Daml timestamp, 0001-01-01T00:00:00Z to 9999-12-31T23:59:59.999999Z`,
            path
        )
    }
    return encoded
}

/**
 * Days since 1970 as an int32, refused outside Daml's date range, as the
 * participant's decoder refuses a Date value there
 */
function encodeDate(days: number, path: string): Uint8Array {
    if (!(days >= DATE_MIN && days <= DATE_MAX)) {
        throw new TxHashingError(
            'INVALID_VALUE',
            `date ${days} is outside the range of a Daml date, 0001-01-01 to 9999-12-31`,
            path
        )
    }
    return encodeInt32(days, path)
}

function encodeBytes(bytes: Uint8Array, path?: string): Uint8Array {
    return concat(encodeInt32(bytes.length, path), bytes)
}

export function encodeString(s: string, path?: string): Uint8Array {
    // TextEncoder would silently write U+FFFD here, python raises
    if (UNPAIRED_SURROGATE.test(s)) {
        throw new TxHashingError(
            'INVALID_VALUE',
            'string contains an unpaired surrogate and has no UTF-8 form',
            path
        )
    }
    return encodeBytes(utf8.encode(s), path)
}

export function encodeHex(hex: string, path: string): Uint8Array {
    return encodeBytes(hexToBytes(hex, path), path)
}

/**
 * Covers encode_optional and encode_proto_optional: a proto field counts as
 * present when it is not undefined.
 */
export function encodeOptional<T>(
    v: T | undefined,
    f: (x: T) => Uint8Array
): Uint8Array {
    return v === undefined ? Uint8Array.of(0) : concat(1, f(v))
}

export function encodeRepeated<T>(
    xs: readonly T[],
    f: (x: T, i: number) => Uint8Array
): Uint8Array {
    const parts: Uint8Array[] = [encodeInt32(xs.length)]
    for (let i = 0; i < xs.length; i++) parts.push(f(xs[i], i))
    return concatAll(parts)
}

export function encodeIdentifier(
    id: Identifier | undefined,
    path: string
): Uint8Array {
    if (id === undefined) {
        throw new TxHashingError('MISSING_FIELD', 'identifier is missing', path)
    }
    return concat(
        encodeString(id.packageId, `${path}.packageId`),
        encodeRepeated(id.moduleName.split('.'), (segment) =>
            encodeString(segment, `${path}.moduleName`)
        ),
        encodeRepeated(id.entityName.split('.'), (segment) =>
            encodeString(segment, `${path}.entityName`)
        )
    )
}

/**
 * `depth` is the nesting level of `v` itself, the outermost value being 1.
 * The check comes first so that recursion never goes deeper than `maxDepth`.
 */
export function encodeValue(
    v: Value | undefined,
    maxDepth: number,
    path: string,
    depth = 1
): Uint8Array {
    // Written as a negated <= so that a NaN or undefined limit fails closed
    if (!(depth <= maxDepth)) {
        throw new TxHashingError(
            'DEPTH_LIMIT_EXCEEDED',
            `value is nested deeper than ${maxDepth} levels`,
            path
        )
    }
    if (v === undefined) {
        throw new TxHashingError('MISSING_FIELD', 'value is missing', path)
    }
    const inner = (child: Value | undefined, childPath: string) =>
        encodeValue(child, maxDepth, childPath, depth + 1)
    const sum = v.sum
    switch (sum.oneofKind) {
        case 'unit':
            return Uint8Array.of(0x00)
        case 'bool':
            return concat(0x01, encodeBool(sum.bool))
        case 'int64':
            return concat(0x02, encodeInt64(sum.int64, `${path}.int64`))
        case 'numeric':
            return concat(0x03, encodeString(sum.numeric, `${path}.numeric`))
        case 'timestamp':
            return concat(
                0x04,
                encodeTimestamp(sum.timestamp, `${path}.timestamp`)
            )
        case 'date':
            return concat(0x05, encodeDate(sum.date, `${path}.date`))
        case 'party':
            return concat(0x06, encodeString(sum.party, `${path}.party`))
        case 'text':
            return concat(0x07, encodeString(sum.text, `${path}.text`))
        case 'contractId':
            return concat(0x08, encodeHex(sum.contractId, `${path}.contractId`))
        case 'optional':
            return concat(
                0x09,
                encodeOptional(sum.optional.value, (value) =>
                    inner(value, `${path}.optional.value`)
                )
            )
        case 'list':
            return concat(
                0x0a,
                encodeRepeated(sum.list.elements, (element, i) =>
                    inner(element, `${path}.list.elements[${i}]`)
                )
            )
        case 'textMap':
            return concat(
                0x0b,
                encodeRepeated(sum.textMap.entries, (entry, i) => {
                    const at = `${path}.textMap.entries[${i}]`
                    return concat(
                        encodeString(entry.key, `${at}.key`),
                        inner(entry.value, `${at}.value`)
                    )
                })
            )
        case 'record':
            return concat(
                0x0c,
                encodeOptional(sum.record.recordId, (id) =>
                    encodeIdentifier(id, `${path}.record.recordId`)
                ),
                encodeRepeated(sum.record.fields, (field, i) => {
                    const at = `${path}.record.fields[${i}]`
                    // The label is always written, even when empty, as in the
                    // Python example. Scala writes 00 for an empty label, but
                    // the participant names every field, so only crafted input
                    // has one, and its hash then differs from the participant's
                    return concat(
                        0x01,
                        encodeString(field.label, `${at}.label`),
                        inner(field.value, `${at}.value`)
                    )
                })
            )
        case 'variant':
            return concat(
                0x0d,
                encodeOptional(sum.variant.variantId, (id) =>
                    encodeIdentifier(id, `${path}.variant.variantId`)
                ),
                encodeString(
                    sum.variant.constructor,
                    `${path}.variant.constructor`
                ),
                inner(sum.variant.value, `${path}.variant.value`)
            )
        case 'enum':
            return concat(
                0x0e,
                encodeOptional(sum.enum.enumId, (id) =>
                    encodeIdentifier(id, `${path}.enum.enumId`)
                ),
                encodeString(sum.enum.constructor, `${path}.enum.constructor`)
            )
        case 'genMap':
            return concat(
                0x0f,
                encodeRepeated(sum.genMap.entries, (entry, i) => {
                    const at = `${path}.genMap.entries[${i}]`
                    return concat(
                        inner(entry.key, `${at}.key`),
                        inner(entry.value, `${at}.value`)
                    )
                })
            )
        default:
            throw new TxHashingError(
                'INVALID_VALUE',
                'value has no known kind set',
                path
            )
    }
}
