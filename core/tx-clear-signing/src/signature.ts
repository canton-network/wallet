// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fromBase64, toBase64 } from './bytes.ts'
import { canonicalize, CanonicalizeError } from './canonical-json.ts'

/** The only signature scheme a v1 descriptor can name. */
export const SIGNATURE_SCHEME = 'ed25519'

/** Standard base64 of a 64-byte Ed25519 signature. */
export const ED25519_SIGNATURE_PATTERN = /^[A-Za-z0-9+/]{86}==$/

/** Standard base64 of a 32-byte Ed25519 public key. */
export const ED25519_PUBLIC_KEY_PATTERN = /^[A-Za-z0-9+/]{43}=$/

/**
 * One signature over the descriptor with `signatures` removed.
 *
 * The signed bytes are the canonical JSON. Ed25519 hashes internally. `hashAlgorithm` is not
 * supported: a signature that sets it does not verify.
 */
export interface DescriptorSignature {
    scheme: 'ed25519'
    /** Standard base64 of the 64-byte Ed25519 signature. */
    signature: string
    /** Standard base64 of the 32-byte Ed25519 public key. */
    publicKey: string
}

/** A public key `clearSign` accepts, matched on scheme and key bytes. */
export interface TrustedKey {
    /** Listed in `signers` when a signature from this key verifies. */
    name: string
    scheme: 'ed25519'
    /** Standard base64 of the 32-byte Ed25519 public key. */
    publicKey: string
}

export type SignatureVerification =
    | { ok: true; signers: string[] }
    | { ok: false; problems: string[] }

const SIGNATURE_FIELDS = new Set([
    'scheme',
    'hashAlgorithm',
    'signature',
    'publicKey',
])

/**
 * The bytes a descriptor signature covers.
 *
 * `signatures` is removed first, so entries are independent of each other and of their order.
 * Everything else is covered, including `$schema` and `$comment`. The bytes are the UTF-8 of the
 * RFC 8785 form.
 */
export function signingMessage(json: unknown): Uint8Array {
    return new TextEncoder().encode(canonicalize(withoutSignatures(json)))
}

/**
 * Appends an Ed25519 signature to `json`. An existing `signatures` array is kept, and each entry
 * still covers the descriptor with that array removed.
 *
 * `privateKey` is an Ed25519 JWK. WebCrypto does not import a raw Ed25519 private key.
 */
export async function signDescriptor(
    json: unknown,
    privateKey: JsonWebKey
): Promise<Record<string, unknown>> {
    if (!isJsonObject(json)) {
        throw new CanonicalizeError('descriptor must be a JSON object')
    }
    const existing = json.signatures
    if (existing !== undefined && !Array.isArray(existing)) {
        throw new CanonicalizeError('signatures must be an array')
    }
    const message = signingMessage(json)
    const key = await crypto.subtle.importKey(
        'jwk',
        privateKey,
        { name: 'Ed25519' },
        false,
        ['sign']
    )
    const signature = new Uint8Array(
        await crypto.subtle.sign(
            { name: 'Ed25519' },
            key,
            bufferSource(message)
        )
    )
    const entry: DescriptorSignature = {
        scheme: SIGNATURE_SCHEME,
        signature: toBase64(signature),
        publicKey: ed25519PublicKey(privateKey),
    }
    return {
        ...json,
        signatures: [...(existing ?? []), entry],
    }
}

/**
 * The standard-base64 Ed25519 public key carried by a private JWK.
 *
 * @throws CanonicalizeError when `jwk` is not an Ed25519 private key
 */
export function ed25519PublicKey(jwk: JsonWebKey): string {
    if (jwk.kty !== 'OKP' || jwk.crv !== 'Ed25519' || jwk.x === undefined) {
        throw new CanonicalizeError('private key must be an Ed25519 JWK')
    }
    return toBase64(base64UrlToBytes(jwk.x))
}

/**
 * Checks every signature on `json`.
 *
 * There must be at least one, and each one must verify against the public key it contains. When
 * `trusted` is given, that public key must also be in the list, matched on scheme and key bytes.
 * Omit `trusted` to check the embedded keys only, which is what storing a descriptor does: the
 * trusted list can change after the descriptor is stored.
 *
 * A failure is reported in `problems`. This does not throw for a descriptor that cannot be signed.
 */
export async function verifySignatures(
    json: unknown,
    trusted?: readonly TrustedKey[]
): Promise<SignatureVerification> {
    if (!isJsonObject(json)) {
        return { ok: false, problems: ['descriptor must be a JSON object'] }
    }
    if (!Object.hasOwn(json, 'signatures') || json.signatures === undefined) {
        return { ok: false, problems: ['descriptor has no signatures'] }
    }
    const signatures = json.signatures
    if (!Array.isArray(signatures)) {
        return { ok: false, problems: ['signatures must be an array'] }
    }
    if (signatures.length === 0) {
        return { ok: false, problems: ['descriptor has no signatures'] }
    }

    let raw: Uint8Array
    try {
        raw = signingMessage(json)
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return {
            ok: false,
            problems: [`descriptor cannot be canonicalized: ${message}`],
        }
    }

    const problems: string[] = []
    const signers: string[] = []
    for (const [index, entry] of signatures.entries()) {
        const where = `signatures[${index}]`
        const parsed = parseEntry(entry, where)
        if ('problems' in parsed) {
            problems.push(...parsed.problems)
            continue
        }
        const publicKey = decodeFixed(
            parsed.entry.publicKey,
            ED25519_PUBLIC_KEY_PATTERN,
            32
        )
        const signature = decodeFixed(
            parsed.entry.signature,
            ED25519_SIGNATURE_PATTERN,
            64
        )
        if (publicKey === undefined || signature === undefined) {
            problems.push(`${where}: signature could not be decoded`)
            continue
        }
        let verified = false
        try {
            const key = await crypto.subtle.importKey(
                'raw',
                bufferSource(publicKey),
                { name: 'Ed25519' },
                false,
                ['verify']
            )
            verified = await crypto.subtle.verify(
                { name: 'Ed25519' },
                key,
                bufferSource(signature),
                bufferSource(raw)
            )
        } catch {
            verified = false
        }
        if (!verified) {
            problems.push(`${where}: signature does not verify`)
            continue
        }
        if (trusted === undefined) {
            signers.push(parsed.entry.publicKey)
            continue
        }
        const signer = trustedName(trusted, parsed.entry.publicKey)
        if (signer === undefined) {
            problems.push(`${where}: public key is not trusted`)
            continue
        }
        signers.push(signer)
    }
    if (problems.length > 0) return { ok: false, problems }
    return { ok: true, signers }
}

function parseEntry(
    entry: unknown,
    where: string
): { entry: DescriptorSignature } | { problems: string[] } {
    if (!isJsonObject(entry)) {
        return { problems: [`${where}: must be an object`] }
    }
    const problems: string[] = []
    for (const key of Object.keys(entry)) {
        if (!SIGNATURE_FIELDS.has(key)) {
            problems.push(`${where}: unexpected field '${key}'`)
        }
    }
    if (entry.scheme !== SIGNATURE_SCHEME) {
        problems.push(`${where}: scheme must be '${SIGNATURE_SCHEME}'`)
    }
    if (entry.hashAlgorithm !== undefined) {
        problems.push(`${where}: hashAlgorithm is not supported`)
    }
    if (
        typeof entry.signature !== 'string' ||
        !ED25519_SIGNATURE_PATTERN.test(entry.signature)
    ) {
        problems.push(`${where}: signature must be 64 bytes of base64`)
    }
    if (
        typeof entry.publicKey !== 'string' ||
        !ED25519_PUBLIC_KEY_PATTERN.test(entry.publicKey)
    ) {
        problems.push(`${where}: publicKey must be 32 bytes of base64`)
    }
    if (problems.length > 0) return { problems }
    return {
        entry: {
            scheme: SIGNATURE_SCHEME,
            signature: entry.signature as string,
            publicKey: entry.publicKey as string,
        },
    }
}

function trustedName(
    trusted: readonly TrustedKey[],
    publicKey: string
): string | undefined {
    const bytes = decodeFixed(publicKey, ED25519_PUBLIC_KEY_PATTERN, 32)
    if (bytes === undefined) return undefined
    for (const key of trusted) {
        if (key.scheme !== SIGNATURE_SCHEME) continue
        // A trusted entry that is not canonical base64 of 32 bytes matches nothing.
        const candidate = decodeFixed(
            key.publicKey,
            ED25519_PUBLIC_KEY_PATTERN,
            32
        )
        if (candidate === undefined) continue
        let same = true
        for (let i = 0; i < bytes.length; i++) {
            if (candidate[i] !== bytes[i]) same = false
        }
        if (same) return key.name
    }
    return undefined
}

function decodeFixed(
    value: string,
    pattern: RegExp,
    bytes: number
): Uint8Array | undefined {
    if (!pattern.test(value)) return undefined
    try {
        const decoded = fromBase64(value)
        return decoded.length === bytes ? decoded : undefined
    } catch {
        return undefined
    }
}

function withoutSignatures(json: unknown): unknown {
    if (!isJsonObject(json)) {
        throw new CanonicalizeError('descriptor must be a JSON object')
    }
    if (!Object.hasOwn(json, 'signatures')) return json
    // `Object.fromEntries` defines own data properties, so a member named `__proto__` stays in
    // the signed bytes and the copy's prototype stays `Object.prototype`.
    return Object.fromEntries(
        Object.entries(json).filter(([key]) => key !== 'signatures')
    )
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * A copy whose backing store is an ArrayBuffer. WebCrypto's parameter types reject a
 * Uint8Array that TypeScript types as a view of SharedArrayBuffer.
 */
function bufferSource(bytes: Uint8Array): ArrayBuffer {
    const copy = new ArrayBuffer(bytes.byteLength)
    new Uint8Array(copy).set(bytes)
    return copy
}

function base64UrlToBytes(value: string): Uint8Array {
    const standard = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded =
        standard.length % 4 === 0
            ? standard
            : standard + '='.repeat(4 - (standard.length % 4))
    return fromBase64(padded)
}
