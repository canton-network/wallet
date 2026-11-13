// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

const BASE_URL = 'http://localhost:8081'
const DOCS_DIR = path.resolve(
    import.meta.dirname,
    '../../../docs/dapp-building/examples/portfolio'
)

const NETWORKS = ['devnet', 'testnet', 'mainnet'] as const

const readNetworkConfig = (name: (typeof NETWORKS)[number]) =>
    JSON.parse(
        readFileSync(path.join(DOCS_DIR, `config.${name}.json`), 'utf8')
    ) as unknown

test('a missing config shows the load error', async ({ page }) => {
    await page.route('**/config.json', (route) =>
        route.fulfill({ status: 404, body: 'missing' })
    )

    await page.goto(BASE_URL)

    await expect(page.getByRole('alert')).toContainText(
        'Failed to load portfolio configuration'
    )
    await expect(
        page.getByRole('heading', { name: 'Splice Portfolio' })
    ).toHaveCount(0)
})

test('an empty config shows the load error', async ({ page }) => {
    await page.route('**/config.json', (route) => route.fulfill({ json: {} }))

    await page.goto(BASE_URL)

    await expect(page.getByRole('alert')).toContainText(
        'Failed to load portfolio configuration'
    )
})

for (const name of NETWORKS) {
    test(`${name} config reaches the connect screen`, async ({ page }) => {
        await page.route('**/config.json', (route) =>
            route.fulfill({ json: readNetworkConfig(name) })
        )

        await page.goto(BASE_URL)

        await expect(
            page.getByRole('heading', { name: 'Splice Portfolio' })
        ).toBeVisible()
        await expect(
            page.getByRole('button', { name: 'Connect Wallet' })
        ).toBeVisible()
        await expect(page.getByRole('alert')).toHaveCount(0)
    })
}
