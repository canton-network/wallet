// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    queryOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'
import type { VaultStatus } from '@/shared/vault-protocol'
import { queryKeys } from '@/ui/lib/query/keys'
import { getUserClient } from '@/ui/lib/user-client'
import type { AddSessionParams } from '@/background/controllers/user/rpc-gen/typings'

/**
 * The origin the extension pages connect as. popup.html and app.html share
 * it (`chrome-extension://<id>`), so both pages see the same session.
 */
export const EXTENSION_ORIGIN = location.origin

/** Every session of the signed-in user, dApp sessions included. */
export const sessionsQuery = () =>
    queryOptions({
        queryKey: queryKeys.sessions.list(),
        queryFn: async () => {
            const { sessions } = await getUserClient().request({
                method: 'listSessions',
            })
            return sessions
        },
        // Route guards act on this, so always ask the background.
        staleTime: 0,
    })

/**
 * The session, from the background. `staleTime: 0` makes
 * `fetchQuery` ask the background every time, so route guards never act on a
 * cached status.
 */
export const currentSessionQuery = () =>
    queryOptions({
        queryKey: queryKeys.sessions.list(),
        queryFn: async () => {
            const { sessions } = await getUserClient().request({
                method: 'listSessions',
            })
            return sessions
        },
    })

export function useConnect() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (params: AddSessionParams) =>
            getUserClient().request({
                method: 'addSession',
                params,
            }),
        onSuccess: () => {
            queryClient.setQueryData<VaultStatus>(
                queryKeys.vault.status(),
                'unlocked'
            )
        },
    })
}
