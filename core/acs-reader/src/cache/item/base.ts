// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ACEvent, ACSState, PaginatedACSState } from '../../types'
import { AbstractLedgerProvider } from '@canton-network/core-provider-ledger'
import { LedgerCommonSchemas } from '@canton-network/core-ledger-client-types'
import pino from 'pino'
import {
    ResolvedAcsOptions,
    AcsService,
    PaginatedResolvedAcsOptions,
} from '../../service'

export const logger = pino({ name: 'acs-reader/cache' })

/**
 * Checks if an event represents a contract creation.
 * Used to distinguish between created and archived events when processing cache updates.
 */
export function isCreatedEvent(event: ACEvent): event is ACEvent & {
    archived: false
    event: LedgerCommonSchemas['CreatedEvent']
} {
    return !event.archived
}

export type BaseCache<Paginated extends boolean> = {
    State: Paginated extends true ? PaginatedACSState : ACSState
    Options: Paginated extends true
        ? PaginatedResolvedAcsOptions
        : ResolvedAcsOptions
    ReturnValue: ReturnType<
        AcsService[Paginated extends true
            ? 'getPaginatedActiveContracts'
            : 'getActiveContracts']
    >
}

export abstract class BaseACSCache<Paginated extends boolean = false> {
    protected abstract readonly state: BaseCache<Paginated>['State']

    protected readonly service: AcsService

    constructor(protected readonly ledger: AbstractLedgerProvider) {
        this.service = new AcsService(ledger)
    }

    /**
     * Updates the cache to include ledger changes up to the specified offset.
     * Fetches and applies incremental updates from the ledger, initializing the cache if needed.
     * Automatically prunes old events when the update buffer exceeds configured thresholds (when not in pagination mode).
     */
    public abstract update(
        options: BaseCache<Paginated>['Options']
    ): Promise<void>

    /**
     * Calculates the active contract set at a specific ledger offset.
     * Applies cached updates to the initial snapshot and filters out archived contracts.
     * Throws an error if the cache is not initialized or the requested offset is too old.
     */
    public abstract calculateAt(
        offset: number
    ): LedgerCommonSchemas['JsGetActiveContractsResponse'][]
}
