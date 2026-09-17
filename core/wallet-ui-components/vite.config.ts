// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'vite'
import dts from 'unplugin-dts/vite'
import { resolve } from 'path'
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
        rolldownOptions: {
            external: [/^lit(?:\/|$)/, 'bootstrap', '@popperjs/core'],
            output: {
                exports: 'auto',
            },
        },
        sourcemap: true,
    },
    plugins: [
        standardDecorators(resolve(import.meta.dirname, 'src/**/*.ts')),
        dts({
            outDirs: [
                { dir: 'dist', moduleFormat: 'esm' },
                { dir: 'dist', moduleFormat: 'cjs' },
            ],
            bundleTypes: true,
        }),
    ],
})
