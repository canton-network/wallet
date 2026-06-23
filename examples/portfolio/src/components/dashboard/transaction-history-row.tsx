// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Chip, TableCell, TableRow, Typography } from '@mui/material'
import type { Transaction } from '@canton-network/core-tx-parser'
import { CopyableIdentifier } from '@components/copyable-identifier'
import { getTransactionDisplay } from './transaction-history-utils'

interface TransactionHistoryRowProps {
    transaction: Transaction
    walletId: string
}

const bodyCellSx = {
    px: 2,
    py: 2.5,
    minWidth: 0,
    color: 'text.primary',
    verticalAlign: 'middle',
}

export function TransactionHistoryRow({
    transaction,
    walletId,
}: TransactionHistoryRowProps) {
    const display = getTransactionDisplay(transaction, walletId)
    const amountColor =
        display.direction === 'received'
            ? 'success.main'
            : display.direction === 'sent'
              ? 'error.main'
              : 'text.secondary'
    const amountPrefix =
        display.direction === 'received'
            ? '+'
            : display.direction === 'sent'
              ? '-'
              : ''

    return (
        <TableRow
            hover
            sx={{
                transition: (theme) =>
                    theme.transitions.create('background-color', {
                        duration: theme.transitions.duration.short,
                    }),
                '&:last-of-type td': { borderBottom: 0 },
            }}
        >
            <TableCell sx={bodyCellSx}>
                <TransactionTypeChip label={display.type} />
            </TableCell>

            <TableCell sx={bodyCellSx}>
                <Chip
                    label={display.asset}
                    size="small"
                    sx={{
                        alignSelf: 'start',
                        width: 'fit-content',
                        maxWidth: '100%',
                        bgcolor: 'action.selected',
                        color: 'text.primary',
                        borderRadius: 1,
                        '& .MuiChip-label': {
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        },
                    }}
                />
            </TableCell>

            <TableCell sx={bodyCellSx}>
                <Typography
                    variant="body1"
                    sx={{
                        color: amountColor,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {display.amount ? `${amountPrefix}${display.amount}` : '—'}
                </Typography>
            </TableCell>

            <TableCell sx={bodyCellSx}>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    {display.date}
                </Typography>
            </TableCell>

            <TableCell sx={bodyCellSx}>
                <CopyableIdentifier value={display.updateId} maxLength={14} />
            </TableCell>

            <TableCell sx={bodyCellSx}>
                {display.counterparty ? (
                    <CopyableIdentifier
                        value={display.counterparty}
                        maxLength={10}
                    />
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        N/A
                    </Typography>
                )}
            </TableCell>
        </TableRow>
    )
}

function TransactionTypeChip({ label }: { label: string }) {
    return (
        <Chip
            label={label}
            size="small"
            sx={{
                height: 28,
                maxWidth: '100%',
                borderRadius: 999,
                bgcolor: 'action.selected',
                color: 'text.primary',
                fontSize: 14,
                '& .MuiChip-label': {
                    display: 'block',
                    overflow: 'hidden',
                    px: 1.25,
                    textOverflow: 'ellipsis',
                },
            }}
        />
    )
}
