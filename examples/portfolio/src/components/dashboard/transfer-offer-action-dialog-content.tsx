// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    Box,
    Chip,
    CircularProgress,
    IconButton,
    Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useMemo, type ComponentProps, type ReactNode } from 'react'
import { CopyableIdentifier } from '@components/copyable-identifier'
import { DescriptionText } from '@components/description-text'
import { PillButton } from '@components/ui/PillButton'
import type { TransferActionItem } from '@components/types'
import { getCounterparty, isReceiver } from '@components/utils'
import { formatDistanceToNow } from '@utils/date-format'
import { DateTimeText } from '@components/date-time-text'
import { formatAmount } from '@utils/decimal'
import {
    getTransferActions,
    type TransferAction,
    type TransferActionAvailability,
} from '@utils/transfer-actions'
import type { PartyId } from '@canton-network/core-types'

export type AvailableTransferAction = Extract<
    TransferActionAvailability,
    { status: 'available' }
>
export type AwaitingTransferAction = Extract<
    TransferActionAvailability,
    { status: 'awaiting' }
>

interface TransferOfferActionDialogContentProps {
    item: TransferActionItem
    isLoading: boolean
    onClose: () => void
    onAction: (
        item: TransferActionItem,
        action: AvailableTransferAction
    ) => void
}

const BUTTON_ORDER: TransferAction[] = ['Reject', 'Accept', 'Withdraw']
const BUTTON_PROPS: Record<
    TransferAction,
    Partial<ComponentProps<typeof PillButton>>
> = {
    Reject: { tone: 'danger' },
    Accept: {},
    Withdraw: { variant: 'outlined', color: 'warning' },
}
interface AwaitingActionsProps {
    awaiting: AwaitingTransferAction[]
    party: PartyId
}
function AwaitingActions({ awaiting, party }: AwaitingActionsProps) {
    return (
        <Box sx={{ display: 'grid', gap: 1 }}>
            {awaiting.map(({ action, groups }) => {
                const others = [
                    ...new Set(groups.flat().filter((p) => p !== party)),
                ]
                return (
                    <Box
                        key={action}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            {action}: awaiting
                        </Typography>
                        {others.map((p) => (
                            <CopyableIdentifier
                                key={p}
                                value={p}
                                maxLength={12}
                            ></CopyableIdentifier>
                        ))}
                    </Box>
                )
            })}
        </Box>
    )
}

export function TransferOfferActionDialogContent({
    item,
    isLoading,
    onClose,
    onAction,
}: TransferOfferActionDialogContentProps) {
    const received = isReceiver(item)
    const counterparty = getCounterparty(item)
    const amountPrefix = received ? '+' : '-'

    const actions = useMemo(() => getTransferActions(item), [item])
    const available = actions
        .filter((a): a is AvailableTransferAction => a.status === 'available')
        .sort(
            (a, b) =>
                BUTTON_ORDER.indexOf(a.action) - BUTTON_ORDER.indexOf(b.action)
        )
    const awaiting = actions.filter(
        (a): a is AwaitingTransferAction => a.status === 'awaiting'
    )

    return (
        <Box sx={{ display: 'grid', gap: 3 }}>
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
                        Transfer Offer
                    </Typography>
                    <Chip
                        label={received ? 'Received ↘' : 'Outgoing ↗'}
                        size="small"
                        sx={{
                            height: 28,
                            bgcolor: 'action.selected',
                            color: 'text.primary',
                            fontSize: 14,
                            '& .MuiChip-label': { px: 1.25 },
                        }}
                    />
                </Box>
                <IconButton
                    aria-label="Close transfer offer dialog"
                    disabled={isLoading}
                    onClick={onClose}
                    size="small"
                    sx={{ color: 'secondary.main' }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box sx={{ display: 'grid' }}>
                <DetailRow label="Amount">
                    <Typography
                        sx={{
                            color: received ? 'success.main' : 'error.main',
                            fontSize: 18,
                            lineHeight: 1.5,
                        }}
                    >
                        {amountPrefix}
                        {formatAmount(item.amount)} {item.instrumentId.id}
                    </Typography>
                </DetailRow>

                <DetailRow label="Expiration">
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body1">
                            <DateTimeText value={item.expiry} />
                        </Typography>
                        <Typography variant="body1">
                            {formatDistanceToNow(item.expiry)}
                        </Typography>
                    </Box>
                </DetailRow>

                <DetailRow label={counterparty.label}>
                    <CopyableIdentifier
                        value={counterparty.value}
                        maxLength={12}
                    />
                </DetailRow>

                <DetailRow label="Description">
                    <DescriptionText value={item.message} />
                </DetailRow>

                <DetailRow label="Contract ID">
                    <CopyableIdentifier
                        value={item.contractId}
                        maxLength={28}
                    />
                </DetailRow>
            </Box>

            {awaiting.length > 0 && (
                <AwaitingActions
                    awaiting={awaiting}
                    party={item.currentPartyId}
                />
            )}

            {available.length > 0 && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${available.length}, 1fr)`,
                        gap: 2,
                    }}
                >
                    {available.map((availability) => (
                        <PillButton
                            key={availability.action}
                            {...BUTTON_PROPS[availability.action]}
                            disabled={isLoading}
                            onClick={() => onAction(item, availability)}
                            sx={{ py: 1.25, fontSize: 18 }}
                        >
                            {isLoading ? (
                                <CircularProgress
                                    size={24}
                                    color="inherit"
                                ></CircularProgress>
                            ) : (
                                availability.status
                            )}
                        </PillButton>
                    ))}
                </Box>
            )}
        </Box>
    )
}

interface DetailRowProps {
    label: string
    children: ReactNode
}

function DetailRow({ label, children }: DetailRowProps) {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(140px, 0.45fr) minmax(0, 1fr)',
                alignItems: 'center',
                gap: 2,
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:first-of-type': { pt: 0 },
            }}
        >
            <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, textTransform: 'uppercase' }}
            >
                {label}
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    minWidth: 0,
                    '& .MuiTypography-root': {
                        fontSize: 16,
                    },
                }}
            >
                {children}
            </Box>
        </Box>
    )
}
