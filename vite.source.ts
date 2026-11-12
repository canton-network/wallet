// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultClientConditions, type Plugin } from 'vite'

/**
 * Lets the dev server import workspace libraries from their src/ (their
 * `@canton-network/source` export condition), so they need no build. Builds
 * keep using the libraries' dist/.
 */
export function workspaceSources(): Plugin {
    return {
        name: 'workspace-sources',
        config: (_, { command }) =>
            command === 'serve'
                ? {
                      resolve: {
                          conditions: [
                              '@canton-network/source',
                              ...defaultClientConditions,
                          ],
                      },
                  }
                : undefined,
    }
}
