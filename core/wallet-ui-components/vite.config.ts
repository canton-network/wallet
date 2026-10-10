// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { standardDecorators } from '../../vite.decorators.js'

export default defineConfig({
    build: {
        emptyOutDir: false,
        lib: {
            entry: 'src/index.ts',
            formats: ['es', 'cjs'],
            fileName: (format) => (format === 'cjs' ? 'index.cjs' : 'index.js'),
            cssFileName: 'index',
        },
        rollupOptions: {
            // Only lit core, so lit/decorators.js is not inlined with duplicate lit internals
            external: [/^lit(?:\/|$)/, 'bootstrap', '@popperjs/core'],
            output: {
                exports: 'auto',
            },
        },
        sourcemap: true,
    },
    plugins: [
        standardDecorators(resolve(import.meta.dirname, 'src/**/*.ts')),
        dts(),
    ],
})
