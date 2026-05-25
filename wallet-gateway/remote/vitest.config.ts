// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig, defineProject } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
    test: {
        coverage: {
            include: ['src/**/*.ts'],
            exclude: [
                'src/**/*.test.ts',
                'src/**/*.d.ts',
                'src/web/frontend/dist/**',
                'src/web/frontend/**/test-helpers.ts',
                'src/**/rpc-gen/**',
            ],
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            thresholds: {
                lines: 0,
                functions: 0,
                branches: 0,
                statements: 0,
            },
        },
        projects: [
            defineProject({
                test: {
                    name: 'node',
                    environment: 'node',
                    include: ['src/**/*.test.ts'],
                    exclude: ['src/web/frontend/**/*.test.ts'],
                    setupFiles: ['./vitest.setup.ts'],
                },
            }),
            defineProject({
                test: {
                    name: 'browser',
                    include: ['src/web/frontend/**/*.test.ts'],
                    setupFiles: ['./vitest.setup.browser.ts'],
                    browser: {
                        enabled: true,
                        provider: playwright({
                            trace: 'off',
                            screenshot: 'off',
                            video: 'off',
                        }),
                        instances: [{ browser: 'chromium' }],
                        headless: true,
                    },
                },
            }),
        ],
    },
})
