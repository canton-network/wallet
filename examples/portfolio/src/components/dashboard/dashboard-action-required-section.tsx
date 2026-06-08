// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState, type ReactNode } from 'react'
import { Alert, Box, Chip, Typography } from '@mui/material'
import type { ActionItem } from '@components/types'
import { ActionRequiredDialog } from '@components/dashboard/action-required-dialog'
import { ActionRequiredRow } from '@components/dashboard/action-required-row'
import { ActionRequiredRowSkeleton } from '@components/dashboard/action-required-row-skeleton'

interface DashboardActionRequiredSectionProps {
    items: ActionItem[]
    isLoading?: boolean
    isError?: boolean
    error?: Error | null
}

export function DashboardActionRequiredSection({
    items,
    isLoading = false,
    isError = false,
    error,
}: DashboardActionRequiredSectionProps) {
    const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null)
    const visibleItems = useMemo(() => items.slice(0, 3), [items])

    if (isError) {
        return (
            <SectionShell totalCount={items.length}>
                <Alert severity="error">
                    {error?.message ??
                        'Unable to load any items requiring action.'}
                </Alert>
            </SectionShell>
        )
    }

    if (isLoading) {
        return (
            <SectionShell totalCount={items.length}>
                <Box sx={{ display: 'grid', gap: 2 }}>
                    {Array.from({ length: 3 }, (_, index) => (
                        <ActionRequiredRowSkeleton key={index} />
                    ))}
                </Box>
            </SectionShell>
        )
    }

    if (items.length === 0) {
        return (
            <SectionShell totalCount={0}>
                <Alert severity="info">
                    There are currently no offers requiring action.
                </Alert>
            </SectionShell>
        )
    }

    return (
        <SectionShell totalCount={items.length}>
            <Box sx={{ display: 'grid', gap: 2 }}>
                {visibleItems.map((item) => (
                    <ActionRequiredRow
                        key={`${item.kind}-${item.id}`}
                        item={item}
                        onClick={() => setSelectedItem(item)}
                    />
                ))}
            </Box>
            <ActionRequiredDialog
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
            />
        </SectionShell>
    )
}

interface SectionShellProps {
    totalCount: number
    children: ReactNode
}

function SectionShell({ totalCount, children }: SectionShellProps) {
    return (
        <Box component="section" sx={{ mb: 4 }}>
            <Box sx={{ mb: 2.5 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                    }}
                >
                    <Typography variant="h5" component="h2">
                        Action Required
                    </Typography>
                    <Chip
                        label={totalCount}
                        size="small"
                        sx={{
                            height: 24,
                            minWidth: 24,
                            bgcolor: 'portfolio.nav.soft',
                            color: 'secondary.contrastText',
                            fontWeight: 600,
                            '& .MuiChip-label': { px: 0.75 },
                        }}
                    />
                </Box>
                <Typography variant="body1" color="text.primary">
                    All offers here are offers sent to and from your primary
                    wallet
                </Typography>
            </Box>

            {children}
        </Box>
    )
}
