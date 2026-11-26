// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
    stories: ['../src/react/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-vitest', '@storybook/addon-a11y'],
    framework: {
        name: '@storybook/react-vite',
        options: {
            builder: {
                viteConfigPath: 'vite.config.js',
            },
        },
    },
}

export default config
