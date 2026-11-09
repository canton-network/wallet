// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig, devices } from '@playwright/test'

// Browser check for the docs configs. The ledger suite stays in playwright.config.ts.
export default defineConfig({
    testDir: './tests',
    testMatch: 'network-config.spec.ts',
    timeout: 60_000,
    expect: { timeout: 15_000 },
    use: { ...devices['Desktop Chrome'] },
    webServer: {
        command: 'pnpm exec vite --port 8081 --strictPort',
        url: 'http://localhost:8081',
        reuseExistingServer: false,
        timeout: 120_000,
    },
})
