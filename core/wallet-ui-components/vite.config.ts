// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isAbsolute, resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { standardDecorators } from '../../vite.decorators.js'

export default defineConfig({
    build: {
        emptyOutDir: false,
        lib: {
            entry: {
                index: 'src/index.ts',
                'react/index': 'src/react/index.ts',
                'logic/index': 'src/logic/index.ts',
            },
            formats: ['es', 'cjs'],
            fileName: (format, entryName) =>
                `${entryName}.${format === 'cjs' ? 'cjs' : 'js'}`,
            cssFileName: 'index',
        },
        rolldownOptions: {
            // Leaves every package import to the consumer, so that classes like JsonRpcError exist only once and
            // `instanceof` works across packages while stylesheets stay bundled.
            external: (id) =>
                !id.startsWith('.') &&
                !isAbsolute(id) &&
                !/\.css($|\?)/.test(id),
            output: {
                exports: 'auto',
            },
        },
        sourcemap: true,
    },
    plugins: [
        standardDecorators(resolve(import.meta.dirname, 'src/**/*.ts')),
        dts({ tsconfigPath: './tsconfig.publish.json' }),
    ],
})
