// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type PartyId } from '@canton-network/core-types'
import { type PortfolioRegistryConfig } from '@lib/schemas'
import { usePortfolioConfig } from '@contexts/PortfolioConfigContext'
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

// Build the best synchronous view we can from config alone. Registries without
// a partyId are skipped here because resolving their party requires a network call.
const configuredRegistriesWithPartyIdsToMap = (
    registries: PortfolioRegistryConfig[]
): ReadonlyMap<PartyId, string> => {
    return new Map(
        registries.flatMap((registry) =>
            registry.partyId ? [[registry.partyId, registry.url]] : []
        )
    )
}

const configuredRegistriesToMap = async (
    registries: PortfolioRegistryConfig[]
): Promise<ReadonlyMap<PartyId, string>> => {
    const settled = await Promise.allSettled(
        registries.map(async (registry): Promise<[PartyId, string]> => {
            if (registry.partyId) {
                return [registry.partyId, registry.url]
            }

            // Some config entries only know the registry URL. Ask the registry for
            // its metadata so we can key the map by its admin partyId.
            const adminId = await fetchRegistryAdminId(registry.url)

            return [adminId, registry.url]
        })
    )
    const entries = settled.flatMap((result, index) => {
        if (result.status === 'fulfilled') {
            return [result.value]
        }

        // Keep the usable registries even if one configured registry is down or
        // misconfigured; the UI can still operate with the remaining entries.
        console.warn(
            `Failed to resolve registry ${registries[index].url}:`,
            result.reason
        )
        return []
    })
    return new Map(entries)
}

const mergeRegistryUrls = (
    configured: ReadonlyMap<PartyId, string>,
    stored: ReadonlyMap<PartyId, string>
): ReadonlyMap<PartyId, string> => {
    // User-provided overrides win over config values.
    return new Map([...configured, ...stored])
}

const EMPTY: ReadonlyMap<PartyId, string> = new Map()

const fetchRegistryAdminId = async (url: string): Promise<PartyId> => {
    try {
        const client = await resolveTokenStandardClient({ registryUrl: url })
        const info = await client.get('/registry/metadata/v1/info')
        return info.adminId
    } catch {
        throw new Error(
            'Unable to read registry info. Check that the URL points to a reachable token registry.'
        )
    }
}

export const useRegistryUrls = (): ReadonlyMap<PartyId, string> => {
    const { amulet, token } = usePortfolioConfig()
    const configuredRegistryConfigs = useMemo(
        () => [{ url: amulet.registry }, ...token.registries],
        [amulet.registry, token.registries]
    )

    const readMergedRegistries = useCallback(async () => {
        const configuredRegistries = await configuredRegistriesToMap(
            configuredRegistryConfigs
        )
        return mergeRegistryUrls(configuredRegistries, readFromStorage())
    }, [configuredRegistryConfigs])

    const readInitialRegistries = useCallback(
        () =>
            mergeRegistryUrls(
                configuredRegistriesWithPartyIdsToMap(
                    configuredRegistryConfigs
                ),
                readFromStorage()
            ),
        [configuredRegistryConfigs]
    )

    const { data } = useQuery({
        queryKey: queryKeys.registries.all,
        queryFn: readMergedRegistries,
        // Show immediately known registries while the async query resolves party
        // party ids for config entries that only specify a URL.
        placeholderData: readInitialRegistries,
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
            const registryAdminId = await fetchRegistryAdminId(url)
            const resolvedParty = party ?? registryAdminId

            if (party && party !== registryAdminId) {
                throw new Error(
                    'Registry info is invalid: admin ID does not match the provided party ID'
                )
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
