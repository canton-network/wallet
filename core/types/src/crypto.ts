// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const PUBLIC_KEY_FINGERPRINT_HASH_PURPOSE = 12
const SHA_256_MULTIHASH_PREFIX = new Uint8Array([0x12, 0x20])

/**
 * Decodes a non-empty, standard Base64 string into bytes.
 *
 * Whitespace is ignored. URL-safe Base64 is not supported.
 *
 * @param value The Base64-encoded value.
 * @returns The decoded bytes.
 * @throws If the value is empty or malformed.
 */
export function base64ToBytes(value: string): Uint8Array {
    const normalized = value.replace(/\s/g, '')
    if (
        normalized.length === 0 ||
        normalized.length % 4 === 1 ||
        !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)
    ) {
        throw new Error('Invalid Base64 value')
    }

    try {
        const decoded = globalThis.atob(normalized)
        return Uint8Array.from(decoded, (character) => character.charCodeAt(0))
    } catch {
        throw new Error('Invalid Base64 value')
    }
}

/**
 * Creates a hex-encoded Canton namespace fingerprint from a Base64 public key.
 * Canton defines hash purpose `12` for public-key fingerprints:
 * https://github.com/digital-asset/canton/blob/main/community/base/src/main/scala/com/digitalasset/canton/crypto/HashPurpose.scala
 *
 * @param publicKey The Base64-encoded public key.
 * @returns The hex-encoded namespace fingerprint.
 */
export async function fingerprintPublicKey(publicKey: string): Promise<string> {
    const keyBytes = base64ToBytes(publicKey)
    const hashInput = new Uint8Array(4 + keyBytes.length)
    new DataView(hashInput.buffer).setUint32(
        0,
        PUBLIC_KEY_FINGERPRINT_HASH_PURPOSE
    )
    hashInput.set(keyBytes, 4)

    const hash = new Uint8Array(
        await globalThis.crypto.subtle.digest('SHA-256', hashInput)
    )
    const fingerprint = new Uint8Array(
        SHA_256_MULTIHASH_PREFIX.length + hash.length
    )
    fingerprint.set(SHA_256_MULTIHASH_PREFIX)
    fingerprint.set(hash, SHA_256_MULTIHASH_PREFIX.length)

    return Array.from(fingerprint, (byte) =>
        byte.toString(16).padStart(2, '0')
    ).join('')
}
