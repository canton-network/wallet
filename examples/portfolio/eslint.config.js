// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import config from '@canton-network/core-eslint-config'
import reactConfig from '@canton-network/core-eslint-config/react'
import { defineConfig } from 'eslint/config'

export default defineConfig([
    {
        files: ['**/*.{ts,tsx}'],
        extends: [config, reactConfig],
        ignores: ['playwright.config.ts', 'scripts/otc-trade.ts'],
    },
    {
        files: ['src/routes/**/*.{ts,tsx}'],
        rules: {
            'react-refresh/only-export-components': 'off',
        },
    },
])
