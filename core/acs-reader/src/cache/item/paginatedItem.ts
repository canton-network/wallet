// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PaginatedResolvedAcsOptions } from '../../service'
import { PaginatedACSState } from '../../types'
import { BaseACSCache } from './base'

export class PaginatedACSCache extends BaseACSCache<true> {
    public static readonly FIRST_PAGE_TOKEN = ''
    protected readonly state: PaginatedACSState = {
        pages: {
            [PaginatedACSCache.FIRST_PAGE_TOKEN]: {
                activeContracts: [],
                activeAtOffset: 0,
                nextPageToken: '',
            },
        },
        offset: 0,
    }

    /**
     * Token for fetching pages of active contracts. will loop over pages until desired offset is reached. When last obtained page was the last one it is `undefined`
     */
    private nextPageToken: string | undefined =
        PaginatedACSCache.FIRST_PAGE_TOKEN

    public async update(options: PaginatedResolvedAcsOptions) {
        if (
            !this.state.pages[PaginatedACSCache.FIRST_PAGE_TOKEN]
                .activeContracts.length &&
            !this.state.pages[PaginatedACSCache.FIRST_PAGE_TOKEN].nextPageToken
        ) {
            await this.initState(options)
        }

        if (options.pageToken) {
            this.state.pages[options.pageToken] =
                await this.service.getPaginatedActiveContracts(options)
            this.nextPageToken =
                this.state.pages[options.pageToken].nextPageToken
        } else {
            while (this.nextPageToken && options.offset > this.state.offset) {
                this.state.pages[this.nextPageToken] =
                    await this.service.getPaginatedActiveContracts({
                        ...options,
                        pageToken: this.nextPageToken,
                    })
                this.state.offset =
                    this.state.pages[this.nextPageToken].activeAtOffset
                this.nextPageToken =
                    this.state.pages[this.nextPageToken].nextPageToken
            }
        }
    }

    public calculateAt(offset: number) {
        const activeContracts = Object.values(this.state.pages).flatMap(
            (page) => page.activeContracts
        )

        if (!activeContracts.length)
            throw Error('No ACS initialized. Call `.update()` first')

        return activeContracts.filter((ac) => {
            const event =
                ac.contractEntry && 'JsActiveContract' in ac.contractEntry
                    ? ac.contractEntry.JsActiveContract.createdEvent
                    : undefined
            return event && event.offset <= offset
        })
    }

    /**
     * Retrieves a specific page from the cache using the page token.
     */
    public getPage(pageToken: string) {
        return this.state.pages[pageToken]
    }

    /**
     * Initializes the cache state by fetching the first page of active contracts.
     */
    private async initState(options: PaginatedResolvedAcsOptions) {
        const firstPage =
            await this.service.getPaginatedActiveContracts(options)

        this.state.pages[PaginatedACSCache.FIRST_PAGE_TOKEN] = firstPage
        this.state.offset = firstPage.activeAtOffset
        this.nextPageToken = firstPage.nextPageToken
    }
}
