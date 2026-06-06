// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LedgerCommonSchemas } from '@canton-network/core-ledger-client-types'
import { ContractId, PartyId } from '@canton-network/core-types'

export type ACSKey = Partial<{
    party: PartyId
    templateId: string
    interfaceId: string
}>

export type ACEvent = {
    offset: number
    event:
        | LedgerCommonSchemas['CreatedEvent']
        | LedgerCommonSchemas['ArchivedEvent']
    workflowId: string | null
    synchronizerId: string | null
    archived?: boolean
}

export type ACSComponentState<T> = {
    offset: number
    acs: Array<T>
}

export type ACSState = {
    initial: ACSComponentState<
        LedgerCommonSchemas['JsGetActiveContractsResponse']
    >
    updates: ACSComponentState<ACEvent>
    archivedACs: Set<ContractId<string>>
}

export type PaginatedACSState = {
    pages: Record<
        NonNullable<
            LedgerCommonSchemas['JsGetActiveContractsPageResponse']['nextPageToken']
        >,
        LedgerCommonSchemas['JsGetActiveContractsPageResponse']
    >
    offset: number
}

/**
 * Configuration for ACS (Active Contract Set) update behavior.
 *
 * @property maxEventsBeforePrune - How many events do we accumulate before we prune (compact) the ACS history. Set to 0 to enable to compact all events, which is more efficient as long as application always asks for increasing (or equal) offsets.
 * @property safeOffsetDeltaForPrune - When we compact the ACS history, we keep all events within this offset delta of the last seen update offset. Set 0 to allow to compact everything.
 * @property maxUpdatesToFetch - How many updates do we fetch at once when fetching updates. If there are more updates, we will fetch again until we have caught up (returned data is always complete to the requested endInclusive offset - even if that means multiple fetches).
 */
export const ACS_UPDATE_CONFIG = {
    maxEventsBeforePrune: 150,
    safeOffsetDeltaForPrune: 200,
    maxUpdatesToFetch: 100,
} as const
