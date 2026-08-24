// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
    {
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                allowDefaultProject: true,
            },
        },
        rules: {
            'headers/header-format': 'off',
            ...reactHooks.configs.recommended.rules,
            '@typescript-eslint/no-floating-promises': 'warn',
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
        },
    },
]
