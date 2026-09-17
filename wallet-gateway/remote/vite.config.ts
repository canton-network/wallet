// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'vite'
import { resolve } from 'path'
import { resolveRouteInputs } from './src/web/route-inputs.js'
import { standardDecorators } from '../../vite.decorators.js'

const frontendRoot = resolve(import.meta.dirname, 'src/web/frontend')

export default defineConfig({
    root: 'src/web/frontend',
    plugins: [standardDecorators(resolve(frontendRoot, '**/*.ts'))],
    // Relative base for regular build, absolute for dev
    // Vite doesn't support relative base in dev mode
    // dev mode does both build and later serve, hence relying on env var instead of command
    base: process.env.NODE_ENV === 'development' ? '/' : './',
    build: {
        outDir: resolve(import.meta.dirname, './dist/web/frontend'),
        emptyOutDir: true,
        rolldownOptions: {
            input: resolveRouteInputs(frontendRoot),
        },
    },
})
