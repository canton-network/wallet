// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type KeyboardEvent, type ReactNode } from 'react'
import { Box, Chip, Typography } from '@mui/material'
import { CopyableIdentifier } from '@components/copyable-identifier'
import type {
    ActionItem,
    AllocationActionItem,
    TransferActionItem,
    TransferLegWithAllocation,
} from '@components/types'
import {
    formatDistanceToNow,
    formatIsoDateTimeString,
} from '@utils/date-format'
import { formatAmount } from '@utils/decimal'

interface ActionRequiredRowProps {
    item: ActionItem
    onClick: () => void
}

export function ActionRequiredRow({ item, onClick }: ActionRequiredRowProps) {
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick()
        }
    }

    return (
        <Box
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-label={`Open ${getItemRowLabel(item)}`}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            sx={{
                cursor: 'pointer',
                userSelect: 'none',
                width: '100%',
                minHeight: 80,
                p: 2,
                display: 'grid',
                justifyContent: 'stretch',
                justifyItems: 'stretch',
                alignItems: 'start',
                color: 'text.primary',
                textAlign: 'left',
                bgcolor: 'background.paper',
                borderRadius: 1,
                transition: (theme) =>
                    theme.transitions.create(
                        ['background-color', 'border-color', 'transform'],
                        { duration: theme.transitions.duration.short }
                    ),
                '&:hover': {
                    bgcolor: 'action.hover',
                    borderColor: 'text.secondary',
                },
                '&:focus-visible': {
                    outline: (theme) =>
                        `2px solid ${theme.palette.secondary.main}`,
                    outlineOffset: 2,
                },
                '&:active': { transform: 'scale(0.995)' },
            }}
        >
            {item.kind === 'transfer' ? (
                <TransferRequiredRow item={item} />
            ) : (
                <AllocationRequiredRow item={item} />
            )}
        </Box>
    )
}

function TransferRequiredRow({ item }: { item: TransferActionItem }) {
    return (
        <Box sx={rowGridSx}>
            <DetailBlock label="Type" value="Transfer Offer" />
            <DetailBlock
                label="Amount"
                value={`${formatAmount(item.amount)} ${item.instrumentId.id}`}
            />
            <ExpirationBlock label="Expiration" expiration={item.expiry} />
            <PartyBlock label="Sender" value={item.sender} />
            <PartyBlock
                label="Recipient"
                value={item.receiver}
                isCurrentParty={item.receiver === item.currentPartyId}
            />
        </Box>
    )
}

function AllocationRequiredRow({ item }: { item: AllocationActionItem }) {
    const sendLeg = item.transferLegs.find((leg) =>
        isCurrentPartySender(item.currentPartyId, leg)
    )
    const receiveLeg = item.transferLegs.find((leg) =>
        isCurrentPartyReceiver(item.currentPartyId, leg)
    )

    return (
        <Box sx={rowGridSx}>
            <DetailBlock label="Type" value="Allocation Request" />
            <DetailBlock
                label="Amount to Send"
                value={formatLegAmount(sendLeg)}
            />
            <DetailBlock
                label="Amount to Receive"
                value={formatLegAmount(receiveLeg)}
            />
            <ExpirationBlock label="Allocate Before" expiration={item.expiry} />
            <PartyBlock
                label="Executor Party"
                value={item.settlement.executor}
            />
        </Box>
    )
}

const rowGridSx = {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: {
        xs: '1fr',
        md: '1fr 1fr 1fr 1fr 1fr',
    },
    gap: { xs: 2, md: 3 },
    alignItems: 'start',
}

function DetailBlock({ label, value }: { label: string; value: string }) {
    return (
        <Box sx={{ minWidth: 0 }}>
            <FieldLabel>{label}</FieldLabel>
            <Typography
                variant="body1"
                sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {value}
            </Typography>
        </Box>
    )
}

interface ExpirationBlockProps {
    label: string
    expiration: string
}

function ExpirationBlock({ label, expiration }: ExpirationBlockProps) {
    return (
        <Box sx={{ minWidth: 0 }}>
            <FieldLabel>{label}</FieldLabel>
            <Typography variant="body1" color="text.secondary">
                {formatIsoDateTimeString(expiration)}
            </Typography>{' '}
            <Typography variant="body1">
                ({formatDistanceToNow(expiration)})
            </Typography>
        </Box>
    )
}

interface PartyBlockProps {
    label: string
    value: string
    isCurrentParty?: boolean
}

function PartyBlock({ label, value, isCurrentParty = false }: PartyBlockProps) {
    return (
        <Box sx={{ minWidth: 0 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    mb: 0.75,
                    '& .MuiTypography-root': { mb: 0 },
                }}
            >
                <FieldLabel>{label}</FieldLabel>
                {isCurrentParty ? (
                    <Chip
                        label="You"
                        size="small"
                        sx={{
                            height: 20,
                            bgcolor: 'action.selected',
                            color: 'text.secondary',
                            fontSize: 12,
                            '& .MuiChip-label': { px: 0.75 },
                        }}
                    />
                ) : null}
            </Box>
            <CopyableIdentifier value={value} maxLength={5} />
        </Box>
    )
}

function FieldLabel({ children }: { children: ReactNode }) {
    return (
        <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 0.75, textTransform: 'uppercase' }}
        >
            {children}
        </Typography>
    )
}

function getItemRowLabel(item: ActionItem) {
    return item.kind === 'transfer' ? 'Transfer Offer' : 'Allocation'
}

function isCurrentPartySender(
    currentPartyId: string,
    leg: TransferLegWithAllocation
) {
    return leg.transferLeg.sender === currentPartyId
}

function isCurrentPartyReceiver(
    currentPartyId: string,
    leg: TransferLegWithAllocation
) {
    return leg.transferLeg.receiver === currentPartyId
}

function formatLegAmount(leg: TransferLegWithAllocation | undefined) {
    if (!leg) return '—'
    return `${formatAmount(leg.transferLeg.amount)} ${leg.transferLeg.instrumentId.id}`
}
