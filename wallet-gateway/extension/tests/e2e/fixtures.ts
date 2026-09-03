// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    chromium,
    test as base,
    type BrowserContext,
    type Page,
    type Worker,
} from '@playwright/test'

const extensionPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../.output/chrome-mv3'
)

type ExtensionFixtures = {
    context: BrowserContext
    serviceWorker: Worker
    extensionId: string
    extensionPage: Page
    dappPage: Page
}

export const test = base.extend<ExtensionFixtures>({
    context: async ({ headless }, use) => {
        await access(extensionPath).catch(() => {
            throw new Error(
                `Extension build not found at ${extensionPath}. Run "pnpm --filter @canton-network/wallet-gateway-extension build" first.`
            )
        })

        const context = await chromium.launchPersistentContext('', {
            channel: 'chromium',
            headless,
            args: [
                `--disable-extensions-except=${extensionPath}`,
                `--load-extension=${extensionPath}`,
            ],
        })

        try {
            await use(context)
        } finally {
            await context.close()
        }
    },

    serviceWorker: async ({ context }, use, testInfo) => {
        const errors: string[] = []
        const recordPageErrors = (page: Page) => {
            page.on('pageerror', (error) => {
                errors.push(`[page ${page.url()}] ${error.message}`)
            })
            page.on('console', (message) => {
                if (message.type() === 'error') {
                    errors.push(`[console ${page.url()}] ${message.text()}`)
                }
            })
        }
        context.pages().forEach(recordPageErrors)
        context.on('page', recordPageErrors)

        const serviceWorker =
            context.serviceWorkers()[0] ??
            (await context.waitForEvent('serviceworker'))
        serviceWorker.on('console', (message) => {
            if (message.type() === 'error') {
                errors.push(`[service worker] ${message.text()}`)
            }
        })

        await use(serviceWorker)

        if (testInfo.status !== testInfo.expectedStatus && errors.length > 0) {
            await testInfo.attach('browser-errors', {
                body: errors.join('\n'),
                contentType: 'text/plain',
            })
        }
    },

    extensionId: async ({ serviceWorker }, use) => {
        await use(new URL(serviceWorker.url()).host)
    },

    extensionPage: async ({ context, extensionId }, use) => {
        const page = await context.newPage()
        await page.goto(`chrome-extension://${extensionId}/popup.html`)
        await use(page)
    },

    dappPage: async ({ context }, use) => {
        const page = await context.newPage()
        await page.goto('http://localhost:8080')
        await use(page)
    },
})

export const expect = test.expect
