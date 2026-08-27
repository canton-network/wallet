// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: [],
    manifest: {
        name: 'Canton Wallet',
        description: 'Canton Wallet Extension',
        permissions: [
            'identity',
            'storage',
            'tabs',
            'webRequest',
            'webRequestBlocking',
        ],
    },
})
