// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Box, Typography } from '@mui/material'
import { CopyableIdentifier } from '@components/copyable-identifier'
import { PillButton } from '@components/ui/PillButton'
import { formatIsoDateTime } from '@utils/date-format'
import type { SubmittedTransfer } from './transfer-types'

interface TransferSummaryProps {
    transfer: SubmittedTransfer
    onDone: () => void
}

export const TransferSummary: React.FC<TransferSummaryProps> = ({
    transfer,
    onDone,
}) => {
    const symbol = transfer.instrumentSymbol ?? transfer.instrumentId.id

    return (
        <Box sx={{ px: 3, pt: 3.5, pb: 3.5 }}>
            {/* TODO: Once we have an event for the success and failure flows from WG, we should make this page dynamic */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                {/* <CheckCircleIcon */}
                {/*     sx={{ color: 'success.main', fontSize: 40, mb: 2 }} */}
                {/* /> */}
                <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                        mb: 2,
                        color: 'text.primary',
                        fontWeight: 700,
                    }}
                >
                    Transfer Summary
                </Typography>
                {/* <Typography */}
                {/*     sx={{ */}
                {/*         color: 'text.secondary', */}
                {/*     }} */}
                {/* > */}
                {/*     Please review the offer details in your signing provider to */}
                {/*     complete the transfer */}
                {/* </Typography> */}
            </Box>

            <Box sx={{ mb: 3 }}>
                <SummaryRow
                    label="Amount"
                    value={`-${transfer.amount} ${symbol}`}
                    valueColor="error.main"
                />
                <SummaryRow
                    label="Date"
                    value={formatIsoDateTime(transfer.submittedAt)}
                />
                <SummaryRow
                    label="Expiration"
                    value={formatIsoDateTime(transfer.expiry)}
                />
                <SummaryRow
                    label="Recipient"
                    value={
                        <CopyableIdentifier
                            value={transfer.recipient}
                            maxLength={18}
                        />
                    }
                />
                {transfer.memo && (
                    <SummaryRow label="Description" value={transfer.memo} />
                )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <PillButton
                    onClick={onDone}
                    sx={{ minWidth: 180, minHeight: 48 }}
                >
                    Close
                </PillButton>
            </Box>
        </Box>
    )
}

interface SummaryRowProps {
    label: string
    value: React.ReactNode
    valueColor?: string
}

const SummaryRow: React.FC<SummaryRowProps> = ({
    label,
    value,
    valueColor = 'text.secondary',
}) => (
    <Box
        sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '150px minmax(0, 1fr)' },
            alignItems: 'center',
            gap: { xs: 1, sm: 3 },
            minHeight: 64,
            py: 1.75,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
    >
        <Typography
            sx={{
                color: 'text.primary',
                fontWeight: 800,
                textTransform: 'uppercase',
            }}
        >
            {label}
        </Typography>
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                minWidth: 0,
                gap: 1,
            }}
        >
            {typeof value === 'string' ? (
                <Typography
                    sx={{
                        minWidth: 0,
                        color: valueColor,
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textAlign: { xs: 'left', sm: 'right' },
                    }}
                >
                    {value}
                </Typography>
            ) : (
                value
            )}
        </Box>
    </Box>
)
