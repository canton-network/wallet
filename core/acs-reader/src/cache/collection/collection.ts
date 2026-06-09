// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { BaseCacheCollection } from './base'
import { ACSCache, PaginatedACSCache } from '../item'

export class ACSCacheCollection extends BaseCacheCollection<ACSCache> {
    protected createCache(): ACSCache {
        return new ACSCache(this.ledger)
    }
}

export class PaginatedACSCacheCollection extends BaseCacheCollection<PaginatedACSCache> {
    protected createCache(): PaginatedACSCache {
        return new PaginatedACSCache(this.ledger)
    }
}
