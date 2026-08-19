// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'eslint/config'
import config from '@canton-network/core-eslint-config'

export default defineConfig([
    {
        files: ['**/*.{ts,tsx}'],
        extends: [config],
        ignores: ['.output/**', '.wxt/**'],
    },
])
