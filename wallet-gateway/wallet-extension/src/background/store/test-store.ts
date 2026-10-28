// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AuthContext } from '@canton-network/core-wallet-auth'
import { StoreInternal } from '@canton-network/core-wallet-store-inmemory'
import { logger } from '@/shared/logger'
import { defaultConfig } from './default-config'
import type { WalletStore } from './index'

/**
 * For tests: a plain in-memory store with the default config, not kept in
 * the vault, scoped to `context` (if any).
 */
export function createTestWalletStore(context?: AuthContext): WalletStore {
    return new StoreInternal(defaultConfig(), logger, context)
}
