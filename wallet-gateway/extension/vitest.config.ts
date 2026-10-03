// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing/vitest-plugin'

export default defineConfig({
    plugins: [WxtVitest()],
    test: {
        include: ['entrypoints/**/*.test.ts', 'utils/**/*.test.ts'],
        environment: 'node',
    },
})
