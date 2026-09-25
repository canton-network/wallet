// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { CTRFReport, Test } from 'ctrf'
import type { DappSDK } from '@canton-network/dapp-sdk'
import { z } from 'zod'

export type Report = CTRFReport
export type TestResult = Test

export const ObservationSchema = z.object({
    testId: z.string(),
    timestamp: z.number(),
    method: z.string(),
    params: z.unknown().optional(),
    result: z.unknown().optional(),
    error: z.unknown().optional(),
    event: z.string().optional(),
})
export type Observation = z.infer<typeof ObservationSchema>

export const DiagnosticsSchema = z.object({
    observations: z.array(ObservationSchema),
})

export function exportReport(
    report: Report,
    variant: 'report' | 'report+diagnostics' = 'report'
): Report {
    const exported = structuredClone(report)
    if (variant === 'report' && exported.extra)
        delete exported.extra.diagnostics
    return exported
}

const SENSITIVE_KEY_PATTERN = /token|authorization|cookie|secret|privatekey/i

export const SignatureSchema = z.strictObject({
    algorithm: z.literal('Ed25519'),
    sha256: z.string().regex(/^[a-f0-9]{64}$/, 'must be a SHA-256 hex digest'),
    value: z.string().min(1),
    partyId: z.string().min(1).optional(),
    networkId: z.string().min(1).optional(),
    publicKey: z.string().min(1).optional(),
})
export type Signature = z.infer<typeof SignatureSchema>

export function serializeReport(report: Report): string {
    return `${JSON.stringify(exportReport(report, 'report'), null, 2)}\n`
}

export async function sha256(text: string): Promise<string> {
    const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(text)
    )
    return Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, '0')
    ).join('')
}

export function reportHash(report: Report): Promise<string> {
    return sha256(serializeReport(report))
}

function decodeBase64(value: string): Uint8Array<ArrayBuffer> {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

export async function signReport(
    report: Report,
    pem: string
): Promise<Signature> {
    const keyData = decodeBase64(
        pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')
    )
    const key = await crypto.subtle.importKey(
        'pkcs8',
        keyData,
        'Ed25519',
        false,
        ['sign']
    )
    const hash = await reportHash(report)
    const bytes = await crypto.subtle.sign(
        'Ed25519',
        key,
        new TextEncoder().encode(hash)
    )
    return SignatureSchema.parse({
        algorithm: 'Ed25519',
        sha256: hash,
        value: btoa(String.fromCharCode(...new Uint8Array(bytes))),
    })
}

export async function signReportWithWallet(
    report: Report,
    sdk: DappSDK
): Promise<Signature> {
    const accounts = await sdk.listAccounts()
    const primaryAccounts = accounts.filter((account) => account.primary)
    if (primaryAccounts.length !== 1)
        throw new Error('Signing requires exactly one primary wallet account')
    const { partyId, networkId, publicKey } = primaryAccounts[0]
    const hash = await reportHash(report)
    const { signature } = await sdk.signMessage({ message: hash })
    return SignatureSchema.parse({
        algorithm: 'Ed25519',
        sha256: hash,
        partyId,
        networkId,
        publicKey,
        value: signature,
    })
}

export function runPassed(report: Report): boolean {
    const summary = report.results.summary
    return (
        summary.passed > 0 &&
        summary.failed === 0 &&
        summary.pending === 0 &&
        summary.other === 0
    )
}

export function redact<T>(value: T): T {
    if (Array.isArray(value)) return value.map(redact) as T
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => {
                if (SENSITIVE_KEY_PATTERN.test(key)) {
                    if (typeof item !== 'string') {
                        throw new TypeError(
                            `Sensitive field '${key}' could not be redacted because it is not a string`
                        )
                    }
                    return [key, '[REDACTED]']
                }
                return [key, redact(item)]
            })
        ) as T
    }
    return value
}
