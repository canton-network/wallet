// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'tsup'
import { base } from '../../tsup.base'

export default defineConfig({
    ...base,
    entry: ['src/index.ts'],

    // Overrides to support top-level await
    target: 'es2022',
    outExtension: () => ({ js: '.js' }),
    format: 'esm',
})
