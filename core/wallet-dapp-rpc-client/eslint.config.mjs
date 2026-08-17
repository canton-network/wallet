// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import config from '@canton-network/core-eslint-config'
import { defineConfig } from 'eslint/config'

export default defineConfig([
    { ignores: ['docs/**'] },
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            'headers/header-format': 'off',
        },
    },
    {
        files: ['src/**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_' },
            ],
        },
    },
])
