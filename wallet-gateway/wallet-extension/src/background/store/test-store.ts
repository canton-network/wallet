// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AuthContext } from '@canton-network/core-wallet-auth'
import { StoreInternal } from '@canton-network/core-wallet-store-inmemory'

import { logger } from '@/shared/logger.ts'

import { defaultConfig } from './default-config.ts'
import type { WalletStore } from './index.ts'
import { persistent } from './persistent-store.ts'

/**
 * For tests: an in-memory store with the default config, not kept in the
 * vault, scoped to `context` (if any). Its writes run one at a time, as in
 * the vault's store.
 */
export function createTestWalletStore(context?: AuthContext): WalletStore {
    let writes: Promise<unknown> = Promise.resolve()
    return persistent(new StoreInternal(defaultConfig(), logger, context), {
        assertOpen() {},
        write(change) {
            const result = writes.then(change)
            writes = result.catch(() => undefined)
            return result
        },
    })
}
