// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig, defineProject } from 'vitest/config'

export default defineConfig({
    test: {
        coverage: {
            include: ['src/**/*.ts'],
            exclude: ['src/api/**/index.ts', 'src/common/sdk.ts'],
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
                    include: ['src/**/*.test.ts'],
                },
            }),
<<<<<<< HEAD
=======
            defineProject({
                test: {
                    name: 'browser',
                    include: ['src/**/*.test.ts'],
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
>>>>>>> 8659d761 (feat(example-test-token-v1-registry): switch from koa to express (#2212))
        ],
    },
})
