// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type AuthContext, jwtUserId } from '@canton-network/core-wallet-auth'
import { logger } from '@/shared/logger'

/** The signed-in user's token and user ID. */
export interface AuthContextStore {
    store(token: string): Promise<void>
    /** `undefined` when nobody is signed in. */
    load(): Promise<AuthContext | undefined>
    clear(): Promise<void>
}

/** Where the auth context is kept. */
interface AuthContextItem {
    getValue(): Promise<AuthContext | undefined>
    setValue(value: AuthContext): Promise<void>
    removeValue(): Promise<void>
}

/**
 * Keeps the signed-in user's token and user ID in `item`, so it survives a
 * service worker restart.
 */
export function createAuthContextStore(
    item: AuthContextItem
): AuthContextStore {
    return {
        async store(token) {
            // Never log the token.
            const userId = jwtUserId(token)
            logger.info('Storing auth context', { userId })
            await item.setValue({ userId, accessToken: token })
        },
        async load() {
            return await item.getValue()
        },
        async clear() {
            await item.removeValue()
        },
    }
}
