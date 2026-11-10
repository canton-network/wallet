// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'vitest/config'
import { coverage, nodeProject } from '../../vitest.base.ts'

const schemaCoverage = coverage({
    thresholds: {
        lines: 80,
        functions: 75,
        branches: 60,
        statements: 80,
    },
})
schemaCoverage.include = ['src/lib/schemas.ts']

export default defineConfig({
    root: import.meta.dirname,
    test: {
        // Playwright covers the UI. This run only counts the config schema.
        coverage: schemaCoverage,
        projects: [
            nodeProject({
                include: ['src/**/*.test.ts', '**/*.node.test.ts'],
            }),
        ],
    },
})
