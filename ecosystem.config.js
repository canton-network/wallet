// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const sharedEnvDevelopment = {
    NODE_ENV: 'development',
    DEBUG: 'true',
}

export const apps = [
    {
        name: 'remote',
        script: 'pnpm --filter @canton-network/wallet-gateway-remote dev',
        env_development: sharedEnvDevelopment,
    },
    {
        name: 'mock-oauth2-server',
        script: 'pnpm --filter @canton-network/mock-oauth2 dev',
        env_development: sharedEnvDevelopment,
    },
    {
        name: 'example-ping',
        script: 'pnpm --filter @canton-network/example-ping dev',
        env_development: sharedEnvDevelopment,
    },
    {
        name: 'example-portfolio',
        script: 'pnpm --filter @canton-network/example-portfolio dev',
        env_development: sharedEnvDevelopment,
    },
    {
        name: 'dev-libs',
        script: 'pnpm exec tsdown -c tsdown.dev.ts --watch',
        env_development: sharedEnvDevelopment,
        // Exits on an invalid package.json or tsdown config, e.g. while editing
        exp_backoff_restart_delay: 100,
    },
    {
        name: 'core-wallet-ui-components',
        script: 'pnpm --filter @canton-network/core-wallet-ui-components build:watch',
        env_development: sharedEnvDevelopment,
    },
    {
        name: 'core-wallet-ui-components-sb',
        script: 'pnpm --filter @canton-network/core-wallet-ui-components dev',
        env_development: sharedEnvDevelopment,
    },
]
