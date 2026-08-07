// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { UserConfig } from 'tsdown'

export const base: UserConfig = {
    format: ['esm', 'cjs'],
    outDir: 'dist',
    sourcemap: true,
    clean: true,
    treeshake: true,
    target: 'es2020',
    platform: 'neutral',
    dts: false,
    outExtensions: ({ format }) => ({ js: format === 'cjs' ? '.cjs' : '.js' }),
}
