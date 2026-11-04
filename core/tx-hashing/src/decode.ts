// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PreparedTransaction } from '@canton-network/core-ledger-proto'
import { fromBase64 } from './bytes.js'
import { TxHashingError } from './errors.js'

/** Decodes the input, refusing unknown fields: the hash would not cover them */
export function readPreparedTransaction(
    input: Uint8Array | string
): PreparedTransaction {
    if (typeof input === 'string') return decodeBinary(fromBase64(input))
    if (input instanceof Uint8Array) {
        if (input.length === 0) {
            throw new TxHashingError('DECODE_FAILED', 'input is empty')
        }
        // Copy: decoded bytes fields are views into the caller's buffer
        return decodeBinary(new Uint8Array(input))
    }
    throw new TxHashingError(
        'DECODE_FAILED',
        'input must be a Uint8Array or a base64 string'
    )
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
            `input cannot be decoded as a protobuf PreparedTransaction: ${String(error)}`
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
