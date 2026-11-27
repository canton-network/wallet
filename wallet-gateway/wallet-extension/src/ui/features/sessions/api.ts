// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { tokenQueryKeys } from '@canton-network/core-wallet-ui-components/react/token'
import type { Session } from '@canton-network/core-wallet-user-rpc-client'
import {
    queryOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'

import {
    authMessenger,
    type ConnectionStatus,
    type ConnectRequest,
    EXTENSION_ORIGIN,
} from '@/shared/auth-protocol.ts'
import { queryKeys } from '@/ui/lib/query/keys.ts'
import { getUserClient } from '@/ui/lib/user-client.ts'

/**
 * Whether the extension pages are connected to a network, from the
 * background. Route guards act on it, so `staleTime: 0` makes `queryClient.query`
 * ask every time.
 */
export const connectionStatusQuery = () =>
    queryOptions({
        queryKey: queryKeys.sessions.status(),
        queryFn: () => authMessenger.sendMessage('auth.getStatus'),
        staleTime: 0,
    })

/**
 * Every session of the signed-in user, dApp sessions included. Rejects when
 * nobody is signed in, so only use it behind the `_connected` guard.
 */
export const sessionsQuery = () =>
    queryOptions({
        queryKey: queryKeys.sessions.list(),
        queryFn: async () =>
            (await getUserClient().request({ method: 'listSessions' }))
                .sessions,
    })

/** The extension's own session, or `null` when it isn't connected. */
export function findCurrentSession(sessions: Session[]): Session | null {
    return (
        sessions.find((session) => session.origin === EXTENSION_ORIGIN) ?? null
    )
}

/** The extension's own session. Shares the list's cache entry and fetch. */
export const currentSessionQuery = () =>
    queryOptions({ ...sessionsQuery(), select: findCurrentSession })

/**
 * Signs in to the network's identity provider and connects the extension
 * pages to it. `clientId` and `clientSecret` are for `self_signed` networks.
 * The background keeps the token.
 */
export function useConnect() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: ConnectRequest) =>
            authMessenger.sendMessage('auth.connect', data),
        onSuccess: async () => {
            queryClient.setQueryData<ConnectionStatus>(
                queryKeys.sessions.status(),
                'connected'
            )
            // if changing users or networks, then we dont want to keep the old wallet queries in the cache
            await queryClient.resetQueries({ queryKey: queryKeys.wallets.all })
            await queryClient.resetQueries({ queryKey: tokenQueryKeys.all })

            await queryClient.invalidateQueries({
                queryKey: queryKeys.sessions.list(),
            })
        },
    })
}
