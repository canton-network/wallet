// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createConfig } from '@canton-network/core-eslint-config'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '../..')

export default [
    ...createConfig({ rootDir }),
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            'headers/header-format': 'off',
        },
    },
]
