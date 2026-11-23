// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeBase64 } from '@canton-network/core-tx-hashing'

/**
 * Decodes canonical standard base64: padded, no whitespace, zero trailing bits. One byte string has
 * exactly one accepted encoding. This is the decoder the transaction hasher applies.
 *
 * @throws TxHashingError when `b64` is not canonical
 */
export function fromBase64(b64: string): Uint8Array {
    return decodeBase64(b64)
}

/** Encodes bytes as standard base64. `btoa` is available in Node and in the browser. */
export function toBase64(data: Uint8Array): string {
    let binaryString = ''
    for (let i = 0; i < data.byteLength; i++) {
        binaryString += String.fromCharCode(data[i])
    }
    return btoa(binaryString)
}
