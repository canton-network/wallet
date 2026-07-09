// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'tsup'
import { base } from '../../tsup.base'

export default defineConfig({
    ...base,
    format: ['cjs'],
    platform: 'node',
    sourcemap: false,
    keepNames: true,
    bundle: false,
    outDir: 'dist/components',
    entry: ['src/**/*.ts'],
    esbuildOptions(options) {
        options.logOverride = {
            'commonjs-variable-in-esm': 'silent',
        }
    },
})
