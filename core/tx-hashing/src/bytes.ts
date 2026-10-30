// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TxHashingError } from './errors.js'

/** Joins byte arrays; a number stands for one byte. */
export function concat(...parts: (Uint8Array | number)[]): Uint8Array {
    return concatAll(parts)
}

/** Like `concat`, for a list whose length is not bounded by the call site. */
export function concatAll(parts: readonly (Uint8Array | number)[]): Uint8Array {
    let length = 0
    for (const part of parts)
        length += typeof part === 'number' ? 1 : part.length
    const out = new Uint8Array(length)
    let offset = 0
    for (const part of parts) {
        if (typeof part === 'number') {
            out[offset++] = part
        } else {
            out.set(part, offset)
            offset += part.length
        }
    }
    return out
}

export async function sha256(
    bytes: Uint8Array
): Promise<Uint8Array<ArrayBuffer>> {
    // Copied because digest() is typed to take only ArrayBuffer-backed arrays
    const digest = await globalThis.crypto.subtle.digest(
        'SHA-256',
        new Uint8Array(bytes)
    )
    return new Uint8Array(digest)
}

const BASE64_ALPHABET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const SEXTET = new Int8Array(128).fill(-1)
for (let i = 0; i < BASE64_ALPHABET.length; i++)
    SEXTET[BASE64_ALPHABET.charCodeAt(i)] = i

/**
 * Strict RFC 4648 base64: standard alphabet, padded, no whitespace, canonical
 * trailing bits. The empty string is rejected too, nothing this package decodes
 * is empty. Checked while decoding, because a regexp over a multi-megabyte
 * input overflows the stack.
 */
export function fromBase64(b64: string): Uint8Array {
    const length = b64.length
    if (length === 0 || length % 4 !== 0) {
        throw invalidBase64('length is not a positive multiple of 4')
    }
    const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0
    const out = new Uint8Array((length / 4) * 3 - padding)
    let accumulator = 0
    let bits = 0
    let written = 0
    for (let i = 0; i < length - padding; i++) {
        const code = b64.charCodeAt(i)
        const sextet = code < 128 ? SEXTET[code] : -1
        if (sextet < 0) throw invalidBase64(`invalid character at index ${i}`)
        accumulator = (accumulator << 6) | sextet
        bits += 6
        if (bits >= 8) {
            bits -= 8
            out[written++] = (accumulator >> bits) & 0xff
            accumulator &= (1 << bits) - 1
        }
    }
    if (accumulator !== 0) throw invalidBase64('non-zero trailing bits')
    return out
}

function invalidBase64(reason: string): TxHashingError {
    return new TxHashingError(
        'DECODE_FAILED',
        `input is not canonical standard base64: ${reason}`
    )
}

function nibble(code: number): number {
    if (code >= 0x30 && code <= 0x39) return code - 0x30
    if (code >= 0x61 && code <= 0x66) return code - 0x57
    return -1
}

/**
 * Accepts exactly what /^([0-9a-f]{2})*$/ accepts: lower case only, as the
 * participant takes contract ids. That regexp overflows the stack on very
 * large inputs, so the string is checked while decoding.
 */
export function hexToBytes(hex: string, path: string): Uint8Array {
    if (hex.length % 2 !== 0) {
        throw new TxHashingError(
            'INVALID_HEX',
            'hex string has an odd number of characters',
            path
        )
    }
    const out = new Uint8Array(hex.length / 2)
    for (let i = 0; i < out.length; i++) {
        const high = nibble(hex.charCodeAt(2 * i))
        const low = nibble(hex.charCodeAt(2 * i + 1))
        if (high < 0 || low < 0) {
            throw new TxHashingError(
                'INVALID_HEX',
                `hex string has a character other than 0-9 and a-f near index ${2 * i}`,
                path
            )
        }
        out[i] = (high << 4) | low
    }
    return out
}
