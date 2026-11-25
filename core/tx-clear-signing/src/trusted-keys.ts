// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod'

import { fromBase64 } from './bytes.ts'
import {
    ED25519_PUBLIC_KEY_PATTERN,
    SIGNATURE_SCHEME,
    type TrustedKey,
} from './signature.ts'
// A static import: the bundler inlines the file, so the keys are part of the built module. Nothing is
// fetched or read at runtime, and `clearSign` takes no keys from its caller.
import config from './trusted-keys.json'

/** The name the shipped config gives the reference key. */
export const REFERENCE_SIGNER = 'reference'

/**
 * The reference public key. Its private half is published under `testing/`, so anyone can sign
 * with it. It is fixed here only to detect that the config still trusts it.
 */
export const REFERENCE_PUBLIC_KEY =
    'RF9nfV7c/KhUJc5wcmkWt6awyV2x8Ij/ueGQb1t9ZhQ='

export class TrustedKeysError extends Error {
    constructor(message: string) {
        super(`invalid trusted-keys config: ${message}`)
        this.name = 'TrustedKeysError'
    }
}

const ConfigSchema = z.strictObject({
    $comment: z.string().optional(),
    trustedKeys: z.array(
        z.strictObject({
            name: z.string().min(1),
            scheme: z.literal(SIGNATURE_SCHEME),
            publicKey: z.string().regex(ED25519_PUBLIC_KEY_PATTERN),
        })
    ),
})

/**
 * Validates a trusted-keys config and returns its keys, frozen. Each key must be canonical base64 of
 * 32 bytes, and no name or key may repeat. An empty list is valid: then no descriptor verifies.
 *
 * @throws TrustedKeysError on any problem, so a bad config stops the module from loading
 */
export function loadTrustedKeys(json: unknown): readonly TrustedKey[] {
    const result = ConfigSchema.safeParse(json)
    if (!result.success) {
        throw new TrustedKeysError(
            result.error.issues
                .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
                .join('; ')
        )
    }
    const names = new Set<string>()
    const keys = new Set<string>()
    const loaded: TrustedKey[] = []
    for (const [index, entry] of result.data.trustedKeys.entries()) {
        const bytes = decodeKey(entry.publicKey)
        if (bytes === undefined) {
            throw new TrustedKeysError(
                `trustedKeys.${index}.publicKey is not canonical base64 of 32 bytes`
            )
        }
        if (names.has(entry.name)) {
            throw new TrustedKeysError(`name '${entry.name}' is listed twice`)
        }
        const hex = toHex(bytes)
        if (keys.has(hex)) {
            throw new TrustedKeysError(
                `trustedKeys.${index}.publicKey is listed twice`
            )
        }
        names.add(entry.name)
        keys.add(hex)
        loaded.push(Object.freeze({ ...entry }))
    }
    return Object.freeze(loaded)
}

/** True when `keys` contains the reference key, compared by key bytes, whatever its name. */
export function trustsReferenceKey(keys: readonly TrustedKey[]): boolean {
    const reference = toHex(decodeKey(REFERENCE_PUBLIC_KEY) ?? new Uint8Array())
    return keys.some((key) => {
        const bytes = decodeKey(key.publicKey)
        return bytes !== undefined && toHex(bytes) === reference
    })
}

/**
 * Public keys whose descriptor signatures `clearSign` accepts, from `trusted-keys.json`. Removing a key
 * there is how a signature from it stops being accepted. v1 has no expiry and no revocation record.
 */
export const TRUSTED_KEYS: readonly TrustedKey[] = loadTrustedKeys(config)

/** True while the config trusts the reference key. A gateway shows a warning then. */
export const TRUSTS_REFERENCE_KEY: boolean = trustsReferenceKey(TRUSTED_KEYS)

function decodeKey(publicKey: string): Uint8Array | undefined {
    if (!ED25519_PUBLIC_KEY_PATTERN.test(publicKey)) return undefined
    try {
        const bytes = fromBase64(publicKey)
        return bytes.length === 32 ? bytes : undefined
    } catch {
        return undefined
    }
}

function toHex(bytes: Uint8Array): string {
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
