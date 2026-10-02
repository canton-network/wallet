// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createPrivateKey, sign } from 'node:crypto'
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { validateStrict } from 'ctrf'
import {
    reportHash,
    serializeReport,
    SignatureSchema,
    validateReport as validateReportContents,
    verifyReportSignature,
    type Report,
    type Signature,
} from '@canton-network/tool-conformance-dapp'

export function validateReport(value: unknown): asserts value is Report {
    validateStrict(value)
    validateReportContents(value)
}

async function writeJson(path: string, text: string): Promise<void> {
    const absolute = resolve(path)
    await mkdir(dirname(absolute), { recursive: true })
    const temporary = `${absolute}.${crypto.randomUUID()}.tmp`
    await writeFile(temporary, text, { mode: 0o600 })
    await rename(temporary, absolute)
}

export async function readArtifact(path: string): Promise<Report> {
    const value: unknown = JSON.parse(await readFile(path, 'utf8'))
    validateReport(value)
    return value
}

export async function writeArtifact(
    path: string,
    report: Report
): Promise<void> {
    validateReport(report)
    await writeJson(path, serializeReport(report))
}

export async function readSignature(path: string): Promise<Signature> {
    return SignatureSchema.parse(JSON.parse(await readFile(path, 'utf8')))
}

export async function writeSignature(
    path: string,
    signature: Signature
): Promise<void> {
    await writeJson(path, `${JSON.stringify(signature, null, 2)}\n`)
}

export async function signArtifact(
    report: Report,
    privateKeyPath: string
): Promise<Signature> {
    validateReport(report)
    const key = createPrivateKey(await readFile(privateKeyPath, 'utf8'))
    if (key.asymmetricKeyType !== 'ed25519')
        throw new Error('Signing requires an Ed25519 private key')
    const hash = await reportHash(report)
    return SignatureSchema.parse({
        algorithm: 'Ed25519',
        sha256: hash,
        value: sign(null, Buffer.from(hash), key).toString('base64'),
    })
}

export async function verifyArtifactSignature(
    report: Report,
    signature: Signature,
    publicKeyPath?: string
): Promise<boolean> {
    validateReport(report)
    return verifyReportSignature(
        report,
        signature,
        publicKeyPath ? await readFile(publicKeyPath, 'utf8') : undefined
    )
}
