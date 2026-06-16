// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState, type ReactNode } from 'react'
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    IconButton,
    Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Decimal from 'decimal.js'
import { CopyableIdentifier } from '@components/copyable-identifier'
import type {
    AllocationActionItem,
    TransferLegWithAllocation,
} from '@components/types'
import { PillButton } from '@components/ui/PillButton'
import { isReceiverOfLeg, isSenderOfLeg } from '@components/utils'
import { useAggregatedHoldings } from '@hooks/useAggregatedHoldings'
import {
    getInstrumentKey,
    type AggregatedHolding,
} from '@utils/aggregate-holdings'
import { formatAmount } from '@utils/decimal'
import {
    formatDistanceToNow,
    formatIsoDateTimeString,
} from '@utils/date-format'

interface AllocationActionDialogContentProps {
    item: AllocationActionItem
    isLoading: boolean
    loadingLegId: string | null
    failedLegId: string | null
    allocationError: string | null
    onClose: () => void
    onCreateAllocation: (leg: TransferLegWithAllocation) => void
    onWithdrawAllocation: (
        leg: TransferLegWithAllocation,
        allocationContractId: string
    ) => void
}

export function AllocationActionDialogContent({
    item,
    isLoading,
    loadingLegId,
    failedLegId,
    allocationError,
    onClose,
    onCreateAllocation,
    onWithdrawAllocation,
}: AllocationActionDialogContentProps) {
    const [expandedLegIds, setExpandedLegIds] = useState(
        () => new Set(item.transferLegs.map((leg) => leg.transferLegId))
    )
    const { instruments: availableHoldings, isLoading: isHoldingsLoading } =
        useAggregatedHoldings(item.currentPartyId)
    const insufficientLegIds = useMemo(
        () =>
            isHoldingsLoading
                ? new Set<string>()
                : getInsufficientLegIds(item, availableHoldings),
        [availableHoldings, isHoldingsLoading, item]
    )
    const allLegsExpanded = expandedLegIds.size === item.transferLegs.length

    const toggleAllLegs = () => {
        setExpandedLegIds(
            allLegsExpanded
                ? new Set()
                : new Set(item.transferLegs.map((leg) => leg.transferLegId))
        )
    }

    const toggleLeg = (transferLegId: string) => {
        setExpandedLegIds((current) => {
            const next = new Set(current)
            if (next.has(transferLegId)) {
                next.delete(transferLegId)
            } else {
                next.add(transferLegId)
            }
            return next
        })
    }

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
                <Typography variant="h4" component="h1">
                    Allocation Request
                </Typography>
                <IconButton
                    aria-label="Close allocation request dialog"
                    disabled={isLoading}
                    onClick={onClose}
                    size="small"
                    sx={{ color: 'secondary.main' }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box sx={{ display: 'grid' }}>
                <DetailRow label="Executor Party">
                    <CopyableIdentifier
                        value={item.settlement.executor}
                        maxLength={14}
                    />
                </DetailRow>
                <DetailRow label="Allocate Before">
                    <Typography variant="body1">
                        {formatIsoDateTimeString(
                            item.settlement.allocateBefore
                        )}{' '}
                        ({formatDistanceToNow(item.settlement.allocateBefore)})
                    </Typography>
                </DetailRow>
                <DetailRow label="Settlement Reference">
                    <CopyableIdentifier
                        value={item.settlement.settlementRef.id}
                        maxLength={14}
                    />
                </DetailRow>
                <DetailRow label="Contract ID">
                    <CopyableIdentifier
                        value={item.contractId}
                        maxLength={14}
                    />
                </DetailRow>
            </Box>

            <Box sx={{ display: 'grid', gap: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                    }}
                >
                    <Typography variant="h5" component="h2">
                        Transfer legs
                    </Typography>
                    <Button
                        type="button"
                        variant="text"
                        size="small"
                        onClick={toggleAllLegs}
                        sx={{ color: 'secondary.main', flexShrink: 0 }}
                    >
                        {allLegsExpanded ? 'Collapse all' : 'Expand all'}
                    </Button>
                </Box>

                <Box sx={{ display: 'grid', gap: 2 }}>
                    {item.transferLegs.map((leg, index) => (
                        <TransferLegCard
                            key={leg.transferLegId}
                            index={index}
                            item={item}
                            leg={leg}
                            isExpanded={expandedLegIds.has(leg.transferLegId)}
                            isLoading={isLoading}
                            isLegLoading={loadingLegId === leg.transferLegId}
                            error={
                                failedLegId === leg.transferLegId
                                    ? allocationError
                                    : insufficientLegIds.has(leg.transferLegId)
                                      ? 'Cannot allocate due to insufficient funds.'
                                      : null
                            }
                            onToggle={() => toggleLeg(leg.transferLegId)}
                            onCreateAllocation={() => onCreateAllocation(leg)}
                            onWithdrawAllocation={(contractId) =>
                                onWithdrawAllocation(leg, contractId)
                            }
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    )
}

interface TransferLegCardProps {
    index: number
    item: AllocationActionItem
    leg: TransferLegWithAllocation
    isExpanded: boolean
    isLoading: boolean
    isLegLoading: boolean
    error: string | null
    onToggle: () => void
    onCreateAllocation: () => void
    onWithdrawAllocation: (allocationContractId: string) => void
}

function TransferLegCard({
    index,
    item,
    leg,
    isExpanded,
    isLoading,
    isLegLoading,
    error,
    onToggle,
    onCreateAllocation,
    onWithdrawAllocation,
}: TransferLegCardProps) {
    const isSender = isSenderOfLeg(item.currentPartyId, leg)
    const isReceiver = isReceiverOfLeg(item.currentPartyId, leg)
    const hasAllocation = leg.allocations.length > 0
    const allocationContractId = leg.allocations[0]?.contractId
    const canCreateAllocation = isSender && !hasAllocation
    const canWithdrawAllocation =
        isSender && hasAllocation && allocationContractId
    const actionDisabled = isLoading || Boolean(error)

    return (
        <Box
            sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
            }}
        >
            {error ? (
                <Alert
                    severity="error"
                    icon={<InfoOutlinedIcon fontSize="inherit" />}
                    sx={{
                        m: 2,
                        alignItems: 'center',
                        bgcolor: 'transparent',
                        color: 'error.main',
                        border: '2px solid',
                        borderColor: 'error.main',
                        borderRadius: 1,
                        '& .MuiAlert-message': {
                            color: 'text.primary',
                            fontSize: 18,
                        },
                    }}
                >
                    {error}
                </Alert>
            ) : null}

            <Box sx={{ px: 2, py: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            minWidth: 0,
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 800, textTransform: 'uppercase' }}
                        >
                            Transfer leg {index + 1}
                        </Typography>
                        <DirectionChip
                            isSender={isSender}
                            isReceiver={isReceiver}
                        />
                    </Box>
                    <IconButton
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} transfer leg ${index + 1}`}
                        onClick={onToggle}
                        size="small"
                        sx={{
                            color: 'secondary.main',
                            transform: isExpanded
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                            transition: (theme) =>
                                theme.transitions.create('transform', {
                                    duration: theme.transitions.duration.short,
                                }),
                        }}
                    >
                        <ExpandMoreIcon />
                    </IconButton>
                </Box>

                <Collapse in={isExpanded} timeout={180} unmountOnExit>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: { xs: 'stretch', md: 'end' },
                            gap: { xs: 2, md: 3 },
                            pt: 3,
                        }}
                    >
                        <Box
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, minmax(0, 1fr))',
                                    md: 'repeat(4, minmax(0, 1fr))',
                                },
                                columnGap: { xs: 2, md: 3 },
                                rowGap: 2,
                                alignItems: 'end',
                            }}
                        >
                            <LegField label="Amount">
                                <Typography
                                    sx={{
                                        color: getAmountColor(
                                            isSender,
                                            isReceiver
                                        ),
                                        fontSize: 18,
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {formatSignedLegAmount(
                                        leg,
                                        isSender,
                                        isReceiver
                                    )}
                                </Typography>
                            </LegField>
                            <LegField
                                label="Sender"
                                badge={isSender ? 'You' : undefined}
                            >
                                <CopyableIdentifier
                                    value={leg.transferLeg.sender}
                                    maxLength={10}
                                />
                            </LegField>
                            <LegField
                                label="Recipient"
                                badge={isReceiver ? 'You' : undefined}
                            >
                                <CopyableIdentifier
                                    value={leg.transferLeg.receiver}
                                    maxLength={10}
                                />
                            </LegField>
                            <LegField label="ID">
                                <CopyableIdentifier
                                    value={leg.transferLegId}
                                    maxLength={10}
                                />
                            </LegField>
                        </Box>

                        <Box
                            sx={{
                                flexShrink: 0,
                                display: 'flex',
                                justifyContent: {
                                    xs: 'flex-start',
                                    md: 'flex-end',
                                },
                                width: { xs: 'auto', md: 112 },
                            }}
                        >
                            {canCreateAllocation ? (
                                <PillButton
                                    disabled={actionDisabled}
                                    onClick={onCreateAllocation}
                                    sx={{ minWidth: 104, px: 2, fontSize: 16 }}
                                >
                                    {isLegLoading ? (
                                        <CircularProgress
                                            size={22}
                                            color="inherit"
                                        />
                                    ) : (
                                        'Allocate'
                                    )}
                                </PillButton>
                            ) : null}
                            {canWithdrawAllocation ? (
                                <PillButton
                                    variant="outlined"
                                    color="warning"
                                    disabled={isLoading}
                                    onClick={() =>
                                        onWithdrawAllocation(
                                            allocationContractId
                                        )
                                    }
                                    sx={{ minWidth: 104, px: 2, fontSize: 16 }}
                                >
                                    {isLegLoading ? (
                                        <CircularProgress
                                            size={22}
                                            color="inherit"
                                        />
                                    ) : (
                                        'Withdraw'
                                    )}
                                </PillButton>
                            ) : null}
                        </Box>
                    </Box>
                </Collapse>
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

interface LegFieldProps {
    label: string
    badge?: string
    children: ReactNode
}

function LegField({ label, badge, children }: LegFieldProps) {
    return (
        <Box sx={{ minWidth: 0 }}>
            <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
            >
                <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 800, textTransform: 'uppercase' }}
                >
                    {label}
                </Typography>
                {badge ? <SubtleChip label={badge} /> : null}
            </Box>
            {children}
        </Box>
    )
}

function DirectionChip({
    isSender,
    isReceiver,
}: {
    isSender: boolean
    isReceiver: boolean
}) {
    if (isSender && isReceiver) return <SubtleChip label="Self-transfer" />
    if (isSender) return <SubtleChip label="You send ↗" />
    if (isReceiver) return <SubtleChip label="You receive ↘" />
    return null
}

function SubtleChip({ label }: { label: string }) {
    return (
        <Chip
            label={label}
            size="small"
            sx={{
                height: 24,
                bgcolor: 'action.selected',
                color: 'text.secondary',
                fontSize: 14,
                '& .MuiChip-label': { px: 1 },
            }}
        />
    )
}

function getInsufficientLegIds(
    item: AllocationActionItem,
    availableHoldings: AggregatedHolding[]
) {
    return new Set(
        item.transferLegs
            .filter((leg) => {
                if (
                    !isSenderOfLeg(item.currentPartyId, leg) ||
                    leg.allocations.length
                ) {
                    return false
                }

                const availableAmount =
                    availableHoldings.find(
                        (holding) =>
                            getInstrumentKey(holding.instrumentId) ===
                            getInstrumentKey(leg.transferLeg.instrumentId)
                    )?.availableAmount ?? '0'

                return new Decimal(availableAmount).lt(leg.transferLeg.amount)
            })
            .map((leg) => leg.transferLegId)
    )
}

function getAmountColor(isSender: boolean, isReceiver: boolean) {
    if (isSender && !isReceiver) return 'error.main'
    if (isReceiver && !isSender) return 'success.main'
    return 'text.primary'
}

function formatSignedLegAmount(
    leg: TransferLegWithAllocation,
    isSender: boolean,
    isReceiver: boolean
) {
    const prefix = isSender && !isReceiver ? '-' : isReceiver ? '+' : ''
    return `${prefix}${formatAmount(leg.transferLeg.amount)} ${leg.transferLeg.instrumentId.id}`
}
