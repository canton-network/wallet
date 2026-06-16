// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type KeyboardEvent } from 'react'
import { Box, Chip, type SxProps, type Theme } from '@mui/material'
import type {
    AllocationActionItem,
    TransferActionItem,
} from '@components/types'
import {
    OfferDetailBlock,
    OfferExpirationBlock,
    OfferFieldLabel,
    OfferPartyBlock,
    OfferRowGrid,
    OfferRowShell,
} from './offer-row-layout'
import type { OfferItem, OfferStatus } from '@hooks/useOffers'
import { formatAmount } from '@utils/decimal'

interface OfferRowProps {
    offer: OfferItem
    onClick: () => void
}

export function OfferRow({ offer, onClick }: OfferRowProps) {
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick()
        }
    }

    return (
        <OfferRowShell
            component="article"
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-label={`Open ${getOfferRowLabel(offer)}`}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            sx={interactiveOfferRowSx}
        >
            {offer.source.kind === 'transfer' ? (
                <TransferOfferRow offer={offer} item={offer.source} />
            ) : (
                <AllocationOfferRow item={offer.source} status={offer.status} />
            )}
        </OfferRowShell>
    )
}

function getOfferRowLabel(offer: OfferItem) {
    return offer.source.kind === 'transfer'
        ? 'Transfer Offer'
        : 'Allocation Request'
}

function TransferOfferRow({
    offer,
    item,
}: {
    offer: OfferItem
    item: TransferActionItem
}) {
    const counterparty =
        offer.direction === 'incoming'
            ? { label: 'Sender', value: item.sender }
            : { label: 'Recipient', value: item.receiver }

    return (
        <OfferRowGrid columns={5}>
            <OfferDetailBlock label="Type" value="Transfer Offer" />
            <OfferDetailBlock
                label="Amount"
                value={`${formatAmount(item.amount)} ${item.instrumentId.id}`}
            />
            <OfferExpirationBlock label="Expiration" expiration={item.expiry} />
            <OfferPartyBlock
                label={counterparty.label}
                value={counterparty.value}
            />
            <StatusBlock status={offer.status} />
        </OfferRowGrid>
    )
}

function AllocationOfferRow({
    item,
    status,
}: {
    item: AllocationActionItem
    status: OfferStatus
}) {
    return (
        <OfferRowGrid columns={4}>
            <OfferDetailBlock label="Type" value="Allocation Request" />
            <OfferExpirationBlock
                label="Allocate Before"
                expiration={item.expiry}
            />
            <OfferPartyBlock
                label="Executor Party"
                value={item.settlement.executor}
            />
            <StatusBlock status={status} />
        </OfferRowGrid>
    )
}

function StatusBlock({ status }: { status: OfferStatus }) {
    return (
        <Box sx={{ minWidth: 0 }}>
            <OfferFieldLabel>Status</OfferFieldLabel>
            <Chip
                label={status}
                sx={[
                    {
                        height: 28,
                        borderRadius: 999,
                        fontSize: 14,
                        '& .MuiChip-label': { px: 1.25 },
                    },
                    (theme) => {
                        const token =
                            theme.portfolio.status[
                                STATUS_THEME_KEY_BY_STATUS[status]
                            ]
                        return {
                            bgcolor: token.background,
                            color: token.text,
                        }
                    },
                ]}
            />
        </Box>
    )
}

const interactiveOfferRowSx: SxProps<Theme> = {
    cursor: 'pointer',
    userSelect: 'none',
    transition: (theme) =>
        theme.transitions.create(
            ['background-color', 'border-color', 'transform'],
            {
                duration: theme.transitions.duration.short,
            }
        ),
    '&:hover': {
        bgcolor: 'action.hover',
        borderColor: 'text.secondary',
    },
    '&:focus-visible': {
        outline: (theme) => `2px solid ${theme.palette.secondary.main}`,
        outlineOffset: 2,
    },
    '&:active': { transform: 'scale(0.995)' },
}

const STATUS_THEME_KEY_BY_STATUS = {
    Pending: 'pending',
    'Action Required': 'action-required',
    Allocated: 'allocated',
    Expired: 'expired',
} satisfies Record<
    OfferStatus,
    'pending' | 'action-required' | 'allocated' | 'expired'
>
