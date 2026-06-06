// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LRUCache } from 'typescript-lru-cache'
import { ACSCache, ACSCacheOptions, PaginatedACSCache } from '../cache'
import { ACSKey } from '../../types'
import { PaginatedResolvedAcsOptions, ResolvedAcsOptions } from '../../service'
import { AbstractLedgerProvider } from '@canton-network/core-provider-ledger'
import { LedgerCommonSchemas } from '@canton-network/core-ledger-client-types'

export abstract class BaseCacheCollection<
    Cache extends ACSCache | PaginatedACSCache,
    Options extends ResolvedAcsOptions | PaginatedResolvedAcsOptions =
        Cache extends ACSCache
            ? ResolvedAcsOptions
            : PaginatedResolvedAcsOptions,
> {
    protected readonly collection: LRUCache<string, Cache>

    constructor(
        protected readonly ledger: AbstractLedgerProvider,
        private readonly options: ACSCacheOptions = {
            maxSize: 100,
            entryExpirationTimeInMS: 10 * 60 * 1000,
        }
    ) {
        this.collection = new LRUCache(options)
    }

    /**
     * Reads the active contract set from the ledger with caching.
     * Resolves party references and constructs cache keys from the provided template and interface IDs.
     * Queries are deduplicated and cached per party-template-interface combination.
     *
     * @see {@link ACSReader.readRaw}
     */
    public async readFromCache(
        options: Options
    ): Promise<LedgerCommonSchemas['JsGetActiveContractsResponse'][]> {
        const { parties, interfaceIds, templateIds } = options
        const keys: ACSKey[] =
            parties?.flatMap((party) => {
                const withTemplateIds =
                    templateIds?.map((templateId) => ({ party, templateId })) ??
                    []
                const withInterfaceIds =
                    interfaceIds?.map((interfaceId) => ({
                        party,
                        interfaceId,
                    })) ?? []
                return [...withInterfaceIds, ...withTemplateIds]
            }) ?? []

        return await this.query({ options, keys })
    }

    protected abstract createCache(): Cache

    protected getCache(key: ACSKey) {
        const serializedKey = this.serializeKey(key)
        const existingCache = this.collection.get(serializedKey)
        if (existingCache) return existingCache

        const newCache = this.createCache()
        this.collection.set(serializedKey, newCache)

        return newCache
    }

    /**
     * Updates the cached active contract set for a specific key and returns contracts at the requested offset.
     * If the cache is outdated, fetches updates from the ledger and applies them incrementally.
     */
    protected abstract updateCache(args: {
        options: Options
        key: ACSKey
    }): Promise<ReturnType<Cache['calculateAt']>>

    /**
     * Queries multiple cache keys in parallel and combines the results.
     * Each key represents a unique party-template-interface combination to be queried independently.
     */
    protected async query(args: {
        options: Options
        keys: ACSKey[]
    }): Promise<LedgerCommonSchemas['JsGetActiveContractsResponse'][]> {
        const { options, keys } = args
        return (
            await Promise.all(
                keys.map(
                    async (key) => await this.updateCache({ options, key })
                )
            )
        ).flat()
    }

    protected serializeKey(key: ACSKey): string {
        return `${key.party ?? 'ANY'}_T${key.templateId ?? '()'}_I${key.interfaceId ?? '()'}`
    }
}
