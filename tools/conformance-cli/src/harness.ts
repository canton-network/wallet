// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isIPv6, type AddressInfo } from 'node:net'
import { once } from 'node:events'
import { access, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import express from 'express'
import { chromium, type BrowserContext } from 'playwright'
import {
    RunOptionsSchema,
    ServeConfigSchema,
    type RunOptions,
    type ServeOptions,
} from './config.ts'
import {
    readArtifact,
    signArtifact,
    writeArtifact,
    writeSignature,
} from './artifact.ts'
import {
    TEST_CASE_COUNT,
    type Report,
} from '@canton-network/tool-conformance-dapp'

const BROWSER_OVERHEAD_MS = 30_000

const appRoot = dirname(
    fileURLToPath(
        import.meta.resolve('@canton-network/tool-conformance-dapp/app')
    )
)

export async function serveApp(
    options: ServeOptions = {}
): Promise<{ url: string; close(): Promise<void> }> {
    const { port, host } = ServeConfigSchema.parse(options)
    await access(resolve(appRoot, 'index.html'))
    const app = express().use(express.static(appRoot))
    const server = app.listen(port, host)
    await once(server, 'listening')
    const { port: boundPort } = server.address() as AddressInfo
    return {
        url: `http://${isIPv6(host) ? `[${host}]` : host}:${boundPort}`,
        close: () => server[Symbol.asyncDispose](),
    }
}

export async function runHarness(input: RunOptions): Promise<Report> {
    const options = RunOptionsSchema.parse(input)
    const config = options.suite
    if (config.wrapper.type === 'manual' && !options.headed)
        throw new Error('Manual interaction requires --headed')
    if (options.disableWebSecurity)
        console.warn(
            'WARNING: browser web security disabled. Use test wallets and test credentials only.'
        )
    const directory = await mkdtemp(resolve(tmpdir(), 'cip103-'))
    let server: Awaited<ReturnType<typeof serveApp>> | undefined
    let context: BrowserContext | undefined
    let cancelled = false
    const stop = () => {
        cancelled = true
        void context?.close()
    }
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
    try {
        server = await serveApp({ port: 0 })
        if (cancelled) throw new Error('Run cancelled')
        const args: string[] = []
        if (options.disableWebSecurity) args.push('--disable-web-security')
        if (options.extension)
            args.push(
                `--disable-extensions-except=${options.extension}`,
                `--load-extension=${options.extension}`
            )
        context = await chromium.launchPersistentContext(
            resolve(directory, 'profile'),
            {
                headless: !options.headed,
                channel: 'chromium',
                args,
                acceptDownloads: true,
            }
        )
        if (cancelled) throw new Error('Run cancelled')
        const page = await context.newPage()
        await page.goto(server.url)
        const configPath = resolve(directory, 'run-config.json')
        await writeFile(configPath, JSON.stringify(config))
        await page.getByTestId('config-file').setInputFiles(configPath)
        await page.getByTestId('run-suite').click()
        const downloadButton = page.getByTestId('download-report')
        const error = page.getByTestId('run-error')
        await downloadButton
            .and(page.locator(':enabled'))
            .or(error)
            .first()
            .waitFor({
                state: 'visible',
                timeout:
                    BROWSER_OVERHEAD_MS + config.timeoutMs * TEST_CASE_COUNT,
            })
        if (await error.isVisible()) throw new Error(await error.innerText())
        const downloaded = page.waitForEvent('download')
        await downloadButton.click()
        const path = resolve(directory, 'report.json')
        await (await downloaded).saveAs(path)
        const report = await readArtifact(path)
        await writeArtifact(options.out, report)
        if (options.signingKey)
            await writeSignature(
                `${options.out}.sig`,
                await signArtifact(report, options.signingKey)
            )
        return report
    } finally {
        process.removeListener('SIGINT', stop)
        process.removeListener('SIGTERM', stop)
        try {
            await context?.close()
        } finally {
            try {
                await server?.close()
            } finally {
                await rm(directory, { recursive: true, force: true })
            }
        }
    }
}
