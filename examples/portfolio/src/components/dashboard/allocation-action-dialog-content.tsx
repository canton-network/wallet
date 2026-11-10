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
    AllocationRequestV2ActionItem,
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
import { formatDistanceToNow } from '@utils/date-format'
import { DateTimeText } from '@components/date-time-text'
import type { AcceptProgress } from '@hooks/useAllocationRequestV2Actions'
import type { PartyId } from '@canton-network/core-types'
import {
    amountsToLock,
    earliest,
    getAllocationRequestActions,
    netAmounts,
    type InstrumentAmount,
} from '@utils/v2-allocation-items'

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

interface AllocationRequestV2DialogContentProps {
    item: AllocationRequestV2ActionItem
    isLoading: boolean
    progress: AcceptProgress
    error: string | null
    onClose: () => void
    onAccept: () => void
    onReject: () => void
}

export function AllocationRequestV2DialogContent({
    item,
    isLoading,
    progress,
    error,
    onClose,
    onAccept,
    onReject,
}: AllocationRequestV2DialogContentProps) {
    const party = item.currentPartyId as PartyId
    const toLock = amountsToLock(item.ownSpecs)
    const net = netAmounts(item.ownSpecs)
    const deadline = earliest(item.ownSpecs.map((s) => s.settlementDeadline))
    const committed = item.ownSpecs.some((s) => s.committed)
    const iterated = item.ownSpecs.some((s) => s.nextIterationFunding != null)
    const [venue, ...otherExecutors] = item.settlement.executors

    const actions = getAllocationRequestActions(item)
    const canAccept = actions.some(
        (a) => a.action === 'Accept' && a.status === 'available'
    )
    const canReject = actions.some(
        (a) => a.action === 'Reject' && a.status === 'available'
    )
    const awaiting = actions.filter((a) => a.status === 'awaiting')

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
                        Allocation Request
                    </Typography>
                    <Chip
                        label="V2"
                        size="small"
                        sx={{ bgcolor: 'action.selected' }}
                    />
                </Box>
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

            {/* What accepting means for the user, before any detail */}
            <Box sx={{ display: 'grid' }}>
                <DetailRow label="You lock">
                    {toLock.length === 0 ? (
                        <Typography>Nothing — you only receive</Typography>
                    ) : (
                        <AmountList amounts={toLock} />
                    )}
                </DetailRow>
                <DetailRow label="Net effect at settlement">
                    <AmountList amounts={net} signed />
                </DetailRow>
                <DetailRow label="Settlement">
                    <CopyableIdentifier
                        value={item.settlement.id}
                        maxLength={20}
                    />
                </DetailRow>
                <DetailRow
                    label={otherExecutors.length > 0 ? 'Executors' : 'Venue'}
                >
                    <Box
                        sx={{ display: 'grid', justifyItems: 'end', gap: 0.5 }}
                    >
                        {item.settlement.executors.map((executor) => (
                            <CopyableIdentifier
                                key={executor}
                                value={executor}
                                maxLength={16}
                            />
                        ))}
                        {!venue && <Typography>—</Typography>}
                    </Box>
                </DetailRow>
                {item.settleAt && (
                    <DetailRow label="Expected settlement">
                        <TimeWithDistance value={item.settleAt} />
                    </DetailRow>
                )}
                <DetailRow label="Settlement deadline">
                    {deadline ? (
                        <TimeWithDistance value={deadline} />
                    ) : (
                        <Typography>None</Typography>
                    )}
                </DetailRow>
            </Box>

            {committed && (
                <Alert severity="info">
                    The funds stay locked until the trade settles
                    {deadline ? ' or the deadline passes' : ''}. You can't
                    withdraw them before then.
                </Alert>
            )}
            {iterated && (
                <Alert severity="info">
                    This allocation can be settled more than once. Funding
                    reserved for the next round is included in the amount you
                    lock.
                </Alert>
            )}

            <Box sx={{ display: 'grid', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Your transfers in this trade
                </Typography>
                {item.ownSpecs.flatMap((spec) =>
                    spec.transferLegSides.map((leg) => (
                        <LegRow
                            key={`${spec.admin}-${leg.transferLegId}-${leg.side}`}
                            direction={
                                leg.side === 'SenderSide' ? 'send' : 'receive'
                            }
                            counterparty={leg.otherside.owner ?? '—'}
                            amount={`${formatAmount(leg.amount)} ${leg.instrumentId}`}
                            meta={leg.meta?.values ?? {}}
                        />
                    ))
                )}
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {awaiting.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                    {awaiting
                        .map(
                            (a) =>
                                `${a.action}: also needs ${[
                                    ...new Set(a.groups.flat()),
                                ]
                                    .filter((p) => p !== party)
                                    .join(', ')}`
                        )
                        .join('. ')}
                </Typography>
            )}

            {(canAccept || canReject) && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns:
                            canAccept && canReject ? '1fr 1fr' : '1fr',
                        gap: 2,
                    }}
                >
                    {canReject && (
                        <PillButton
                            tone="danger"
                            disabled={isLoading}
                            onClick={onReject}
                            sx={{ py: 1.25, fontSize: 18 }}
                        >
                            Reject
                        </PillButton>
                    )}
                    {canAccept && (
                        <PillButton
                            disabled={isLoading}
                            onClick={onAccept}
                            sx={{ py: 1.25, fontSize: 18 }}
                        >
                            {isLoading ? (
                                <ProgressLabel progress={progress} />
                            ) : (
                                'Accept'
                            )}
                        </PillButton>
                    )}
                </Box>
            )}
        </Box>
    )
}

function ProgressLabel({ progress }: { progress: AcceptProgress }) {
    const text =
        progress.phase === 'allocating'
            ? `Allocating ${progress.done + 1} of ${progress.total}`
            : progress.phase === 'accepting'
              ? 'Accepting'
              : 'Preparing'
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CircularProgress size={20} color="inherit" />
            <span>{text}</span>
        </Box>
    )
}

function AmountList({
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

function TimeWithDistance({ value }: { value: string }) {
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

function LegRow({
    direction,
    counterparty,
    amount,
    meta,
}: {
    direction: 'send' | 'receive'
    counterparty: string
    amount: string
    meta: Record<string, string>
}) {
    const metaEntries = Object.entries(meta)
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(80px, auto) minmax(0, 1fr) auto',
                alignItems: 'center',
                gap: 2,
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Typography
                sx={{
                    color: direction === 'send' ? 'error.main' : 'success.main',
                }}
            >
                {direction === 'send' ? 'You send' : 'You receive'}
            </Typography>
            <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography color="text.secondary">
                        {direction === 'send' ? 'to' : 'from'}
                    </Typography>
                    <CopyableIdentifier value={counterparty} maxLength={16} />
                </Box>
                {metaEntries.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                        {metaEntries.map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </Typography>
                )}
            </Box>
            <Typography>{amount}</Typography>
        </Box>
    )
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
                        <DateTimeText value={item.settlement.allocateBefore} />{' '}
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
            role="group"
            aria-label={`Transfer leg ${index + 1}`}
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
                                    size="small"
                                    disabled={actionDisabled}
                                    onClick={onCreateAllocation}
                                    sx={{ minWidth: 90, fontSize: 14 }}
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
                                    color="secondary"
                                    size="small"
                                    disabled={isLoading}
                                    onClick={() =>
                                        onWithdrawAllocation(
                                            allocationContractId
                                        )
                                    }
                                    sx={{ minWidth: 90, fontSize: 14 }}
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
    return item.transferLegs.reduce((insufficientLegIds, leg) => {
        if (
            !isSenderOfLeg(item.currentPartyId, leg) ||
            leg.allocations.length
        ) {
            return insufficientLegIds
        }

        const availableAmount =
            availableHoldings.find(
                (holding) =>
                    getInstrumentKey(holding.instrumentId) ===
                    getInstrumentKey(leg.transferLeg.instrumentId)
            )?.availableAmount ?? '0'

        if (new Decimal(availableAmount).lt(leg.transferLeg.amount)) {
            insufficientLegIds.add(leg.transferLegId)
        }

        return insufficientLegIds
    }, new Set<string>())
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
