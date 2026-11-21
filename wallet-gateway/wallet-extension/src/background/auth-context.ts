// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type AuthContext, jwtUserId } from '@canton-network/core-wallet-auth'

import { logger } from '@/shared/logger.ts'

import type { Vault } from './vault/index.ts'

/** The signed-in user's token and user ID. */
export interface AuthContextStore {
    /** Throws `VaultLockedError` while locked, as do the others. */
    store(token: string): Promise<void>
    /** `undefined` when nobody is signed in. */
    load(): Promise<AuthContext | undefined>
    clear(): Promise<void>
}

export interface AuthContextChanges {
    /** Called after every `store` and `clear`, with the new context. */
    onChange(listener: (context: AuthContext | undefined) => void): void
}

/**
 * Keeps the signed-in user's token and user ID in the vault item
 * `authContext`. It survives a service worker restart and a lock, so the
 * same user is signed in again after an unlock. A reset deletes it.
 */
export function createAuthContextStore(
    vault: Pick<Vault, 'defineItem'>
): AuthContextStore & AuthContextChanges {
    const item = vault.defineItem<AuthContext | null>('authContext', {
        fallback: null,
    })
    const listeners = new Set<(context: AuthContext | undefined) => void>()
    function changed(context: AuthContext | undefined) {
        for (const listener of listeners) {
            try {
                listener(context)
            } catch (error) {
                logger.error('Auth context listener failed: {error}', {
                    error,
                })
            }
        }
    }
    return {
        async store(token) {
            const userId = jwtUserId(token)
            logger.info('Storing auth context', { userId })
            const context = { userId, accessToken: token }
            await item.setValue(context)
            changed(context)
        },
        async load() {
            return (await item.getValue()) ?? undefined
        },
        async clear() {
            await item.removeValue()
            changed(undefined)
        },
        onChange(listener) {
            listeners.add(listener)
        },
    }
}
