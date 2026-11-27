// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PartyId } from '@canton-network/core-types'
import type {
    RegistryInstrument,
    RegistryInstrumentsByAdmin,
} from '@canton-network/core-wallet-ui-components/react/token'
import { queryKeys } from '@hooks/query-keys'
import { resolveRegistryClient } from '@lib/registry-client'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { type Instrument, toRegistryInstrument } from '../types/instruments.ts'
import { useRegistryUrls } from './useRegistryUrls.ts'

const fetchAllInstruments = async (url: string): Promise<Instrument[]> => {
    const client = resolveRegistryClient(url)
    const collected: Instrument[] = []
    let page = await client.get('/registry/metadata/v1/instruments')
    collected.push(...page.instruments)

    while (page.nextPageToken) {
        page = await client.get('/registry/metadata/v1/instruments', {
            query: { pageToken: page.nextPageToken },
        })
        collected.push(...page.instruments)
    }
    return collected
}

export const fetchRegistryInstruments = async (
    admin: PartyId,
    registryUrl: string
): Promise<RegistryInstrument[]> =>
    (await fetchAllInstruments(registryUrl)).map((instrument) =>
        toRegistryInstrument({ instrument, admin, registryUrl })
    )

export const useInstruments = (): RegistryInstrumentsByAdmin => {
    const registryUrls = useRegistryUrls()
    const entries = useMemo(
        () => Array.from(registryUrls.entries()),
        [registryUrls]
    )

    const queries = useQueries({
        queries: entries.map(([party, url]) => ({
            queryKey: queryKeys.instruments.forRegistry(party, url),
            queryFn: () => fetchRegistryInstruments(party, url),
            staleTime: Infinity,
        })),
    })

    return useMemo(() => {
        const map = new Map<PartyId, RegistryInstrument[]>()
        entries.forEach(([party], index) => {
            const data = queries[index]?.data
            if (data) map.set(party, data)
        })
        return map
    }, [entries, queries])
}
