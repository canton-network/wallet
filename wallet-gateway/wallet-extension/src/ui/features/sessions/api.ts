// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Session } from '@canton-network/core-wallet-user-rpc-client'
import {
    queryOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'
import {
    authMessenger,
    type ConnectionStatus,
    EXTENSION_ORIGIN,
} from '@/shared/auth-protocol'
import { queryKeys } from '@/ui/lib/query/keys'
import { getUserClient } from '@/ui/lib/user-client'

/**
 * Whether the extension pages are connected to a network, from the
 * background. Route guards act on it, so `staleTime: 0` makes `fetchQuery`
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
 * pages to it. The background keeps the token.
 */
export function useConnect() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (networkId: string) =>
            authMessenger.sendMessage('auth.connect', { networkId }),
        onSuccess: async () => {
            queryClient.setQueryData<ConnectionStatus>(
                queryKeys.sessions.status(),
                'connected'
            )
            await queryClient.invalidateQueries({
                queryKey: queryKeys.sessions.list(),
            })
        },
    })
}
