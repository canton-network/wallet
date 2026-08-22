// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthContext, jwtUserId } from '@canton-network/core-wallet-auth'

function getItem() {
    return storage.defineItem<AuthContext | undefined>('local:authContext', {
        fallback: undefined,
    })
}

export const AuthService = {
    storeAuthContext: async (token: string): Promise<void> => {
        const userId = jwtUserId(token)
        const context: AuthContext = {
            userId: userId,
            accessToken: token,
        }

        logger.info('Storing auth context', { userId })

        await getItem().setValue(context)
    },
    loadAuthContext: async (): Promise<AuthContext | undefined> => {
        return await getItem().getValue()
    },
    clearAuthContext: async (): Promise<void> => {
        await getItem().removeValue()
    },
}
