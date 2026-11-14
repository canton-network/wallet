// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { KeyboardEvent } from 'react'
import { Box, Chip, type SxProps, type Theme } from '@mui/material'
import { CopyableIdentifier } from '@components/copyable-identifier'
import type {
    AllocationActionItem,
    AllocationInstructionV2ActionItem,
    AllocationRequestV2ActionItem,
    AllocationV2ActionItem,
    TransferActionItem,
} from '@components/types'
import {
    OfferDescriptionBlock,
    OfferDetailBlock,
    OfferExpirationBlock,
    OfferFieldLabel,
    OfferPartyBlock,
    OfferRowGrid,
    OfferRowShell,
} from './offer-row-layout'
import type {
    OfferItem,
    OfferStatus,
    TransferOfferItem,
} from '@hooks/useOffers'
import { formatAmount } from '@utils/decimal'
import { netAmounts } from '@utils/v2-allocation-items'

interface OfferRowProps {
    offer: OfferItem
    onClick: () => void
}

export function OfferRow({ offer, onClick }: OfferRowProps) {
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget) return
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
            <OfferRowContent offer={offer}></OfferRowContent>
        </OfferRowShell>
    )
}

function OfferRowContent({ offer }: { offer: OfferItem }) {
    const source = offer.source
    switch (source.kind) {
        case 'transfer':
            return (
                <TransferOfferRow
                    offer={offer as TransferOfferItem}
                    item={source}
                ></TransferOfferRow>
            )
        case 'allocation':
            return (
                <AllocationOfferRow
                    item={source}
                    status={offer.status}
                ></AllocationOfferRow>
            )
        case 'allocation-instruction-v2':
        case 'allocation-request-v2':
        case 'allocation-v2':
            return (
                <AllocationV2OfferRow
                    item={source}
                    status={offer.status}
                ></AllocationV2OfferRow>
            )
        default: {
            const unhandled: never = source
            throw new Error(
                `Unhandled offer kind: ${JSON.stringify(unhandled)}`
            )
        }
    }
}

const V2_TYPE_LABEL = {
    'allocation-request-v2': 'Allocation Request',
    'allocation-instruction-v2': 'Allocation Instruction',
    'allocation-v2': 'Allocation',
}

function getOfferRowLabel(offer: OfferItem) {
    const source = offer.source
    switch (source.kind) {
        case 'transfer': {
            const message = source.message
                ? `: ${truncateLabel(source.message)}`
                : ''
            return `Transfer Offer for ${formatAmount(source.amount)} ${
                source.instrumentId.id
            }${message}`
        }
        case 'allocation':
            return 'Allocation Request'
        default:
            return `${V2_TYPE_LABEL[source.kind]} ${source.settlement.id}`
    }
}

const MAX_LABEL_MESSAGE_LENGTH = 50

function truncateLabel(message: string) {
    return message.length > MAX_LABEL_MESSAGE_LENGTH
        ? `${message.slice(0, MAX_LABEL_MESSAGE_LENGTH)}…`
        : message
}

function TransferOfferRow({
    offer,
    item,
}: {
    offer: TransferOfferItem
    item: TransferActionItem
}) {
    const counterparty =
        offer.direction === 'incoming'
            ? { label: 'Sender', value: item.sender }
            : { label: 'Recipient', value: item.receiver }

    return (
        <OfferRowGrid columns={6}>
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
            <OfferDescriptionBlock value={item.message} />
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
        <OfferRowGrid columns={5}>
            <OfferDetailBlock label="Type" value="Allocation Request" />
            <OfferExpirationBlock
                label="Allocate Before"
                expiration={item.expiry}
            />
            <Box sx={{ minWidth: 0 }}>
                <OfferFieldLabel>Settlement Reference</OfferFieldLabel>
                <CopyableIdentifier
                    value={item.settlement.settlementRef.id}
                    maxLength={14}
                />
            </Box>
            <OfferPartyBlock
                label="Executor Party"
                value={item.settlement.executor}
            />
            <StatusBlock status={status} />
        </OfferRowGrid>
    )
}

type AllocationV2Item =
    | AllocationRequestV2ActionItem
    | AllocationV2ActionItem
    | AllocationInstructionV2ActionItem

const specsOf = (item: AllocationV2Item) =>
    item.kind === 'allocation-request-v2' ? item.ownSpecs : [item.allocation]

function formatNet(item: AllocationV2Item) {
    const net = netAmounts(specsOf(item))
    if (net.length === 0) return '-'
    return net
        .map(({ amount, instrumentId }) => {
            const sign = amount.isNegative() ? '-' : amount.isZero() ? '' : '+'
            return `${sign}${formatAmount(amount.abs().toString())} ${instrumentId}`
        })
        .join(', ')
}

function AllocationV2OfferRow({
    item,
    status,
}: {
    item: AllocationV2Item
    status: OfferStatus
}) {
    const [executor, ...moreExecutors] = item.settlement.executors
    return (
        <OfferRowGrid columns={6}>
            <OfferDetailBlock label="Type" value={V2_TYPE_LABEL[item.kind]} />
            <OfferDetailBlock label="Net Amount" value={formatNet(item)} />
            {item.expiry ? (
                <OfferExpirationBlock
                    label="Settle By"
                    expiration={item.expiry}
                />
            ) : (
                <OfferDetailBlock label="Settle By" value="No deadline" />
            )}

            <Box sx={{ minWidth: 0 }}>
                <OfferFieldLabel>Settlement</OfferFieldLabel>
                <CopyableIdentifier value={item.settlement.id} maxLength={14} />
            </Box>
            <OfferPartyBlock
                label={
                    moreExecutors.length > 0
                        ? `Executors: (${item.settlement.executors.length})`
                        : `Executor`
                }
                value={executor ?? '-'}
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
    'Partially Allocated': 'partially-allocated',
    Allocated: 'allocated',
    Expired: 'expired',
    'Awaiting Approval': 'awaiting-approval',
    'Awaiting Settlement': 'awaiting-settlement',
} satisfies Record<
    OfferStatus,
    | 'pending'
    | 'action-required'
    | 'partially-allocated'
    | 'allocated'
    | 'expired'
    | 'awaiting-approval'
    | 'awaiting-settlement'
>
