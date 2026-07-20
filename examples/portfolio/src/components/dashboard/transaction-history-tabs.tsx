// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Tab, Tabs } from '@mui/material'
import type { TransactionFilter } from './transaction-history-utils'

const FILTERS: { value: TransactionFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'received', label: 'Received' },
    { value: 'sent', label: 'Sent' },
]

interface TransactionHistoryTabsProps {
    value: TransactionFilter
    onChange: (value: TransactionFilter) => void
}

export function TransactionHistoryTabs({
    value,
    onChange,
}: TransactionHistoryTabsProps) {
    return (
        <Tabs
            value={value}
            onChange={(_, nextValue: TransactionFilter) => onChange(nextValue)}
            aria-label="Transaction history filter"
            textColor="inherit"
            slotProps={{
                indicator: {
                    sx: {
                        backgroundColor: (theme) => theme.portfolio.nav.main,
                    },
                },
            }}
            sx={{
                minHeight: 'unset',
                '& .MuiTab-root': {
                    width: 80,
                    minWidth: 80,
                    maxWidth: 80,
                    minHeight: 'unset',
                    py: 0,
                    pb: 2,
                    color: 'text.secondary',
                    fontSize: (theme) => theme.typography.body1.fontSize,
                    lineHeight: (theme) => theme.typography.body1.lineHeight,
                    textTransform: 'none',
                },
                '& .Mui-selected': {
                    color: 'text.primary',
                    fontWeight: 600,
                },
            }}
        >
            {FILTERS.map((filter) => (
                <Tab
                    key={filter.value}
                    disableRipple
                    value={filter.value}
                    label={filter.label}
                />
            ))}
        </Tabs>
    )
}
