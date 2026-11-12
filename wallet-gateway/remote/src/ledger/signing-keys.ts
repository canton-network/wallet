// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto'
import type { UserId } from '@canton-network/core-wallet-auth'
import {
    type Error as SigningProviderError,
    type Keys,
    type SigningDriverInterface,
    SigningProvider,
} from '@canton-network/core-signing-lib'

export function handleSigningProviderError<T extends object>(
    result: SigningProviderError | T
): T {
    if ('error' in result) {
        throw new Error(
            `Error from signing driver: ${result.error_description}`
        )
    }
    return result
}

/**
 * Create a Canton public key fingerprint.
 * @param publicKey The public key of the user (in base64 format).
 */
export function createFingerprintFromKey(publicKey: string): string {
    // Hash purpose codes can be looked up in the Canton codebase:
    //  https://github.com/DACH-NY/canton/blob/62e9ccd3f1743d2c9422d863cfc2ca800405c71b/community/base/src/main/scala/com/digitalasset/canton/crypto/HashPurpose.scala#L52
    const hashPurpose = 12 // For `PublicKeyFingerprint`
    const keyBytes = Buffer.from(publicKey, 'base64')
    const hashInput = Buffer.alloc(4 + keyBytes.length)
    hashInput.writeUInt32BE(hashPurpose, 0)
    Buffer.from(keyBytes).copy(hashInput, 4)
    const hash = createHash('sha256').update(hashInput).digest()
    const multiprefix = Buffer.from([0x12, 0x20])
    return Buffer.concat([multiprefix, hash]).toString('hex')
}

/**
 * Normalizes a public key to base64 format.
 * Converts hex format (Fireblocks) to base64, or returns base64 as-is.
 * @param publicKey Public key in hex or base64 format
 * @returns Public key in base64 format, or null if conversion fails
 */
export function normalizePublicKeyToBase64(publicKey: string): string | null {
    try {
        // Try hex first (Fireblocks format), fallback to base64 (internal format)
        try {
            const hexKey = Buffer.from(publicKey, 'hex')
            // If it's valid hex and produces 32 bytes, convert to base64
            if (hexKey.length === 32) {
                return hexKey.toString('base64')
            } else {
                // Invalid hex length, treat as base64
                return publicKey
            }
        } catch {
            // Not valid hex, treat as base64
            return publicKey
        }
    } catch {
        // If any conversion fails, return null
        return null
    }
}

/**
 * Lists the keys a signing driver holds for a user. Talks only to the signing
 * driver, so no ledger access (and no admin token) is needed.
 */
export async function getSigningDriverKeys(
    drivers: Partial<Record<SigningProvider, SigningDriverInterface>>,
    userId: UserId,
    signingProviderId: SigningProvider
): Promise<Keys | null> {
    const driver = drivers[signingProviderId]
    if (!driver) {
        throw new Error(`Signing provider ${signingProviderId} not supported`)
    }
    if (signingProviderId === SigningProvider.PARTICIPANT) {
        // Participant-hosted parties have no signing-provider keys.
        throw new Error('Method not implemented')
    }
    return await driver
        .controller(userId)
        .getKeys()
        .then(handleSigningProviderError)
}
