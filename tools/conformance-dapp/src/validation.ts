// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod'
import {
    SignatureSchema,
    reportHash,
    type Report,
    type Signature,
} from './report.ts'

const statuses = ['passed', 'failed', 'skipped', 'pending', 'other'] as const
const count = z.number().int().nonnegative()
const ViewerReportSchema = z.object({
    reportFormat: z.literal('CTRF'),
    // reportHash covers the whole report, so a fresh reportId is always folded in.
    reportId: z.string().min(1),
    results: z
        .object({
            summary: z
                .object({
                    tests: count,
                    passed: count,
                    failed: count,
                    skipped: count,
                    pending: count,
                    other: count,
                    start: z.number(),
                    stop: z.number(),
                })
                .refine((summary) => summary.stop >= summary.start, {
                    message: 'Invalid CTRF start/stop times',
                }),
            tests: z.array(
                z.object({
                    name: z.string(),
                    status: z.enum(statuses),
                    duration: z.number(),
                })
            ),
        })
        .refine(
            ({ summary, tests }) =>
                summary.tests === tests.length &&
                statuses.every(
                    (status) =>
                        summary[status] ===
                        tests.filter((test) => test.status === status).length
                ),
            {
                message: 'CTRF summary does not match test results',
            }
        ),
})

export function validateReport(value: unknown): asserts value is Report {
    ViewerReportSchema.parse(value)
}

function decodeBase64(value: string): Uint8Array<ArrayBuffer> {
    const encoded = value.trim()
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded))
        throw new Error('Invalid Base64 value')
    const decoded = atob(encoded)
    if (btoa(decoded).replace(/=+$/, '') !== encoded.replace(/=+$/, ''))
        throw new Error('Invalid Base64 value')
    return Uint8Array.from(decoded, (character) => character.charCodeAt(0))
}

function decodeHex(value: string): Uint8Array<ArrayBuffer> {
    if (value.length % 2 !== 0 || !/^[a-f0-9]*$/i.test(value))
        throw new Error('Invalid hex value')
    return Uint8Array.from({ length: value.length / 2 }, (_, index) =>
        parseInt(value.slice(index * 2, index * 2 + 2), 16)
    )
}

async function importPublicKey(value: string): Promise<CryptoKey> {
    const text = value.trim()
    const header = '-----BEGIN PUBLIC KEY-----'
    const footer = '-----END PUBLIC KEY-----'
    let bytes: Uint8Array<ArrayBuffer>
    try {
        if (text.startsWith(header) && text.endsWith(footer)) {
            const body = text.slice(header.length, -footer.length)
            bytes = decodeBase64(body.replace(/\s/g, ''))
        } else if (text.length === 64) {
            bytes = decodeHex(text)
        } else {
            bytes = decodeBase64(text)
        }
    } catch {
        throw new Error(
            'Embedded public key must be a raw 32-byte hex/Base64 Ed25519 key or an Ed25519/P-256 SPKI (Base64 or PEM)'
        )
    }
    const format = bytes.length === 32 ? 'raw' : 'spki'
    for (const algorithm of [
        'Ed25519',
        { name: 'ECDSA', namedCurve: 'P-256' },
    ]) {
        try {
            return await crypto.subtle.importKey(
                format,
                bytes,
                algorithm,
                false,
                ['verify']
            )
        } catch {
            // WebCrypto rejects keys of another type, so try the next one.
        }
    }
    throw new Error('Verification requires an Ed25519 or P-256 public key')
}

export async function publicKeyAlgorithm(
    publicKey: string
): Promise<Signature['algorithm']> {
    const key = await importPublicKey(publicKey)
    return key.algorithm.name === 'ECDSA' ? 'ECDSA-P256' : 'Ed25519'
}

function derToRawSignature(
    der: Uint8Array<ArrayBuffer>
): Uint8Array<ArrayBuffer> | undefined {
    if (der[0] !== 0x30 || der[1] !== der.length - 2) return undefined
    const raw = new Uint8Array(64)
    let offset = 2
    for (const end of [32, 64]) {
        const length = der[offset + 1]
        if (der[offset] !== 0x02 || offset + 2 + length > der.length)
            return undefined
        const integer = der.subarray(offset + 2, offset + 2 + length)
        const value = integer[0] === 0 ? integer.subarray(1) : integer
        if (value.length > 32) return undefined
        raw.set(value, end - value.length)
        offset += 2 + length
    }
    return offset === der.length ? raw : undefined
}

/**
 * Verifies a detached Base64 or hex Ed25519 or ECDSA P-256/SHA-256 signature
 * over a message's UTF-8 bytes — the form CIP-103's `signMessage` returns.
 * Throws only when the key itself cannot be used; a signature that simply does
 * not match returns false.
 */
export async function verifyMessageSignature(
    message: string,
    signature: string,
    publicKey: string
): Promise<boolean> {
    const key = await importPublicKey(publicKey)
    const ecdsa = key.algorithm.name === 'ECDSA'
    // CIP-103 leaves the signature encoding open.
    for (const decode of [decodeBase64, decodeHex]) {
        let bytes: Uint8Array<ArrayBuffer> | undefined
        try {
            bytes = decode(signature.trim())
        } catch {
            continue
        }
        // WebCrypto expects raw r||s, but Canton ECDSA signatures are usually DER.
        if (ecdsa && bytes.length !== 64) bytes = derToRawSignature(bytes)
        if (
            bytes?.length === 64 &&
            (await crypto.subtle.verify(
                ecdsa ? { name: 'ECDSA', hash: 'SHA-256' } : 'Ed25519',
                key,
                bytes,
                new TextEncoder().encode(message)
            ))
        )
            return true
    }
    return false
}

export async function verifyReportSignature(
    report: Report,
    signature: Signature,
    publicKey?: string
): Promise<boolean> {
    validateReport(report)
    SignatureSchema.parse(signature)
    const hash = await reportHash(report)
    if (signature.sha256 !== hash) return false
    const keyText = publicKey ?? signature.publicKey
    if (!keyText)
        throw new Error(
            'No verification key available; supply a trusted Ed25519 or P-256 public key'
        )
    if (signature.algorithm !== (await publicKeyAlgorithm(keyText)))
        return false
    return verifyMessageSignature(hash, signature.value, keyText)
}
