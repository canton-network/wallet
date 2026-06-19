// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo, useState } from 'react'
import { Box } from '@mui/material'
import {
    deduplicateTransactionHistory,
    useTransactionHistoryForParty,
} from '@hooks/useTransactionHistory'
import { TransactionHistoryContent } from './transaction-history-content'
import { TransactionHistoryTabs } from './transaction-history-tabs'
import {
    FILTER_LABEL_BY_FILTER,
    filterTransactions,
    type TransactionFilter,
} from './transaction-history-utils'

interface TransactionHistoryProps {
    walletId: string
}

export function TransactionHistory({ walletId }: TransactionHistoryProps) {
    const [filter, setFilter] = useState<TransactionFilter>('all')
    const history = useTransactionHistoryForParty(walletId)
    const transactions = useMemo(
        () => deduplicateTransactionHistory(history.data),
        [history.data]
    )
    const visibleTransactions = useMemo(
        () => filterTransactions(transactions, walletId, filter),
        [transactions, walletId, filter]
    )
    const handleLoadMore = useCallback(() => {
        void history.fetchNextPage()
    }, [history])

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: { xs: 'stretch', md: 'end' },
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 2,
                    borderBottom: (theme) =>
                        `1px solid ${theme.palette.divider}`,
                    flexDirection: { xs: 'column', md: 'row' },
                }}
            >
                <TransactionHistoryTabs value={filter} onChange={setFilter} />
            </Box>

            <Box
                component="section"
                aria-label={`${FILTER_LABEL_BY_FILTER[filter]} transaction history`}
            >
                <TransactionHistoryContent
                    filter={filter}
                    walletId={walletId}
                    transactions={visibleTransactions}
                    totalLoadedTransactions={transactions.length}
                    isLoading={history.isPending && transactions.length === 0}
                    isError={history.isError}
                    error={history.error}
                    hasNextPage={history.hasNextPage ?? false}
                    isFetchingNextPage={history.isFetchingNextPage}
                    onLoadMore={handleLoadMore}
                />
            </Box>
        </Box>
    )
}
