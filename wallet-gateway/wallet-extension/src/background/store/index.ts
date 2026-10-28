// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SigningDriverStore } from '@canton-network/core-signing-lib'
import { WxtStore } from '@canton-network/core-signing-store-wxt'
import type { AuthAware } from '@canton-network/core-wallet-auth'
import type { Store } from '@canton-network/core-wallet-store'
import type { AuthContextStore } from '../auth-context'

export { createWalletStore } from './wallet-store'

export type WalletStore = Store & AuthAware<Store>

/** The wallet store, scoped to the signed-in user (if any). */
export async function loadAuthedStore(
    store: WalletStore,
    authContext: Pick<AuthContextStore, 'load'>
): Promise<Store> {
    return store.withAuthContext(await authContext.load())
}

export function createSigningStore(): SigningDriverStore {
    // Signing keys are stored for this browser profile and remain available
    // when the user logs out or signs in again.
    return new WxtStore('extension-user')
}
