// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { playwright } from '@vitest/browser-playwright'
import {
    defineProject,
    type TestProjectInlineConfiguration,
    type TestUserConfig,
} from 'vitest/config'

type CoverageConfig = NonNullable<TestUserConfig['coverage']>
type ProjectTestConfig = NonNullable<TestProjectInlineConfiguration['test']>
type Thresholds = {
    lines: number
    functions: number
    branches: number
    statements: number
}

const defaultThresholds: Thresholds = {
    lines: 80,
    functions: 80,
    branches: 70,
    statements: 80,
}

export interface CoverageOverrides {
    exclude?: string[]
    /** `false` reports coverage without enforcing any thresholds */
    thresholds?: Partial<Thresholds> | false
}

export function coverage(overrides: CoverageOverrides = {}): CoverageConfig {
    const { exclude, thresholds } = overrides
    return {
        provider: 'v8',
        include: ['src/**/*.ts'],
        ...(exclude && { exclude }),
        reporter: ['text', 'html', 'lcov', 'json-summary'],
        // @nx/vitest infers the cached test outputs from this
        reportsDirectory: './coverage',
        ...(thresholds !== false && {
            thresholds: { ...defaultThresholds, ...thresholds },
        }),
    }
}

export function nodeProject(test: ProjectTestConfig = {}) {
    return defineProject({
        test: {
            name: 'node',
            environment: 'node',
            include: ['src/**/*.test.ts'],
            ...test,
        },
    })
}

export function browserProject(test: ProjectTestConfig = {}) {
    return defineProject({
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
            ...test,
        },
    })
}
