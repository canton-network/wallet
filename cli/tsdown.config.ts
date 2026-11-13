// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'tsdown'
import { base } from '../tsdown.base.ts'

export default defineConfig({
    ...base,
    entry: { wallet: 'src/index.ts' },
    format: 'esm',
    platform: 'node',
    target: 'node24',
    // Extensionless output (dist/wallet). tsdown makes it executable (chmod 755)
    // because the entry starts with a shebang.
    outExtensions: () => ({ js: '' }),
})
