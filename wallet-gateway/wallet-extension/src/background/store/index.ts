// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SigningDriverStore } from '@canton-network/core-signing-lib'
import type { AuthAware } from '@canton-network/core-wallet-auth'
import type { Store } from '@canton-network/core-wallet-store'

import type { AuthContextStore } from '../auth-context.ts'
import type { Vault } from '../vault/index.ts'
import { createVaultSigningStore } from './signing-store.ts'

export { createWalletStore } from './wallet-store.ts'

/** The wallet store, with the extension's own writes. */
export interface ExtensionStore extends Store {
    /**
     * Deletes the transaction if it is still pending, within one write, so
     * no other write can sign it in between. Resolves whether it did.
     */
    removePendingTransaction(id: string): Promise<boolean>
}

export type WalletStore = ExtensionStore & AuthAware<ExtensionStore>

/** The wallet store, scoped to the signed-in user (if any). */
export async function loadAuthedStore(
    store: AuthAware<Store>,
    authContext: AuthContextStore
): Promise<Store> {
    return store.withAuthContext(await authContext.load())
}

export function createSigningStore(
    vault: Pick<Vault, 'defineItem'>
): SigningDriverStore {
    // Signing keys are stored for this browser profile and remain available
    // when the user logs out or signs in again.
    return createVaultSigningStore(vault)
}
