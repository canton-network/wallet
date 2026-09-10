// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig, defineProject } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
    test: {
        coverage: {
            include: ['src/**/*.ts'],
            provider: 'v8',
            reporter: ['text', 'html', 'lcov', 'json-summary'],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 70,
                statements: 80,
            },
        },
        environment: 'node',
        include: ['src/**/*.test.ts'],
        projects: [
            defineProject({
                test: {
                    name: 'node',
                    environment: 'node',
                    // Include node-specific tests AND shared tests
                    include: ['src/**/*.node.test.ts', 'src/**/*.test.ts'],
                },
            }),
            defineProject({
                test: {
                    name: 'browser',
                    // Include node-specific tests AND shared tests
                    include: ['src/**/*.test.ts'],
                    // Ensure node tests never run here
                    exclude: ['src/**/*.node.test.ts'],
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
