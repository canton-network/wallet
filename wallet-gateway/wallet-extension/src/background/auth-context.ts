// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type AuthContext, jwtUserId } from '@canton-network/core-wallet-auth'
import { logger } from '@/shared/logger'
import type { Vault } from './vault'

/** The signed-in user's token and user ID. */
export interface AuthContextStore {
    /** Throws `VaultLockedError` while locked, as do the others. */
    store(token: string): Promise<void>
    /** `undefined` when nobody is signed in. */
    load(): Promise<AuthContext | undefined>
    clear(): Promise<void>
}

/**
 * Keeps the signed-in user's token and user ID in the vault item
 * `authContext`. It survives a service worker restart and a lock, so the
 * same user is signed in again after an unlock. A reset deletes it.
 */
export function createAuthContextStore(
    vault: Pick<Vault, 'defineItem'>
): AuthContextStore {
    const item = vault.defineItem<AuthContext | null>('authContext', {
        fallback: null,
    })
    return {
        async store(token) {
            const userId = jwtUserId(token)
            logger.info('Storing auth context', { userId })
            await item.setValue({ userId, accessToken: token })
        },
        async load() {
            return (await item.getValue()) ?? undefined
        },
        async clear() {
            await item.removeValue()
        },
    }
}
