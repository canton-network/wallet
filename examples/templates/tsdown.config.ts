// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'tsdown'
import { base } from '../../tsdown.base.ts'

export default defineConfig({
    ...base,
    // `bin.ts` runs the CLI on import, so the library lives in a separate entry.
    entry: ['src/index.ts', 'src/bin.ts'],
    format: ['esm'],
    platform: 'node',
    target: 'es2022',
})
