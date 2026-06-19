// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { BaseCacheCollection } from './base'
import { ACSCache, PaginatedACSCache } from '../item'
import { ACSKey } from '../../types'
import { PaginatedAcsOptions } from '../../service'
import { Ops } from '@canton-network/core-provider-ledger'

type ReadPageFromCacheOptions = ACSKey & Pick<PaginatedAcsOptions, 'pageToken'>

export class ACSCacheCollection extends BaseCacheCollection<ACSCache> {
    protected createCache(): ACSCache {
        return new ACSCache(this.ledger)
    }
}

export class PaginatedACSCacheCollection extends BaseCacheCollection<PaginatedACSCache> {
    protected createCache(): PaginatedACSCache {
        return new PaginatedACSCache(this.ledger)
    }

    /**
     * Reads a specific page of active contracts from the cache.
     * Updates the cache to the current ledger offset before returning the page.
     * @returns The requested page containing active contracts and pagination information
     */
    public async readPageFromCache({
        party,
        templateId,
        interfaceId,
        pageToken = PaginatedACSCache.FIRST_PAGE_TOKEN,
    }: ReadPageFromCacheOptions) {
        const cache = this.getCache({
            party,
            templateId,
            interfaceId,
        })

        const offset = (
            await this.ledger.request<Ops.GetV2StateLedgerEnd>({
                method: 'ledgerApi',
                params: {
                    requestMethod: 'get',
                    resource: '/v2/state/ledger-end',
                },
            })
        ).offset

        if (!offset) throw Error('Offset not found')

        await cache.update({
            parties: party ? [party] : [],
            templateIds: templateId ? [templateId] : [],
            interfaceIds: interfaceId ? [interfaceId] : [],
            pageToken,
            offset,
        })

        return cache.getPage(pageToken)
    }
}
