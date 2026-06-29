// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react'
import {
    Alert,
    Box,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material'
import type { Transaction } from '@canton-network/core-tx-parser'
import { useInView } from 'react-intersection-observer'
import { TransactionHistoryRow } from './transaction-history-row'
import {
    getEmptyMessage,
    type TransactionFilter,
} from './transaction-history-utils'

interface TransactionHistoryContentProps {
    filter: TransactionFilter
    walletId: string
    transactions: Transaction[]
    totalLoadedTransactions: number
    isLoading: boolean
    isError: boolean
    error: Error | null
    hasNextPage: boolean
    isFetchingNextPage: boolean
    onLoadMore: () => void
}

const TRANSACTION_HISTORY_COLUMNS = [
    { id: 'type', label: 'Activity', width: '13%' },
    { id: 'asset', label: 'Asset', width: '13%' },
    { id: 'amount', label: 'Amount', width: '13%' },
    { id: 'date', label: 'Date', width: '17%' },
    { id: 'update-id', label: 'Update ID', width: '22%' },
    { id: 'counterparty', label: 'Counterparty', width: '22%' },
] as const

const TRANSACTION_HISTORY_COLUMN_COUNT = TRANSACTION_HISTORY_COLUMNS.length

const headerCellSx = {
    px: 2,
    py: 2,
    bgcolor: 'background.paper',
    color: 'text.secondary',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
}

export function TransactionHistoryContent({
    filter,
    walletId,
    transactions,
    totalLoadedTransactions,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
}: TransactionHistoryContentProps) {
    const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null)
    const canAutoLoadMore = hasNextPage && !isFetchingNextPage && !isLoading
    const { ref: sentinelRef, inView } = useInView({
        root: scrollRoot,
        rootMargin: '120px 0px',
        skip: !scrollRoot || !canAutoLoadMore,
    })

    useEffect(() => {
        if (inView && canAutoLoadMore) {
            onLoadMore()
        }
    }, [inView, canAutoLoadMore, onLoadMore])

    if (isError) {
        return (
            <Alert severity="error">
                {error?.message ?? 'Unable to load transaction history.'}
            </Alert>
        )
    }

    return (
        <TableContainer
            ref={setScrollRoot}
            sx={{
                maxHeight: 960,
                overflow: 'auto',
                bgcolor: 'background.paper',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': {
                    width: 0,
                    height: 0,
                },
            }}
        >
            <Table
                stickyHeader
                aria-label="Transaction history"
                sx={{ minWidth: 1040, tableLayout: 'fixed' }}
            >
                <colgroup>
                    {TRANSACTION_HISTORY_COLUMNS.map((column) => (
                        <col key={column.id} style={{ width: column.width }} />
                    ))}
                </colgroup>
                <TableHead>
                    <TableRow>
                        {TRANSACTION_HISTORY_COLUMNS.map((column) => (
                            <TableCell key={column.id} sx={headerCellSx}>
                                {column.label}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        <TransactionHistorySkeletonRows />
                    ) : transactions.length === 0 ? (
                        <TransactionHistoryMessageRow>
                            {getEmptyMessage({
                                filter,
                                hasMoreHistory: hasNextPage,
                                totalLoadedTransactions,
                            })}
                        </TransactionHistoryMessageRow>
                    ) : (
                        transactions.map((transaction) => (
                            <>
                                <TransactionHistoryRow
                                    key={transaction.updateId}
                                    transaction={transaction}
                                    walletId={walletId}
                                />
                            </>
                        ))
                    )}

                    <TableRow aria-hidden="true">
                        <TableCell
                            ref={sentinelRef}
                            colSpan={TRANSACTION_HISTORY_COLUMN_COUNT}
                            sx={{ height: 1, p: 0, border: 0 }}
                        />
                    </TableRow>

                    {hasNextPage && isFetchingNextPage ? (
                        <TransactionHistoryMessageRow muted>
                            Loading more transactions…
                        </TransactionHistoryMessageRow>
                    ) : !hasNextPage &&
                      !isLoading &&
                      transactions.length > 0 ? (
                        <TransactionHistoryMessageRow muted>
                            No more transactions to load
                        </TransactionHistoryMessageRow>
                    ) : null}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

function TransactionHistorySkeletonRows() {
    return (
        <>
            {Array.from({ length: 5 }, (_, rowIndex) => (
                <TableRow key={rowIndex}>
                    {TRANSACTION_HISTORY_COLUMNS.map((column, cellIndex) => (
                        <TableCell key={column.id} sx={{ px: 2, py: 2.5 }}>
                            <Skeleton
                                variant="text"
                                width={cellIndex < 3 ? 88 : '76%'}
                            />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    )
}

function TransactionHistoryMessageRow({
    children,
    muted = false,
}: {
    children: string
    muted?: boolean
}) {
    return (
        <TableRow>
            <TableCell
                colSpan={TRANSACTION_HISTORY_COLUMN_COUNT}
                sx={{ px: 3, py: 3, borderBottom: 0 }}
            >
                <Box
                    sx={{
                        minHeight: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography
                        variant="body2"
                        color={muted ? 'text.secondary' : 'text.primary'}
                        aria-live={muted ? 'polite' : undefined}
                    >
                        {children}
                    </Typography>
                </Box>
            </TableCell>
        </TableRow>
    )
}
