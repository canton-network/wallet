// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig, defineProject } from 'vitest/config'

export default defineConfig({
    test: {
        coverage: {
            include: ['src/**/*.ts'],
            exclude: [
                'src/migrations/**',
                'src/migrations-test/**',
                'src/cli.ts',
                'src/bootstrap.ts',
                'src/index.ts',
                'src/migrator.ts',
            ],
            provider: 'v8',
            reporter: ['text', 'html', 'lcov', 'json-summary'],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 70,
                statements: 80,
            },
        },
        projects: [
            defineProject({
                test: {
                    name: 'node',
                    environment: 'node',
                    include: ['src/**/*.test.ts'],
                    exclude: ['src/migrations-test/**'],
                },
            }),
            defineProject({
                test: {
                    name: 'migrations',
                    environment: 'node',
                    include: ['src/migrations-test/**/*.test.ts'],
                    globalSetup: ['src/migrations-test/global-setup.ts'],
                    testTimeout: 120_000,
                    hookTimeout: 120_000,
                },
            }),
        ],
    },
})
