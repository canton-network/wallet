// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, onTestFinished, vi } from 'vitest'
import {
    access,
    mkdir,
    mkdtemp,
    readFile,
    rm,
    writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { generateKeyPairSync, sign } from 'node:crypto'
import { chromium, type BrowserContext } from 'playwright'
import { runHarness } from './harness.ts'
import {
    readArtifact,
    readSignature,
    verifyArtifactSignature,
} from './artifact.ts'
import { loadCommandOptions } from './cli-config.ts'
import {
    ConfigSchema,
    cases,
    signReportWithWallet,
    type Report,
} from '@canton-network/tool-conformance-dapp'
import type { RpcTypes as DappRpcTypes } from '@canton-network/core-wallet-dapp-rpc-client'

async function createTempDir() {
    const directory = await mkdtemp(resolve(tmpdir(), 'harness-'))
    onTestFinished(() => rm(directory, { recursive: true, force: true }))
    return directory
}

describe('Conformance harness', () => {
    it('cleans up when SIGINT arrives during browser startup', async () => {
        const initialSigint = process.listeners('SIGINT')
        const initialSigterm = process.listeners('SIGTERM')
        const close = vi.fn(async () => {})
        const newPage = vi.fn()
        let profile = ''
        const launch = vi
            .spyOn(chromium, 'launchPersistentContext')
            .mockImplementation(async (path) => {
                profile = path
                process.listeners('SIGINT').at(-1)!('SIGINT')
                return { close, newPage } as unknown as BrowserContext
            })
        try {
            await expect(
                runHarness({ suite: ConfigSchema.parse(config) })
            ).rejects.toThrow('Run cancelled')
            expect(close).toHaveBeenCalledOnce()
            expect(newPage).not.toHaveBeenCalled()
            expect(process.listeners('SIGINT')).toStrictEqual(initialSigint)
            expect(process.listeners('SIGTERM')).toStrictEqual(initialSigterm)
            await expect(access(dirname(profile))).rejects.toMatchObject({
                code: 'ENOENT',
            })
        } finally {
            launch.mockRestore()
        }
    })

    it(
        'reports setup errors from the UI without waiting for a download',
        { timeout: 15000 },
        async () => {
            await expect(
                runHarness({
                    suite: {
                        provider: {
                            type: 'extension',
                            target: 'nonexistent-extension',
                        },
                        wrapper: { type: 'window' },
                        timeoutMs: 100,
                    },
                })
            ).rejects.toThrow('No wallet entry was selected')
        }
    )

    it('verifies embedded Ed25519 keys with trusted-key override', async () => {
        const tempDir = await createTempDir()
        const { privateKey, publicKey } = generateKeyPairSync('ed25519')
        const publicKeyPath = resolve(tempDir, 'public.pem')
        const embeddedKey = Buffer.from(
            publicKey.export({ format: 'jwk' }).x!,
            'base64url'
        ).toString('base64')
        await writeFile(
            publicKeyPath,
            publicKey.export({ type: 'spki', format: 'pem' })
        )
        const report: Report = {
            reportFormat: 'CTRF',
            specVersion: '0.0.0',
            reportId: '00000000-0000-0000-0000-000000000000',
            results: {
                tool: { name: 'test' },
                summary: {
                    tests: 0,
                    passed: 0,
                    failed: 0,
                    skipped: 0,
                    pending: 0,
                    other: 0,
                    start: 1,
                    stop: 1,
                },
                tests: [],
            },
        }
        type SigningSDK = Parameters<typeof signReportWithWallet>[1]
        const sdk = {
            listAccounts: async () => [
                {
                    primary: true,
                    partyId: 'alice::fingerprint',
                    networkId: 'testnet',
                    status: 'allocated',
                    hint: 'alice',
                    publicKey: embeddedKey,
                    namespace: 'fingerprint',
                    signingProviderId: 'signer',
                },
            ],
            signMessage: async ({ message }) => ({
                signature: sign(
                    null,
                    Buffer.from(message),
                    privateKey
                ).toString('base64'),
            }),
        } satisfies Pick<SigningSDK, 'listAccounts' | 'signMessage'>
        const signature = await signReportWithWallet(
            report,
            sdk as unknown as SigningSDK
        )
        expect(
            await verifyArtifactSignature(report, signature, publicKeyPath)
        ).toBe(true)
        expect(await verifyArtifactSignature(report, signature)).toBe(true)
        const modified = structuredClone(signature) as Record<string, unknown>
        modified.publicKey = 'invalid'
        await expect(
            verifyArtifactSignature(report, modified as never)
        ).rejects.toThrow(/Embedded public key/)
        expect(
            await verifyArtifactSignature(
                report,
                modified as never,
                publicKeyPath
            )
        ).toBe(true)
        delete modified.publicKey
        await expect(
            verifyArtifactSignature(report, modified as never)
        ).rejects.toThrow(/No verification key/)
        const tampered = structuredClone(report)
        tampered.results.tool.name = 'changed'
        expect(
            await verifyArtifactSignature(tampered, signature, publicKeyPath)
        ).toBe(false)
        const ecKey = generateKeyPairSync('ec', {
            namedCurve: 'prime256v1',
        }).publicKey
        await writeFile(
            publicKeyPath,
            ecKey.export({ type: 'spki', format: 'pem' })
        )
        await expect(
            verifyArtifactSignature(report, signature, publicKeyPath)
        ).rejects.toThrow('Ed25519 public key')
    })

    it('loads config sections relative to the config file and rejects missing/unknown ones', async () => {
        const tempDir = await createTempDir()
        const path = resolve(tempDir, 'config.json')
        await writeFile(
            path,
            JSON.stringify({
                serve: { host: '0.0.0.0', port: 8088 },
                verify: {
                    artifact: './result.json',
                    publicKey: './public.pem',
                },
            })
        )
        expect(await loadCommandOptions('verify', path)).toStrictEqual({
            artifact: resolve(tempDir, 'result.json'),
            publicKey: resolve(tempDir, 'public.pem'),
        })
        expect(await loadCommandOptions('serve', path)).toStrictEqual({
            host: '0.0.0.0',
            port: 8088,
        })
        await expect(loadCommandOptions('sign', path)).rejects.toThrow()

        await writeFile(
            path,
            JSON.stringify({
                validateArtifact: { artifact: './result.json' },
            })
        )
        await expect(loadCommandOptions('verify', path)).rejects.toThrow()

        await expect(loadCommandOptions('sign', '')).rejects.toThrow(
            'Invalid config path'
        )
    })

    /** Wallet side of the extension postMessage protocol; stringified into a content script, so it must be self-contained. */
    function registerFakeWallet() {
        const target = 'harness-fake-wallet'
        const connection = { isConnected: true, isNetworkConnected: true }
        const results: Partial<{
            [M in keyof DappRpcTypes]: DappRpcTypes[M]['result']
        }> = {
            connect: connection,
            status: {
                provider: {
                    id: 'fake-wallet',
                    version: '4.2.0',
                    providerType: 'browser',
                },
                connection,
            },
        }
        window.addEventListener('canton:requestProvider', () =>
            window.dispatchEvent(
                new CustomEvent('canton:announceProvider', {
                    detail: { id: target, name: 'Fake wallet', target },
                })
            )
        )
        window.addEventListener('message', ({ data }) => {
            if (data?.target !== target) return
            if (data.type === 'SPLICE_WALLET_EXT_READY')
                window.postMessage({ type: 'SPLICE_WALLET_EXT_ACK', target })
            if (data.type === 'SPLICE_WALLET_REQUEST') {
                const { id, method } = data.request
                const result = results[method as keyof DappRpcTypes]
                window.postMessage({
                    type: 'SPLICE_WALLET_RESPONSE',
                    response: {
                        jsonrpc: '2.0',
                        id,
                        ...(result
                            ? { result }
                            : { error: { code: -32601, message: method } }),
                    },
                })
            }
        })
    }

    // Only `status` runs: this covers the harness plumbing, not wallet conformance.
    const config = {
        provider: {
            type: 'extension',
            target: 'harness-fake-wallet',
        },
        wrapper: { type: 'window' },
        timeoutMs: 1000,
        disabledTests: cases
            .map(({ id }) => id)
            .filter((id) => id !== 'status'),
    }

    it(
        'CLI executes the browser suite, then downloads and signs the CTRF report',
        { timeout: 60000 },
        async () => {
            const tempDir = await createTempDir()
            const { privateKey, publicKey } = generateKeyPairSync('ed25519')
            await writeFile(
                resolve(tempDir, 'key.pem'),
                privateKey.export({ type: 'pkcs8', format: 'pem' }),
                { mode: 0o600 }
            )
            await writeFile(
                resolve(tempDir, 'public.pem'),
                publicKey.export({ type: 'spki', format: 'pem' })
            )
            await writeFile(
                resolve(tempDir, 'config.json'),
                JSON.stringify({
                    run: {
                        suite: config,
                        extension: './extension',
                        out: './report.json',
                        signingKey: './key.pem',
                    },
                    sign: {
                        artifact: './report.json',
                        signingKey: './key.pem',
                    },
                    verify: {
                        artifact: './report.json',
                        publicKey: './public.pem',
                    },
                })
            )
            await mkdir(resolve(tempDir, 'extension'))
            await writeFile(
                resolve(tempDir, 'extension', 'manifest.json'),
                JSON.stringify({
                    manifest_version: 3,
                    name: 'Fake harness test wallet',
                    version: '1.0.0',
                    content_scripts: [
                        {
                            matches: ['<all_urls>'],
                            js: ['content.js'],
                            run_at: 'document_start',
                            world: 'MAIN',
                        },
                    ],
                })
            )
            await writeFile(
                resolve(tempDir, 'extension', 'content.js'),
                `(${registerFakeWallet.toString()})()`
            )
            const cli = fileURLToPath(new URL('./cli.ts', import.meta.url))
            const { stdout } = await promisify(execFile)(process.execPath, [
                cli,
                'run',
                '--config',
                resolve(tempDir, 'config.json'),
            ])
            expect(stdout).toMatch(
                `1 passed, 0 failed, ${cases.length - 1} skipped`
            )
            await promisify(execFile)(process.execPath, [
                cli,
                'sign',
                '--config',
                resolve(tempDir, 'config.json'),
            ])
            const validated = await promisify(execFile)(process.execPath, [
                cli,
                'verify',
                '--config',
                resolve(tempDir, 'config.json'),
            ])
            expect(validated.stdout).toMatch(
                /CTRF and tester signature verified/
            )
            const report = await readArtifact(resolve(tempDir, 'report.json'))
            // Provenance: which wallet answered, not just how it was
            // reached, so a report identifies what it certifies.
            expect(report.extra?.provider).toMatchObject({
                wallet: {
                    id: 'fake-wallet',
                    version: '4.2.0',
                    providerType: 'browser',
                },
            })
            const signature = await readSignature(
                resolve(tempDir, 'report.json.sig')
            )
            expect(
                await verifyArtifactSignature(
                    report,
                    signature,
                    resolve(tempDir, 'public.pem')
                )
            ).toBe(true)
            const bytes = await readFile(
                resolve(tempDir, 'report.json'),
                'utf8'
            )
            expect(bytes.includes('PRIVATE KEY')).toBe(false)
        }
    )
})
