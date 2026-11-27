// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type AuthContext, jwtUserId } from '@canton-network/core-wallet-auth'

import { logger } from '@/shared/logger.ts'

import type { Vault } from './vault/index.ts'

/**
 * The signed-in user, plus the configured identity provider they signed in
 * through. Contexts stored before the provider was recorded lack it.
 */
export type SignedInContext = AuthContext & { identityProviderId?: string }

/** The signed-in user's token, user ID and identity provider. */
export interface AuthContextStore {
    /**
     * Throws `VaultLockedError` while locked, as do the others. The provider
     * is only undefined when restoring a context stored without one.
     */
    store(token: string, identityProviderId: string | undefined): Promise<void>
    /** `undefined` when nobody is signed in. */
    load(): Promise<SignedInContext | undefined>
    clear(): Promise<void>
}

export interface AuthContextChanges {
    /** Called after every `store` and `clear`, with the new context. */
    onChange(listener: (context: SignedInContext | undefined) => void): void
}

/**
 * Keeps the signed-in user's context in the vault item
 * `authContext`. It survives a service worker restart and a lock, so the
 * same user is signed in again after an unlock. A reset deletes it.
 */
export function createAuthContextStore(
    vault: Pick<Vault, 'defineItem'>
): AuthContextStore & AuthContextChanges {
    const item = vault.defineItem<SignedInContext | null>('authContext', {
        fallback: null,
    })
    const listeners = new Set<(context: SignedInContext | undefined) => void>()
    function changed(context: SignedInContext | undefined) {
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
        async store(token, identityProviderId) {
            const userId = jwtUserId(token)
            logger.info('Storing auth context', { userId, identityProviderId })
            const context = { userId, accessToken: token, identityProviderId }
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
