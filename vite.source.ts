// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultClientConditions, type Plugin } from 'vite'

/**
 * Lets development builds and the dev server import workspace libraries from
 * their src/ (their `@canton-network/source` export condition), so they need
 * no build. Production builds and tests keep using the libraries' dist/.
 */
export function workspaceSources(): Plugin {
    return {
        name: 'workspace-sources',
        config: (_, { mode }) =>
            mode === 'development'
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
