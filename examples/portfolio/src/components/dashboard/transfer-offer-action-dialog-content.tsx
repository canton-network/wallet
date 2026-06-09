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
import type { ReactNode } from 'react'
import { CopyableIdentifier } from '@components/copyable-identifier'
import { PillButton } from '@components/ui/PillButton'
import type { TransferActionItem } from '@components/types'
import { getCounterparty, isReceiver } from '@components/utils'
import {
    formatDistanceToNow,
    formatIsoDateTimeString,
} from '@utils/date-format'
import { formatAmount } from '@utils/decimal'

interface TransferOfferActionDialogContentProps {
    item: TransferActionItem
    isLoading: boolean
    onClose: () => void
    onAction: (
        item: TransferActionItem,
        action: 'Accept' | 'Reject' | 'Withdraw'
    ) => void
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
                            {formatIsoDateTimeString(item.expiry)}
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
                    <Typography
                        sx={{ textAlign: 'right', wordBreak: 'break-word' }}
                    >
                        {item.message || '—'}
                    </Typography>
                </DetailRow>

                <DetailRow label="Contract ID">
                    <CopyableIdentifier
                        value={item.contractId}
                        maxLength={28}
                    />
                </DetailRow>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: received ? '1fr 1fr' : '1fr',
                    gap: 2,
                }}
            >
                {received ? (
                    <>
                        <PillButton
                            tone="danger"
                            disabled={isLoading}
                            onClick={() => onAction(item, 'Reject')}
                            sx={{ py: 1.25, fontSize: 18 }}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Reject'
                            )}
                        </PillButton>
                        <PillButton
                            disabled={isLoading}
                            onClick={() => onAction(item, 'Accept')}
                            sx={{ py: 1.25, fontSize: 18 }}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Accept'
                            )}
                        </PillButton>
                    </>
                ) : (
                    <PillButton
                        variant="outlined"
                        color="warning"
                        disabled={isLoading}
                        onClick={() => onAction(item, 'Withdraw')}
                        sx={{ py: 1.25, fontSize: 18 }}
                    >
                        {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Withdraw'
                        )}
                    </PillButton>
                )}
            </Box>
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
