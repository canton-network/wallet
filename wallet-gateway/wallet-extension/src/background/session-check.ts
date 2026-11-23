// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { jwtExpired } from '@canton-network/core-wallet-auth'
import type { Store } from '@canton-network/core-wallet-store'

import type { AuthContextStore } from './auth-context.ts'
import { VaultLockedError } from './vault/index.ts'

/**
 * Whether `accessToken` is the signed-in user's, unexpired and has a session,
 * with the ID `sessionId` if given. The same rule as the auth service's
 * `getStatus`: an expired token counts as signed out.
 */
export type SessionCheck = (
    accessToken: string,
    sessionId?: string
) => Promise<boolean>

export function currentSessionCheck(
    getStore: () => Promise<Pick<Store, 'getSession'>>,
    authContext: Pick<AuthContextStore, 'load'>
): SessionCheck {
    return async (accessToken, sessionId) => {
        try {
            const context = await authContext.load()
            if (context?.accessToken !== accessToken) return false
            if (jwtExpired(accessToken)) return false
            const store = await getStore()
            const session = await store.getSession(accessToken)
            return (
                session !== undefined &&
                (sessionId === undefined || session.id === sessionId)
            )
        } catch (error) {
            if (error instanceof VaultLockedError) return false
            throw error
        }
    }
}
