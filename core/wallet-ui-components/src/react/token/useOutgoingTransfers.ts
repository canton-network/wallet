// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import {
    type OutgoingTransfer,
    outgoingTransfers,
} from './outgoing-transfers.ts'
import {
    pendingTransfersQueryOptions,
    pendingTransfersV2QueryOptions,
} from './query-options.ts'
import { useTokenContext } from './useTokenContext.ts'

export interface OutgoingTransfersResult {
    transfers: OutgoingTransfer[]
    isLoading: boolean
    isError: boolean
    error: Error | null
    refetch: () => void
}

export function useOutgoingTransfers(
    partyId: string | undefined
): OutgoingTransfersResult {
    const { client } = useTokenContext()
    const v1 = useQuery(pendingTransfersQueryOptions({ client, partyId }))
    const v2 = useQuery(pendingTransfersV2QueryOptions({ client, partyId }))

    const transfers = useMemo(
        () =>
            partyId
                ? outgoingTransfers(partyId, v1.data ?? [], v2.data ?? [])
                : [],
        [partyId, v1.data, v2.data]
    )

    return {
        transfers,
        isLoading: v1.isLoading || v2.isLoading,
        isError: v1.isError || v2.isError,
        error: v1.error ?? v2.error,
        refetch: () => {
            void v1.refetch()
            void v2.refetch()
        },
    }
}
