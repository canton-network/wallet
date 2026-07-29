// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import { includeIgnoreFile } from '@eslint/compat'
import { join } from 'node:path'
import headers from 'eslint-plugin-headers'
import nxeslint from '@nx/eslint-plugin'

/**
 * Shared ESLint flat config for the monorepo.
 * @param {{ rootDir: string }} options
 */
export function createConfig({ rootDir }) {
    const gitignorePath = join(rootDir, '.gitignore')
    const headerFilePath = join(rootDir, 'header.txt')

    return defineConfig([
        includeIgnoreFile(gitignorePath),
        {
            ignores: [
                '**/dist',
                '**/build',
                '**/_proto',
                '**/.venv',
                '**/vite-env.d.ts',
                '.yarn/**',
                '.commitlintrc.js',
                '.pnp.*',
                'core/wallet-dapp-rpc-client',
                'core/wallet-dapp-remote-rpc-client',
                'core/wallet-user-rpc-client',
                'core/ledger-client/src/generated-clients',
                'core/ledger-client-types/src/generated-clients',
                'damljs/**',
                'docs/wallet-integration-guide/examples/**',
                'examples/ping/playwright-report/**',
                'examples/test-token-v1-registry/src/openapi-ts/**',
                'core/rpc-generator/templates/client/typescript/src/index.ts',
            ],
        },
        {
            files: ['**/*.{js,mjs,cjs,ts,tsx,mts,cts}'],
            languageOptions: {
                parserOptions: {
                    tsconfigRootDir: rootDir,
                },
                globals: { ...globals.browser, ...globals.node },
            },
            extends: ['js/recommended'],
            plugins: { js, headers },
            rules: {
                'headers/header-format': [
                    'error',
                    {
                        source: 'file',
                        path: headerFilePath,
                        style: 'line',
                        trailingNewlines: 2,
                        variables: {
                            year: `${new Date().getFullYear()}`,
                        },
                    },
                ],
            },
        },
        tseslint.configs.recommended,
        {
            files: ['**/*.{js,mjs,cjs,ts,tsx,mts,cts}'],
            languageOptions: {
                parserOptions: {
                    tsconfigRootDir: rootDir,
                },
            },
            plugins: { '@nx': nxeslint },
        },
    ])
}
