// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ACSKey } from '../../types'
import { PaginatedResolvedAcsOptions, ResolvedAcsOptions } from '../../service'
import { BaseCacheCollection } from './base'
import { ACSCache, PaginatedACSCache } from '../item'

export class ACSCacheCollection extends BaseCacheCollection<ACSCache> {
    protected async updateCache(args: {
        options: ResolvedAcsOptions
        key: ACSKey
    }) {
        const cache = this.getCache(args.key)
        await cache.update(args.options)
        return await cache.calculateAt(args.options.offset)
    }

    protected createCache(): ACSCache {
        return new ACSCache(this.ledger)
    }
}

export class PaginatedACSCacheCollection extends BaseCacheCollection<PaginatedACSCache> {
    // TODO: avoid logic duplication
    protected async updateCache(args: {
        options: PaginatedResolvedAcsOptions
        key: ACSKey
    }) {
        const cache = this.getCache(args.key)
        await cache.update(args.options)
        return await cache.calculateAt(args.options.offset)
    }

    protected createCache(): PaginatedACSCache {
        return new PaginatedACSCache(this.ledger)
    }
}
