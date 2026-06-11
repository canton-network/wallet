// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    AbstractLedgerProvider,
    Ops,
} from '@canton-network/core-provider-ledger'
import { SDKLogger } from '../../logger/logger.js'
import { ConnectedSynchronizersOptions } from './types.js'
import type { SDKContext } from '../../sdk.js'

/**
 * Resolves the synchronizer an operation should target: the explicit
 * `synchronizerId` when given, otherwise the global synchronizer as a fallback.
 *
 * Shared by the party / participant flows so they all fall back to (and fail
 * with) the same behaviour when no synchronizer is supplied.
 *
 * @throws When no `synchronizerId` is provided and no global synchronizer is
 * connected to fall back to.
 */
export const resolveSynchronizerIdOrGlobal = async (
    ctx: SDKContext,
    synchronizerId?: string
): Promise<string> => {
    const resolved =
        synchronizerId ??
        (await ctx.synchronizers.resolveGlobalSynchronizerId())
    if (!resolved) {
        ctx.error.throw({
            message:
                'No synchronizerId provided and no global synchronizer is connected to fall back to',
            type: 'SDKOperationUnsupported',
        })
    }
    return resolved
}

export type ConnectedSynchronizer = NonNullable<
    Ops.GetV2StateConnectedSynchronizers['ledgerApi']['result']['connectedSynchronizers']
>[number]

/**
 * A connected synchronizer plus the parties / participants / identity providers
 * it has been observed connected to.
 */
export type CachedSynchronizer = {
    synchronizerId: string
    synchronizerAlias: string
    parties: string[]
    participantIds: string[]
    identityProviderIds: string[]
}

/** Adds a value to a list if not already present. */
const addUnique = (list: string[], value: string): void => {
    if (!list.includes(value)) list.push(value)
}

/**
 * Whether a synchronizer satisfies the given query scope. A scope dimension that
 * is `undefined` matches anything; a defined dimension matches only when the
 * synchronizer was observed connected under that value.
 */
const matchesScope = (
    synchronizer: CachedSynchronizer,
    options?: ConnectedSynchronizersOptions
): boolean =>
    (options?.party === undefined ||
        synchronizer.parties.includes(options.party)) &&
    (options?.participantId === undefined ||
        synchronizer.participantIds.includes(options.participantId)) &&
    (options?.identityProviderId === undefined ||
        synchronizer.identityProviderIds.includes(options.identityProviderId))

/** Whether two query scopes target the same party / participant / idp. */
const sameScope = (
    a: ConnectedSynchronizersOptions,
    b: ConnectedSynchronizersOptions
): boolean =>
    a.party === b.party &&
    a.participantId === b.participantId &&
    a.identityProviderId === b.identityProviderId

/**
 * Caches the synchronizers connected to the participant so the SDK reads them
 * from the Ledger API only once (at initialization) instead of on every call.
 *
 * Entries are keyed by `synchronizerId` — a synchronizer shared by several parties
 * is a single entry whose membership lists (`parties`, `participantIds`,
 * `identityProviderIds`) record every scope it was seen under. A read is a
 * `filter` over the entries by {@link matchesScope}. The set of scopes already
 * fetched is tracked separately so an empty result is still treated as a cache
 * hit (we don't re-query a scope that is genuinely empty). The cache is kept
 * current via {@link refresh} (rebuild every scope seen so far) and {@link add}
 * (merge a newly connected synchronizer) — callers update it when they connect
 * to, or host a party on, a new synchronizer.
 */
export class SynchronizerCache {
    private cache = new Map<string, CachedSynchronizer>()
    private fetchedScopes: ConnectedSynchronizersOptions[] = []

    constructor(
        private readonly ledgerProvider: AbstractLedgerProvider,
        private readonly logger: SDKLogger
    ) {}

    /**
     * Merges a synchronizer returned by the Ledger API into its entry, recording
     * the scope it was fetched under in the entry's membership lists.
     */
    private addOrUpdate(
        synchronizer: ConnectedSynchronizer,
        options?: ConnectedSynchronizersOptions
    ): void {
        const entry = this.cache.get(synchronizer.synchronizerId) ?? {
            synchronizerId: synchronizer.synchronizerId,
            synchronizerAlias: synchronizer.synchronizerAlias,
            parties: [],
            participantIds: [],
            identityProviderIds: [],
        }
        entry.synchronizerAlias = synchronizer.synchronizerAlias
        if (options?.party !== undefined)
            addUnique(entry.parties, options.party)
        if (options?.participantId !== undefined)
            addUnique(entry.participantIds, options.participantId)
        if (options?.identityProviderId !== undefined)
            addUnique(entry.identityProviderIds, options.identityProviderId)
        this.cache.set(synchronizer.synchronizerId, entry)
    }

    /** The cached synchronizers matching the given scope. */
    private matching(
        options?: ConnectedSynchronizersOptions
    ): CachedSynchronizer[] {
        return [...this.cache.values()].filter((s) => matchesScope(s, options))
    }

    /** Whether the given scope has already been fetched from the Ledger API. */
    private isScopeFetched(options?: ConnectedSynchronizersOptions): boolean {
        return this.fetchedScopes.some((s) => sameScope(s, options ?? {}))
    }

    /** Records that the given scope has been fetched. */
    private markFetched(options?: ConnectedSynchronizersOptions): void {
        if (!this.isScopeFetched(options)) {
            this.fetchedScopes.push({
                ...(options?.party !== undefined && { party: options.party }),
                ...(options?.participantId !== undefined && {
                    participantId: options.participantId,
                }),
                ...(options?.identityProviderId !== undefined && {
                    identityProviderId: options.identityProviderId,
                }),
            })
        }
    }

    /**
     * Fetches a scope's synchronizers from the Ledger API, merges each into its
     * entry, and marks the scope fetched.
     */
    private async fetch(
        options?: ConnectedSynchronizersOptions
    ): Promise<CachedSynchronizer[]> {
        this.logger.debug({ options }, 'Fetching connected synchronizers')
        const response =
            await this.ledgerProvider.request<Ops.GetV2StateConnectedSynchronizers>(
                {
                    method: 'ledgerApi',
                    params: {
                        resource: '/v2/state/connected-synchronizers',
                        requestMethod: 'get',
                        query: {
                            ...(options?.party !== undefined && {
                                party: options.party,
                            }),
                            ...(options?.participantId !== undefined && {
                                participantId: options.participantId,
                            }),
                            ...(options?.identityProviderId !== undefined && {
                                identityProviderId: options.identityProviderId,
                            }),
                        },
                    },
                }
            )
        for (const synchronizer of response.connectedSynchronizers ?? []) {
            this.addOrUpdate(synchronizer, options)
        }
        this.markFetched(options)
        return this.matching(options)
    }

    /**
     * Returns the synchronizers for the given scope, fetching from the Ledger
     * API on the first request for that scope (or when `refresh` is set) and
     * serving subsequent requests from the cache.
     */
    public async list(
        options?: ConnectedSynchronizersOptions,
        extraOptions?: { refresh?: boolean }
    ): Promise<CachedSynchronizer[]> {
        if (extraOptions?.refresh || !this.isScopeFetched(options)) {
            return this.fetch(options)
        }
        return this.matching(options)
    }

    /**
     * Resolves the ID of the synchronizer aliased `'global'` from the cache,
     * re-fetching once if it is not yet present (in case a synchronizer was
     * connected after the SDK was initialized). Returns `undefined` when no
     * global synchronizer is connected
     *
     */
    public async resolveGlobalSynchronizerId(
        options?: ConnectedSynchronizersOptions
    ): Promise<string | undefined> {
        const findGlobal = (synchronizers: CachedSynchronizer[]) =>
            synchronizers.find((s) => s.synchronizerAlias === 'global')

        let global = findGlobal(await this.list(options))
        if (!global) {
            global = findGlobal(await this.list(options, { refresh: true }))
        }
        return global?.synchronizerId
    }

    /**
     * Rebuilds the cache by re-fetching every scope queried so far from the
     * Ledger API.
     */
    public async refresh(): Promise<void> {
        const scopes = this.fetchedScopes
        this.cache = new Map()
        this.fetchedScopes = []
        await Promise.all(scopes.map((scope) => this.fetch(scope)))
    }

    /**
     * Adds already-known connected synchronizers to the cache
     */
    public add(...synchronizers: ConnectedSynchronizer[]): void {
        for (const synchronizer of synchronizers) {
            this.addOrUpdate(synchronizer)
        }
    }

    /**
     * Records that the given scope (a party and/or participant) is now connected
     * to a synchronizer, updating its membership lists in place.
     *
     * The scope is also marked fetched so a subsequent `list(scope)` is served
     * from the cache. If the synchronizer is not yet cached, an entry is created;
     * pass `synchronizerAlias` when it is known (e.g. for global-synchronizer
     * resolution).
     */
    public connect(
        synchronizerId: string,
        scope: ConnectedSynchronizersOptions,
        synchronizerAlias?: string
    ): void {
        const entry = this.cache.get(synchronizerId) ?? {
            synchronizerId,
            synchronizerAlias: synchronizerAlias ?? '',
            parties: [],
            participantIds: [],
            identityProviderIds: [],
        }
        if (synchronizerAlias !== undefined) {
            entry.synchronizerAlias = synchronizerAlias
        }
        if (scope.party !== undefined) addUnique(entry.parties, scope.party)
        if (scope.participantId !== undefined)
            addUnique(entry.participantIds, scope.participantId)
        if (scope.identityProviderId !== undefined)
            addUnique(entry.identityProviderIds, scope.identityProviderId)
        this.cache.set(synchronizerId, entry)
        this.markFetched(scope)
    }
}
