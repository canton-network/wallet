// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SigningDriverStore } from '@canton-network/core-signing-lib'
import { WxtStore } from '@canton-network/core-signing-store-wxt'
import type { AuthAware } from '@canton-network/core-wallet-auth'
import type { Store } from '@canton-network/core-wallet-store'
import { StoreInternal } from '@canton-network/core-wallet-store-inmemory'
import { logger } from '@/shared/logger'
import { authContext } from '../auth-context'
import { defaultConfig } from './default-config'

export type WalletStore = Store & AuthAware<Store>

/** The wallet store, scoped to the signed-in user (if any). */
export async function loadAuthedStore(store: WalletStore): Promise<Store> {
    return store.withAuthContext(await authContext.load())
}

export async function initializeWalletStore(): Promise<WalletStore> {
    return new StoreInternal(defaultConfig(), logger, await authContext.load())
}

export function initializeSigningStore(): SigningDriverStore {
    // Signing keys are stored for this browser profile and remain available
    // when the user logs out or signs in again.
    return new WxtStore('extension-user')
}
