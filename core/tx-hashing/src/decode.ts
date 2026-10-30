// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PreparedTransaction } from '@canton-network/core-ledger-proto'
import { fromBase64 } from './bytes.js'
import { TxHashingError } from './errors.js'

/**
 * Reads a prepared transaction given as protobuf bytes, as those bytes in
 * base64, or as a message object, as it is now, and returns the function that
 * decodes it. Bytes are taken now and decoded when that function is called. A
 * message is encoded and decoded now. A field number the bindings do not know
 * is an error, because the hash would not cover it. The decoded transaction
 * shares no memory with the input.
 */
export function readPreparedTransaction(
    input: Uint8Array | string | PreparedTransaction
): () => PreparedTransaction {
    if (typeof input === 'string') {
        const bytes = fromBase64(input)
        return () => decodeBinary(bytes)
    }
    if (typeof input !== 'object' || input === null) {
        throw new TxHashingError(
            'DECODE_FAILED',
            'input is neither bytes, a base64 string nor a PreparedTransaction message'
        )
    }
    if (isUint8Array(input)) {
        // Checked before the copy, which throws for such a view
        if (getTypedArrayLength.call(input) === 0) {
            throw new TxHashingError(
                'DECODE_FAILED',
                'input is empty, or its buffer was detached or shrunk'
            )
        }
        // Copied, which also brings an array of another realm into this one:
        // decoded bytes fields are views into the buffer, which the caller
        // could change while the hash is computed
        const bytes = new Uint8Array(input)
        return () => decodeBinary(bytes)
    }
    const type = otherBinaryType(input)
    if (type !== undefined) {
        throw new TxHashingError(
            'DECODE_FAILED',
            `binary input must be a Uint8Array, not ${type}`
        )
    }
    const decoded = decodeMessage(input)
    return () => decoded
}

// The engine's own getters, called on the input. They read its internal
// slots: unlike instanceof they also work for an object of another realm (an
// iframe, a vm context), and unlike a property read they run none of its code.
const typedArrayPrototype: object = Object.getPrototypeOf(Uint8Array.prototype)
/** The kind of a typed array, such as Uint8Array; undefined for any other value */
const getTypedArrayKind = builtInGetter(typedArrayPrototype, Symbol.toStringTag)
/** 0 also once the buffer is detached or shrunk past the view */
const getTypedArrayLength = builtInGetter(typedArrayPrototype, 'length')
/** Each throws for any value but a buffer of its type */
const BUFFER_BYTE_LENGTHS = [ArrayBuffer, globalThis.SharedArrayBuffer]
    // A browser without cross-origin isolation has no SharedArrayBuffer
    .filter((type) => typeof type === 'function')
    .map(
        (type) =>
            [type.name, builtInGetter(type.prototype, 'byteLength')] as const
    )

function builtInGetter(target: object, key: PropertyKey): () => unknown {
    return Object.getOwnPropertyDescriptor(target, key)!.get!
}

/** A real Uint8Array, a Node Buffer included, also of another realm */
function isUint8Array(value: object): value is Uint8Array {
    return getTypedArrayKind.call(value) === 'Uint8Array'
}

/** The type of binary data other than a Uint8Array that `value` is, if any */
function otherBinaryType(value: object): string | undefined {
    const kind = getTypedArrayKind.call(value)
    if (typeof kind === 'string') return kind
    if (ArrayBuffer.isView(value)) return 'DataView'
    for (const [type, getByteLength] of BUFFER_BYTE_LENGTHS) {
        try {
            getByteLength.call(value)
            return type
        } catch {
            // Not a buffer of this type
        }
    }
    return undefined
}

function decodeBinary(bytes: Uint8Array): PreparedTransaction {
    try {
        return PreparedTransaction.fromBinary(bytes, {
            readUnknownField: rejectUnknownField,
        })
    } catch (error) {
        if (error instanceof TxHashingError) throw error
        throw new TxHashingError(
            'DECODE_FAILED',
            `input cannot be decoded as a protobuf PreparedTransaction: ${textOf(error)}`
        )
    }
}

function rejectUnknownField(
    typeName: string,
    _message: unknown,
    fieldNo: number
): never {
    throw new TxHashingError(
        'UNKNOWN_FIELD',
        `unknown field ${fieldNo} in ${typeName}: the hash would not cover it`
    )
}

// Encoding turns some values into others, such as a lone surrogate into
// U+FFFD, so the message must come back unchanged from its own bytes. Unknown
// fields stored on the message are encoded too, and decoding rejects them.
function decodeMessage(message: PreparedTransaction): PreparedTransaction {
    const decoded = decodeBinary(encodeMessage(message))
    if (!sameMessage(message, decoded)) {
        throw new TxHashingError(
            'INVALID_VALUE',
            'message changes when encoded as protobuf, so the hash would not cover the values it holds'
        )
    }
    return decoded
}

function encodeMessage(message: PreparedTransaction): Uint8Array {
    try {
        return PreparedTransaction.toBinary(message)
    } catch (error) {
        throw new TxHashingError(
            'INVALID_VALUE',
            `message cannot be encoded as protobuf: ${textOf(error)}`
        )
    }
}

// The comparison can throw where encoding did not: it recurses deeper, and it
// reads the oneof members that encoding skips
function sameMessage(
    message: PreparedTransaction,
    decoded: PreparedTransaction
): boolean {
    try {
        return PreparedTransaction.equals(message, decoded)
    } catch (error) {
        throw new TxHashingError(
            'INVALID_VALUE',
            `message cannot be compared with its encoding: ${textOf(error)}`
        )
    }
}

/** What was thrown, as text for a message. Never throws: String() would for some values. */
function textOf(error: unknown): string {
    try {
        return String(error)
    } catch {
        return 'a value that has no text'
    }
}
