// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@canton-network/core-tx-parser'
import {
    useInfiniteQuery,
    useQueryClient,
    type UseInfiniteQueryResult,
    type InfiniteData,
} from '@tanstack/react-query'

import { useConnection } from '../contexts/ConnectionContext.tsx'
import type { TransactionHistoryResponse } from '../services/transaction-history-service.ts'
import { queryKeys } from './query-keys.ts'
import { transactionHistoryServiceQueryOptions } from './query-options.ts'

export const useTransactionHistoryForParty = (
    partyId: string | undefined
): UseInfiniteQueryResult<InfiniteData<TransactionHistoryResponse>> => {
    const queryClient = useQueryClient()
    const { status } = useConnection()
    const isConnected = status?.connection?.isConnected ?? false

    return useInfiniteQuery({
        initialPageParam: null,
        queryKey:
            queryKeys.walletConnection.transactionHistory.forParty(partyId),
        enabled: isConnected && !!partyId,
        queryFn: async ({ pageParam }) => {
            if (!partyId) {
                throw new Error('Party is unavailable')
            }

            const service = await queryClient.query({
                ...transactionHistoryServiceQueryOptions(partyId),
                staleTime: 'static',
            })
            return service.query(pageParam)
        },
        getNextPageParam: (lastPage: TransactionHistoryResponse) => {
            if (lastPage.beginIsLedgerStart) return undefined
            return { endInclusive: lastPage.beginExclusive }
        },
        staleTime: Infinity,
    })
}

/** Deduplicate transactions.  We don't have stable pagination, this concerns
 *  in particular the the first page, for which the cursor doesn't have any
 *  offset or limit info. */
export const deduplicateTransactionHistory = (
    data: InfiniteData<TransactionHistoryResponse> | undefined
): Transaction[] => {
    const ids = new Set<number>()
    const transactions: Transaction[] = []

    for (const page of data?.pages ?? []) {
        for (const transaction of page?.transactions ?? []) {
            if (!ids.has(transaction.offset)) {
                ids.add(transaction.offset)
                if (transaction.events.length > 0) {
                    transactions.push(transaction)
                }
            }
        }
    }

    return transactions
}
