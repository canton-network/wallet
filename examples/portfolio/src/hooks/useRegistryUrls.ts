// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type PartyId } from '@canton-network/core-types'
import { resolveTokenStandardClient } from '@services/resolve'
import { queryKeys } from '@hooks/query-keys'

const STORAGE_KEY = 'registries'

const readFromStorage = (): ReadonlyMap<PartyId, string> => {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw
        ? new Map(Object.entries(JSON.parse(raw) as Record<string, string>))
        : new Map()
}

const writeToStorage = (next: ReadonlyMap<PartyId, string>): void => {
    window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Object.fromEntries(next))
    )
}

const EMPTY: ReadonlyMap<PartyId, string> = new Map()

export const useRegistryUrls = (): ReadonlyMap<PartyId, string> => {
    const { data } = useQuery({
        queryKey: queryKeys.registries.all,
        queryFn: readFromStorage,
        initialData: readFromStorage,
        staleTime: Infinity,
        gcTime: Infinity,
    })
    return data ?? EMPTY
}

export const useRegistryMutations = () => {
    const queryClient = useQueryClient()

    const setRegistryUrl = useMutation({
        mutationFn: async ({
            party,
            url,
        }: {
            party?: PartyId
            url: string
        }) => {
            let resolvedParty = party
            if (!resolvedParty) {
                const client = await resolveTokenStandardClient({
                    registryUrl: url,
                })
                const info = await client.get('/registry/metadata/v1/info')
                resolvedParty = info.adminId
            }
            const current =
                queryClient.getQueryData<ReadonlyMap<PartyId, string>>(
                    queryKeys.registries.all
                ) ?? readFromStorage()
            const next = new Map(current)
            next.set(resolvedParty, url)
            writeToStorage(next)
            queryClient.setQueryData(queryKeys.registries.all, next)
        },
    })

    const deleteRegistryUrl = useCallback(
        (party: PartyId) => {
            const current =
                queryClient.getQueryData<ReadonlyMap<PartyId, string>>(
                    queryKeys.registries.all
                ) ?? readFromStorage()
            const next = new Map(current)
            next.delete(party)
            writeToStorage(next)
            queryClient.setQueryData(queryKeys.registries.all, next)
        },
        [queryClient]
    )

    return { setRegistryUrl, deleteRegistryUrl }
}
