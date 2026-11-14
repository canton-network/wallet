// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import type {
    Account,
    AllocationSpecification,
} from '@canton-network/core-token-standard-v2'
import { CopyableIdentifier } from '@components/copyable-identifier'
import { DateTimeText } from '@components/date-time-text'
import { formatDistanceToNow } from '@utils/date-format'
import { formatAmount } from '@utils/decimal'
import { isBasicAccount } from '@utils/holdings'
import {
    amountsToLock,
    type InstrumentAmount,
} from '@utils/v2-allocation-items'

export function DialogHeader({
    title,
    closeLabel,
    disabled,
    onClose,
    adornment,
}: {
    title: string
    closeLabel: string
    disabled: boolean
    onClose: () => void
    adornment?: ReactNode
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" component="h1">
                    {title}
                </Typography>
                {adornment}
            </Box>
            <IconButton
                aria-label={closeLabel}
                disabled={disabled}
                onClick={onClose}
                size="small"
                sx={{ color: 'secondary.main' }}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </Box>
    )
}

export interface DetailRowProps {
    label: string
    children: ReactNode
}

export function DetailRow({ label, children }: DetailRowProps) {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'minmax(180px, 0.45fr) minmax(0, 1fr)',
                },
                alignItems: 'center',
                gap: { xs: 1, sm: 2 },
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:first-of-type': { pt: 0 },
            }}
        >
            <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, textTransform: 'uppercase' }}
            >
                {label}
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                    minWidth: 0,
                    '& .MuiTypography-root': { fontSize: 16 },
                }}
            >
                {children}
            </Box>
        </Box>
    )
}

export function AmountList({
    amounts,
    signed = false,
}: {
    amounts: InstrumentAmount[]
    signed?: boolean
}) {
    if (amounts.length === 0) return <Typography>—</Typography>
    return (
        <Box sx={{ display: 'grid', justifyItems: 'end' }}>
            {amounts.map(({ admin, instrumentId, amount }) => {
                const sign =
                    signed && amount.isPositive() && !amount.isZero() ? '+' : ''
                return (
                    <Typography
                        key={`${admin}-${instrumentId}`}
                        sx={{
                            color: !signed
                                ? 'text.primary'
                                : amount.isNegative()
                                  ? 'error.main'
                                  : 'success.main',
                        }}
                    >
                        {sign}
                        {formatAmount(amount.toString())} {instrumentId}
                    </Typography>
                )
            })}
        </Box>
    )
}

export function TimeWithDistance({ value }: { value: string }) {
    return (
        <Box sx={{ textAlign: 'right' }}>
            <Typography>
                <DateTimeText value={value} />
            </Typography>
            <Typography color="text.secondary">
                {formatDistanceToNow(value)}
            </Typography>
        </Box>
    )
}

export function SettlementRows({
    settlement,
}: {
    settlement: { id: string; executors: string[] }
}) {
    return (
        <>
            <DetailRow label="Settlement">
                <CopyableIdentifier value={settlement.id} maxLength={20} />
            </DetailRow>
            <DetailRow
                label={settlement.executors.length > 1 ? 'Executors' : 'Venue'}
            >
                <Box sx={{ display: 'grid', justifyItems: 'end', gap: 0.5 }}>
                    {settlement.executors.length === 0 && (
                        <Typography>—</Typography>
                    )}
                    {settlement.executors.map((executor) => (
                        <CopyableIdentifier
                            key={executor}
                            value={executor}
                            maxLength={16}
                        />
                    ))}
                </Box>
            </DetailRow>
        </>
    )
}

/** A party, plus its account ID unless it's the basic account; both copyable */
function AccountRef({
    label,
    account,
}: {
    label: 'From' | 'To'
    account: Account
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
                minWidth: 0,
            }}
        >
            <Typography
                color="text.primary"
                sx={{ minWidth: 40, fontWeight: 700 }}
            >
                <strong>{label}:</strong>
            </Typography>
            <CopyableIdentifier value={account.owner ?? '—'} maxLength={24} />
            {!isBasicAccount(account) && account.id && (
                <>
                    <CopyableIdentifier value={account.id} maxLength={16} />
                </>
            )}
        </Box>
    )
}

export function LegList({
    specs,
    title,
}: {
    specs: AllocationSpecification[]
    title: string
}) {
    return (
        <Box sx={{ display: 'grid', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {title}
            </Typography>
            {specs.flatMap((spec) =>
                spec.transferLegSides.map((leg) => {
                    const send = leg.side === 'SenderSide'
                    // The user's side is the spec's authorizer; the other side is `otherside`
                    const from = send ? spec.authorizer : leg.otherside
                    const to = send ? leg.otherside : spec.authorizer

                    return (
                        <Box
                            key={`${spec.admin}-${leg.transferLegId}-${leg.side}`}
                            data-testid={`leg-${leg.transferLegId}-${leg.side}`}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'minmax(100px, auto) minmax(0, 1fr) auto',
                                alignItems: 'center',
                                gap: 2,
                                py: 1.5,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography
                                sx={{
                                    color: send ? 'error.main' : 'success.main',
                                }}
                            >
                                {send ? 'You send' : 'You receive'}
                            </Typography>

                            <Box
                                sx={{ minWidth: 0, display: 'grid', gap: 0.5 }}
                            >
                                <AccountRef label="From" account={from} />
                                <AccountRef label="To" account={to} />
                            </Box>

                            <Typography>
                                {formatAmount(leg.amount)} {leg.instrumentId}
                            </Typography>
                        </Box>
                    )
                })
            )}
        </Box>
    )
}

export function LockedAmounts({ specs }: { specs: AllocationSpecification[] }) {
    const toLock = amountsToLock(specs)
    if (toLock.length > 0) return <AmountList amounts={toLock}></AmountList>
    const sendsAnything = specs.some((s) =>
        s.transferLegSides.some((l) => l.side === 'SenderSide')
    )
    return (
        <Typography>
            {sendsAnything
                ? 'Nothing - you receive more than you send'
                : 'Nothing - you only receive'}
        </Typography>
    )
}
