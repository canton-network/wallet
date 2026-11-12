// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { workspaceSources } from '../../vite.source.js'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), workspaceSources()],
    server: {
        port: 8080,
    },
    // e2e (and the CI job) hit this app on 8080 whether it is served from the
    // dev server or from the build.
    preview: {
        port: 8080,
    },
})
