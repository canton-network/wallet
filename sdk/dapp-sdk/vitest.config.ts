// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'vitest/config'
import { browserProject, coverage } from '../../vitest.base.ts'

export default defineConfig({
    test: {
        globalSetup: ['./vitest.global-setup.ts'],
        coverage: coverage({
            exclude: [
                'src/integration-test/**',
                'src/dapp-api/rpc-gen/**',
                'src/test-utils.ts',
            ],
        }),
        projects: [
            browserProject({
                name: 'browser-unit',
                exclude: ['src/integration-test/*.test.ts'],
            }),
            // run separately by `test:coverage` so integration tests don't count towards coverage
            browserProject({
                name: 'browser-integration',
                include: ['src/integration-test/*.test.ts'],
            }),
        ],
    },
})
