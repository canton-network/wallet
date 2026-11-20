// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolve } from 'path'

import { defineConfig } from 'vite'

import { standardDecorators } from '../../vite.decorators.ts'
import { resolveRouteInputs } from './src/web/route-inputs.ts'

const frontendRoot = resolve(import.meta.dirname, 'src/web/frontend')

export default defineConfig({
    root: 'src/web/frontend',
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
    plugins: [standardDecorators(resolve(frontendRoot, '**/*.ts'))],
    resolve: {
        alias: {
            // Subpath entries must come before a package alias, which would turn
            // the suffix into a path inside the package directory.
            '@canton-network/core-wallet-services/clear-signing': resolve(
                import.meta.dirname,
                '../../core/wallet-services/dist/clear-signing/index.js'
            ),
            '@canton-network/core-wallet-ui-components/logic': resolve(
                import.meta.dirname,
                '../../core/wallet-ui-components/dist/logic/index.js'
            ),
            '@canton-network/core-wallet-ui-components': resolve(
                import.meta.dirname,
                '../../core/wallet-ui-components'
            ),
            '@canton-network/core-wallet-user-rpc-client': resolve(
                import.meta.dirname,
                '../../core/wallet-user-rpc-client'
            ),
        },
    },
})
