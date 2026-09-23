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

async function importPublicKey(value: string): Promise<CryptoKey> {
    const text = value.trim()
    const header = '-----BEGIN PUBLIC KEY-----'
    const footer = '-----END PUBLIC KEY-----'
    const pem = text.startsWith(header) && text.endsWith(footer)
    let bytes: Uint8Array<ArrayBuffer>
    try {
        if (pem) {
            const body = text.slice(header.length, -footer.length)
            bytes = decodeBase64(body.replace(/\s/g, ''))
        } else if (text.length === 64 && /^[a-f0-9]+$/i.test(text)) {
            bytes = Uint8Array.from({ length: 32 }, (_, index) =>
                parseInt(text.slice(index * 2, index * 2 + 2), 16)
            )
        } else {
            bytes = decodeBase64(text)
        }
    } catch {
        throw new Error(
            'Embedded public key must be a raw 32-byte hex/Base64 Ed25519 key or a public key PEM'
        )
    }
    if (!pem && bytes.length !== 32)
        throw new Error(
            'Embedded public key must be a raw 32-byte hex/Base64 Ed25519 key or a public key PEM'
        )
    try {
        return await crypto.subtle.importKey(
            pem ? 'spki' : 'raw',
            bytes,
            'Ed25519',
            false,
            ['verify']
        )
    } catch (error) {
        if (error instanceof Error && error.name === 'NotSupportedError')
            throw error
        throw new Error('Verification requires an Ed25519 public key', {
            cause: error,
        })
    }
}

/**
 * Verifies a detached Base64 Ed25519 signature over a message's UTF-8 bytes —
 * the form CIP-103's `signMessage` returns. Throws only when the key itself
 * cannot be used (malformed, or an algorithm this runtime lacks); a signature
 * that simply does not match returns false.
 */
export async function verifyMessageSignature(
    message: string,
    signature: string,
    publicKey: string
): Promise<boolean> {
    const key = await importPublicKey(publicKey)
    let bytes: Uint8Array<ArrayBuffer>
    try {
        bytes = decodeBase64(signature)
    } catch {
        return false
    }
    if (bytes.length !== 64) return false
    return crypto.subtle.verify(
        'Ed25519',
        key,
        bytes,
        new TextEncoder().encode(message)
    )
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
            'No verification key available; supply a trusted Ed25519 public key'
        )
    return verifyMessageSignature(hash, signature.value, keyText)
}
