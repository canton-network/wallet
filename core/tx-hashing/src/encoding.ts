// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Identifier, Value } from '@canton-network/core-ledger-proto'
import { concat, concatAll, hexToBytes } from './bytes.js'
import { TxHashingError } from './errors.js'

// Mirrors daml_transaction_hashing_common.py (canton v3.5.1, 08-interactive-submission)

const utf8 = new TextEncoder()
// 0001-01-01T00:00:00Z and 9999-12-31T23:59:59.999999Z, in microseconds
const TIMESTAMP_MIN = -62_135_596_800_000_000n
const TIMESTAMP_MAX = 253_402_300_799_999_999n
// 0001-01-01 and 9999-12-31, in days since 1970-01-01
const DATE_MIN = -719_162
const DATE_MAX = 2_932_896

export function encodeBool(value: boolean): Uint8Array {
    return Uint8Array.of(value ? 1 : 0)
}

export function encodeInt32(value: number, path?: string): Uint8Array {
    if (!Number.isInteger(value) || value < -(2 ** 31) || value >= 2 ** 31) {
        throw new TxHashingError(
            'INVALID_VALUE',
            `${value} is not a valid int32`,
            path
        )
    }
    const out = new Uint8Array(4)
    new DataView(out.buffer).setInt32(0, value, false)
    return out
}

/** A string is the decimal form protobuf-ts gives for int64 fields. */
export function encodeInt64(value: bigint | string): Uint8Array {
    const out = new Uint8Array(8)
    new DataView(out.buffer).setBigInt64(0, BigInt(value), false)
    return out
}

/** Metadata times are uint64 fields that the participant fills with signed microseconds, so they are read as int64 */
export function encodeTime(time: bigint, path: string): Uint8Array {
    return encodeTimestamp(BigInt.asIntN(64, time), path)
}

// The participant's decoder refuses metadata times and Timestamp values outside Daml's range
function encodeTimestamp(micros: bigint | string, path: string): Uint8Array {
    const encoded = encodeInt64(micros)
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

// The participant's decoder refuses a Date value outside Daml's range
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

function encodeBytes(bytes: Uint8Array): Uint8Array {
    return concat(encodeInt32(bytes.length), bytes)
}

export function encodeString(value: string): Uint8Array {
    return encodeBytes(utf8.encode(value))
}

export function encodeHex(hex: string, path: string): Uint8Array {
    return encodeBytes(hexToBytes(hex, path))
}

export function encodeOptional<T>(
    value: T | undefined,
    encodeFn: (value: T) => Uint8Array
): Uint8Array {
    return value === undefined ? Uint8Array.of(0) : concat(1, encodeFn(value))
}

export function encodeRepeated<T>(
    values: readonly T[],
    encodeFn: (value: T, index: number) => Uint8Array
): Uint8Array {
    const parts: Uint8Array[] = [encodeInt32(values.length)]
    for (let i = 0; i < values.length; i++) parts.push(encodeFn(values[i], i))
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
        encodeString(id.packageId),
        encodeRepeated(id.moduleName.split('.'), encodeString),
        encodeRepeated(id.entityName.split('.'), encodeString)
    )
}

/** `depth` is the nesting level of `value`, the outermost value being 1 */
export function encodeValue(
    value: Value | undefined,
    maxDepth: number,
    path: string,
    depth = 1
): Uint8Array {
    if (depth > maxDepth) {
        throw new TxHashingError(
            'DEPTH_LIMIT_EXCEEDED',
            `value is nested deeper than ${maxDepth} levels`,
            path
        )
    }
    if (value === undefined) {
        throw new TxHashingError('MISSING_FIELD', 'value is missing', path)
    }
    const inner = (child: Value | undefined, childPath: string) =>
        encodeValue(child, maxDepth, childPath, depth + 1)
    const sum = value.sum
    switch (sum.oneofKind) {
        case 'unit':
            return Uint8Array.of(0x00)
        case 'bool':
            return concat(0x01, encodeBool(sum.bool))
        case 'int64':
            return concat(0x02, encodeInt64(sum.int64))
        case 'numeric':
            return concat(0x03, encodeString(sum.numeric))
        case 'timestamp':
            return concat(
                0x04,
                encodeTimestamp(sum.timestamp, `${path}.timestamp`)
            )
        case 'date':
            return concat(0x05, encodeDate(sum.date, `${path}.date`))
        case 'party':
            return concat(0x06, encodeString(sum.party))
        case 'text':
            return concat(0x07, encodeString(sum.text))
        case 'contractId':
            return concat(0x08, encodeHex(sum.contractId, `${path}.contractId`))
        case 'optional':
            return concat(
                0x09,
                encodeOptional(sum.optional.value, (child) =>
                    inner(child, `${path}.optional.value`)
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
                        encodeString(entry.key),
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
                    // Always 01 and the label, as in the Python example. Scala
                    // writes 00 for an empty label, which the participant never sends
                    return concat(
                        0x01,
                        encodeString(field.label),
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
                encodeString(sum.variant.constructor),
                inner(sum.variant.value, `${path}.variant.value`)
            )
        case 'enum':
            return concat(
                0x0e,
                encodeOptional(sum.enum.enumId, (id) =>
                    encodeIdentifier(id, `${path}.enum.enumId`)
                ),
                encodeString(sum.enum.constructor)
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
