// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// No NODE_ENV=development: everything here serves the build from the CI build
// job. In development the gateway and the dApps would serve their UI from the
// Vite dev server, so every page the e2e tests open would load hundreds of
// unbundled modules that Vite transforms on demand.
export const apps = [
    {
        name: 'remote',
        script: 'pnpm --filter @canton-network/wallet-gateway-remote start',
    },
    {
        name: 'mock-oauth2-server',
        script: 'pnpm --filter @canton-network/mock-oauth2 start',
    },
    {
        name: 'example-ping',
        script: 'pnpm --filter @canton-network/example-ping preview',
    },
    {
        name: 'example-portfolio',
        script: 'pnpm --filter @canton-network/example-portfolio preview',
    },
]
