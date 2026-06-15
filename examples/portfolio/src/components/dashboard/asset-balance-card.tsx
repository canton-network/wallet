// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type ReactNode } from 'react'
import {
    Avatar,
    Box,
    ButtonBase,
    Paper,
    Skeleton,
    Typography,
} from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { normalizeSx } from '@components/ui/utils'

type AssetsPanelProps = {
    children: ReactNode
    grid?: boolean
    sx?: SxProps<Theme>
}

export function AssetsPanel({ children, grid = false, sx }: AssetsPanelProps) {
    return (
        <Box
            component={Paper}
            elevation={0}
            sx={[
                {
                    display: 'grid',
                    gridTemplateColumns: grid
                        ? {
                              xs: '1fr',
                              md: 'repeat(2, minmax(0, 1fr))',
                              xl: 'repeat(3, minmax(0, 1fr))',
                          }
                        : '1fr',
                    gap: grid ? 2 : 2.5,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    p: 3,
                },
                ...normalizeSx(sx),
            ]}
        >
            {children}
        </Box>
    )
}

type AssetBalanceCardProps = {
    name: string
    symbol: string
    amount: string
    initials: string
    onClick?: () => void
    ariaLabel?: string
}

export function AssetBalanceCard({
    name,
    symbol,
    amount,
    initials,
    onClick,
    ariaLabel,
}: AssetBalanceCardProps) {
    const content = (
        <>
            <Box
                sx={{
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                }}
            >
                <Avatar
                    aria-hidden="true"
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'text.primary',
                        color: 'background.default',
                        fontSize: 13,
                        fontWeight: 700,
                    }}
                >
                    {initials}
                </Avatar>
                <Typography
                    variant="body1"
                    sx={{
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {name}
                </Typography>
            </Box>

            <Typography variant="body1" sx={{ whiteSpace: 'nowrap' }}>
                {amount} {symbol}
            </Typography>
        </>
    )

    const cardSx: SxProps<Theme> = {
        width: '100%',
        minHeight: 64,
        px: 2,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        color: 'text.primary',
        textAlign: 'left',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        transition: (theme) =>
            theme.transitions.create(
                ['background-color', 'border-color', 'transform'],
                { duration: theme.transitions.duration.short }
            ),
        '&:hover': onClick
            ? {
                  bgcolor: 'action.hover',
                  borderColor: 'text.secondary',
              }
            : undefined,
        '&.Mui-focusVisible': {
            outline: (theme) => `2px solid ${theme.palette.secondary.main}`,
            outlineOffset: 2,
        },
        '&:active': onClick
            ? {
                  transform: 'scale(0.99)',
              }
            : undefined,
    }

    if (onClick) {
        return (
            <Box
                component={ButtonBase}
                type="button"
                aria-haspopup="dialog"
                aria-label={ariaLabel}
                onClick={onClick}
                sx={cardSx}
            >
                {content}
            </Box>
        )
    }

    return <Box sx={cardSx}>{content}</Box>
}

export function AssetBalanceCardSkeleton() {
    return (
        <Box
            sx={{
                minHeight: 64,
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="text" width={160} />
            </Box>
            <Skeleton variant="text" width={140} />
        </Box>
    )
}
