// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    createKeyPair,
    KeyPair,
    PublicKey,
} from '@canton-network/core-signing-lib'
import { base64ToBytes, bytesToHex } from '../utils/encoding'

export class KeysNamespace {
    constructor() {}

    /**
     *
     * @returns A base64 encoded public/private key pair
     */
    public generate(): KeyPair {
        return createKeyPair()
    }

    /**
     *
     * @param publicKey base64 encoded public key
     * @returns hex encoded fingerprint
     */
    public async fingerprint(publicKey: PublicKey) {
        const hashPurpose = 12 // For `PublicKeyFingerprint`
        const keyBytes = base64ToBytes(publicKey)
        const hashInput = new Uint8Array(4 + keyBytes.length)
        hashInput[0] = (hashPurpose >>> 24) & 0xff
        hashInput[1] = (hashPurpose >>> 16) & 0xff
        hashInput[2] = (hashPurpose >>> 8) & 0xff
        hashInput[3] = hashPurpose & 0xff
        hashInput.set(keyBytes, 4)

        const hash = new Uint8Array(
            await crypto.subtle.digest('SHA-256', hashInput)
        )
        const multiprefix = new Uint8Array([0x12, 0x20])
        const result = new Uint8Array(multiprefix.length + hash.length)
        result.set(multiprefix, 0)
        result.set(hash, multiprefix.length)
        return bytesToHex(result)
    }
}
