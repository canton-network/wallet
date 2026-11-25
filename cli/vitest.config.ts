// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'vitest/config'
import { coverage, nodeProject } from '../vitest.base.ts'

export default defineConfig({
    test: {
        // The bin entry runs the program on import; tests drive its commands in process.
        coverage: coverage({
            exclude: ['src/index.ts'],
        }),
        projects: [nodeProject()],
    },
})
