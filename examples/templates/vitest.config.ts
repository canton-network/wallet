// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'vitest/config'
import { coverage, nodeProject } from '../../vitest.base.ts'

export default defineConfig({
    test: {
        // The bin entry only wires the modules together; it is covered by the
        // end-to-end test in src/index.test.ts, which runs it as a child process.
        coverage: coverage({ exclude: ['src/index.ts'] }),
        projects: [nodeProject()],
    },
})
