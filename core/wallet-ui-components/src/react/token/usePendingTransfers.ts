// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import type { TokenStandardVersion } from './client.ts'
import {
    type PendingTransfer,
    pendingTransfers,
    type TransferDirection,
} from './pending-transfers.ts'
import {
    pendingTransfersQueryOptions,
    pendingTransfersV2QueryOptions,
} from './query-options.ts'
import { useTokenContext } from './useTokenContext.ts'

export interface PendingTransfersResult {
    /** The transfers of the versions that loaded. */
    transfers: PendingTransfer[]
    isLoading: boolean
    /** Both versions failed. */
    isError: boolean
    /** The versions that failed, with their errors. */
    failures: { version: TokenStandardVersion; error: Error }[]
    refetch: () => void
}

export type OutgoingTransfersResult = PendingTransfersResult
export type IncomingTransfersResult = PendingTransfersResult

function usePendingTransfers(
    partyId: string | undefined,
    direction: TransferDirection
): PendingTransfersResult {
    const { client } = useTokenContext()
    const v1 = useQuery(pendingTransfersQueryOptions({ client, partyId }))
    const v2 = useQuery(pendingTransfersV2QueryOptions({ client, partyId }))

    const transfers = useMemo(
        () =>
            partyId
                ? pendingTransfers(
                      partyId,
                      direction,
                      v1.data ?? [],
                      v2.data ?? []
                  )
                : [],
        [partyId, direction, v1.data, v2.data]
    )

    const failures = [
        ...(v1.error ? [{ version: 'v1' as const, error: v1.error }] : []),
        ...(v2.error ? [{ version: 'v2' as const, error: v2.error }] : []),
    ]

    return {
        transfers,
        isLoading: v1.isLoading || v2.isLoading,
        isError: failures.length === 2,
        failures,
        refetch: () => {
            void v1.refetch()
            void v2.refetch()
        },
    }
}

export const useOutgoingTransfers = (
    partyId: string | undefined
): OutgoingTransfersResult => usePendingTransfers(partyId, 'outgoing')

export const useIncomingTransfers = (
    partyId: string | undefined
): IncomingTransfersResult => usePendingTransfers(partyId, 'incoming')
