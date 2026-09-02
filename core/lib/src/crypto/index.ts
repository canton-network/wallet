// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Base64String, HexString } from '../encoding'

/**
 * Create fingerprint
 * @param publicKey The public key of the user (in base64 format).
 */
export async function computeCantonKeyFingerprint(
    publicKey: Base64String
): Promise<HexString> {
    const hashPurpose = 12 // For `PublicKeyFingerprint`
    const keyBytes = publicKey.asBytes()
    const hashInput = new Uint8Array(4 + keyBytes.length)
    hashInput[0] = (hashPurpose >>> 24) & 0xff
    hashInput[1] = (hashPurpose >>> 16) & 0xff
    hashInput[2] = (hashPurpose >>> 8) & 0xff
    hashInput[3] = hashPurpose & 0xff
    hashInput.set(keyBytes, 4)

    const hash = new Uint8Array(
        await globalThis.crypto.subtle.digest('SHA-256', hashInput)
    )
    const multiprefix = new Uint8Array([0x12, 0x20])
    const result = new Uint8Array(multiprefix.length + hash.length)
    result.set(multiprefix, 0)
    result.set(hash, multiprefix.length)

    return HexString.fromBytes(result)
}
