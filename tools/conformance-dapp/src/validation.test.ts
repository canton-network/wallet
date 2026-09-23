// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { generateKeyPairSync, sign } from 'node:crypto'
import { validateStrict } from 'ctrf'
import { validateReport, verifyReportSignature } from './validation.ts'
import {
    reportHash,
    signReport,
    runPassed,
    exportReport,
    type Report,
} from './report.ts'

function report(): Report {
    return {
        reportFormat: 'CTRF',
        specVersion: '0.0.0',
        reportId: '00000000-0000-0000-0000-000000000000',
        results: {
            tool: { name: 'test' },
            summary: {
                tests: 2,
                passed: 1,
                failed: 0,
                skipped: 1,
                pending: 0,
                other: 0,
                start: 1,
                stop: 2,
            },
            tests: [
                { name: 'done', status: 'passed', duration: 1 },
                { name: 'excluded', status: 'skipped', duration: 0 },
            ],
        },
    }
}

describe('shared report validation', () => {
    it.each(['utf8', 'base64', 'hex'] as const)(
        'accepts only the hash text as the signed payload (%s)',
        async (encoding) => {
            const { privateKey, publicKey } = generateKeyPairSync('ed25519')
            const original = report()
            const hash = await reportHash(original)
            const signature = {
                algorithm: 'Ed25519' as const,
                sha256: hash,
                publicKey: Buffer.from(
                    publicKey.export({ format: 'jwk' }).x!,
                    'base64url'
                ).toString('hex'),
                value: sign(
                    null,
                    Buffer.from(hash, encoding),
                    privateKey
                ).toString('base64'),
            }
            expect(await verifyReportSignature(original, signature)).toBe(
                encoding === 'utf8'
            )
        }
    )
    it('hashes the same regardless of diagnostics or the export variant', async () => {
        const original = report()
        original.extra = { diagnostics: { observations: [] } }
        const plain = exportReport(original)
        const withLogs = exportReport(original, 'report+diagnostics')
        expect(plain.extra).not.toHaveProperty('diagnostics')
        expect(withLogs.extra).toHaveProperty('diagnostics')
        expect(original.extra).toHaveProperty('diagnostics')
        expect(plain.results).toStrictEqual(withLogs.results)
        expect(await reportHash(plain)).toBe(await reportHash(withLogs))
        expect(await reportHash(original)).toBe(await reportHash(withLogs))
    })
    it('checks the viewer fields and counts without enforcing the complete CTRF schema', () => {
        validateReport(report())
        validateStrict(report())
        for (const value of [
            null,
            {},
            { ...report(), reportFormat: 'wrong' },
        ]) {
            expect(() => validateStrict(value)).toThrow()
            expect(() => validateReport(value)).toThrow()
        }
        expect(() =>
            validateReport({ ...report(), timestamp: 'not-schema-validated' })
        ).not.toThrow()
        const invalid = report()
        invalid.results.summary.passed = 5
        expect(() => validateReport(invalid)).toThrow(/summary/)
    })
    it('treats skips as neutral but requires a pass', () => {
        expect(runPassed(report())).toBe(true)
        const empty = report()
        empty.results.summary.passed = 0
        expect(runPassed(empty)).toBe(false)
        for (const status of ['failed', 'pending', 'other'] as const) {
            const incomplete = report()
            incomplete.results.summary[status] = 1
            expect(runPassed(incomplete)).toBe(false)
        }
    })
    it('rejects malformed viewer fields and reversed times', () => {
        const original = report()
        for (const test of [
            null,
            { name: 123, status: 'passed', duration: 1 },
            { name: 'test', status: 'unknown', duration: 1 },
            { name: 'test', status: 'passed', duration: Infinity },
        ]) {
            expect(() =>
                validateReport({
                    ...original,
                    results: { ...original.results, tests: [test] },
                })
            ).toThrow()
        }
        original.results.summary.stop = 0
        expect(() => validateReport(original)).toThrow(/start\/stop/)
    })
    it('leaves fields outside the viewer schema and signed results untouched', async () => {
        const original = report()
        original.results.tests[0].extra = { custom: 'keep this' }
        original.extra = { diagnostics: { observations: [] } }
        const before = structuredClone(original)
        const hash = await reportHash(original)
        validateReport(original)
        expect(original).toStrictEqual(before)
        expect(await reportHash(original)).toBe(hash)
    })
    it('verifies provided and embedded keys, without changing the report or the detached signature', async () => {
        const { privateKey, publicKey } = generateKeyPairSync('ed25519')
        const pem = publicKey.export({ type: 'spki', format: 'pem' }).toString()
        const original = { ...report(), extra: {} }
        const before = structuredClone(original)
        const signature = await signReport(
            original,
            privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
        )
        expect(original).toStrictEqual(before)
        await expect(
            verifyReportSignature(original, signature)
        ).rejects.toThrow(/No verification key/)
        expect(await verifyReportSignature(original, signature, pem)).toBe(true)
        // The report's own diagnostics (never covered by the hash) and export
        // variant don't affect verification against the same signature.
        const withDiagnostics = {
            ...original,
            extra: { diagnostics: { observations: [] } },
        }
        expect(
            await verifyReportSignature(
                exportReport(withDiagnostics),
                signature,
                pem
            )
        ).toBe(true)
        expect(
            await verifyReportSignature(
                exportReport(withDiagnostics, 'report+diagnostics'),
                signature,
                pem
            )
        ).toBe(true)
        const embedded = {
            ...signature,
            publicKey: Buffer.from(
                publicKey.export({ format: 'jwk' }).x!,
                'base64url'
            ).toString('base64'),
        }
        expect(await verifyReportSignature(original, embedded)).toBe(true)
        const wrong = generateKeyPairSync('ed25519')
            .publicKey.export({ type: 'spki', format: 'pem' })
            .toString()
        expect(await verifyReportSignature(original, signature, wrong)).toBe(
            false
        )
        const tampered = structuredClone(original)
        tampered.results.tests[0].name = 'tampered'
        expect(await verifyReportSignature(tampered, signature, pem)).toBe(
            false
        )
    })
})
