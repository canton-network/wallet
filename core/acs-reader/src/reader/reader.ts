// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AbstractLedgerProvider } from '@canton-network/core-provider-ledger'
import { AcsOptions, PaginatedAcsOptions } from '../service'
import { BaseReader } from './base'
import {
    ACSCacheCollection,
    ACSCacheCollectionOptions,
    PaginatedACSCacheCollection,
} from '../cache/collection'
import { LedgerCommonSchemas } from '@canton-network/core-ledger-client-types'

function isPageResponse(
    obj: unknown
): obj is LedgerCommonSchemas['JsGetActiveContractsPageResponse'] {
    return typeof obj === 'object' && obj !== null && 'activeContracts' in obj
}

class RawReader extends BaseReader<AcsOptions> {
    constructor(
        protected readonly ledger: AbstractLedgerProvider,
        protected readonly cacheOptions?: ACSCacheCollectionOptions,
        private readonly paginated?: boolean
    ) {
        super(ledger, cacheOptions)
    }

    public async read(
        options: AcsOptions
    ): Promise<LedgerCommonSchemas['JsGetActiveContractsResponse'][]> {
        const resolvedOptions = await this.resolveAcsOptions(options)
        const output = await (this.paginated
            ? this.service.getPaginatedActiveContracts(resolvedOptions)
            : this.service.getActiveContracts(resolvedOptions))

        if (!Array.isArray(output)) {
            return isPageResponse(output) ? output.activeContracts : []
        }

        const first = output[0]
        return first && isPageResponse(first)
            ? output.flatMap((page) =>
                  isPageResponse(page) ? page.activeContracts : []
              )
            : output
    }

    protected createCacheCollection() {
        return this.paginated
            ? new PaginatedACSCacheCollection(this.ledger, this.cacheOptions)
            : new ACSCacheCollection(this.ledger, this.cacheOptions)
    }
}

class PaginatedReader extends BaseReader<PaginatedAcsOptions> {
    public readonly raw: RawReader

    constructor(
        protected readonly ledger: AbstractLedgerProvider,
        protected readonly cacheOptions?: ACSCacheCollectionOptions
    ) {
        super(ledger, cacheOptions)

        this.raw = new RawReader(ledger, cacheOptions, true)
    }

    protected createCacheCollection() {
        return new PaginatedACSCacheCollection(this.ledger, this.cacheOptions)
    }
}

export class ACSReader extends BaseReader<AcsOptions> {
    public readonly raw: RawReader
    public readonly paginated: PaginatedReader

    constructor(
        protected readonly ledger: AbstractLedgerProvider,
        protected readonly cacheOptions?: ACSCacheCollectionOptions
    ) {
        super(ledger, cacheOptions)
        this.raw = new RawReader(ledger, cacheOptions)
        this.paginated = new PaginatedReader(ledger, cacheOptions)
    }

    protected createCacheCollection() {
        return new ACSCacheCollection(this.ledger, this.cacheOptions)
    }
}
