// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig, defineProject } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { resolve } from 'path'
import { standardDecorators } from '../../vite.decorators.js'

export default defineConfig({
    test: {
        clearMocks: false,
        coverage: {
            include: ['src/**/*.ts'],
            exclude: [
                'src/**/*.stories.ts',
                'src/vite-env.d.ts',
                'src/components/fixtures.ts',
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
                plugins: [
                    standardDecorators(
                        resolve(import.meta.dirname, 'src/**/*.ts')
                    ),
                ],
                test: {
                    name: 'browser',
                    include: ['src/**/*.test.ts'],
                    browser: {
                        enabled: true,
                        provider: playwright(),
                        trace: 'off',
                        instances: [{ browser: 'chromium' }],
                        headless: true,
                    },
                },
            }),
        ],
    },
})
