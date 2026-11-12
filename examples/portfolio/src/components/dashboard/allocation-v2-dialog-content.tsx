// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react'
import {
    Alert,
    AlertTitle,
    Box,
    CircularProgress,
    Typography,
} from '@mui/material'
import type { PartyId } from '@canton-network/core-types'
import { PillButton } from '@components/ui/PillButton'
import type { AllocationV2ActionItem } from '@components/types'
import { isExpired } from '@utils/date-format'
import { getAllocationActions, netAmounts } from '@utils/v2-allocation-items'
import {
    AmountList,
    DetailRow,
    DialogHeader,
    LegList,
    LockedAmounts,
    SettlementRows,
    TimeWithDistance,
} from './allocation-v2-dialog-parts'

interface AllocationV2DialogContentProps {
    item: AllocationV2ActionItem
    isLoading: boolean
    error: string | null
    onClose: () => void
    onWithdraw: () => void
}

export function AllocationV2DialogContent({
    item,
    isLoading,
    error,
    onClose,
    onWithdraw,
}: AllocationV2DialogContentProps) {
    const [confirming, setConfirming] = useState(false)
    const party = item.currentPartyId as PartyId
    const spec = item.allocation
    const deadline = spec.settlementDeadline ?? null
    const pastDeadline = deadline !== null && isExpired(deadline)

    const withdraw = getAllocationActions(item).find(
        (a) => a.action === 'Withdraw'
    )
    const canWithdraw = withdraw?.status === 'available'

    return (
        <Box sx={{ display: 'grid', gap: 3 }}>
            <DialogHeader
                title="Allocation"
                closeLabel="Close allocation dialog"
                disabled={isLoading}
                onClose={onClose}
            />

            <Typography color="text.secondary">
                {pastDeadline
                    ? 'The settlement deadline has passed, so this allocation can no longer be settled. Withdraw it to release the funds.'
                    : 'Your funds are reserved for this trade. The venue settles once every party has allocated.'}
            </Typography>

            <Box sx={{ display: 'grid' }}>
                <DetailRow label="You Lock">
                    <LockedAmounts specs={[item.allocation]}></LockedAmounts>
                </DetailRow>
                <DetailRow label="Net effect at settlement">
                    <AmountList amounts={netAmounts([spec])} signed />
                </DetailRow>
                <SettlementRows settlement={item.settlement} />
                <DetailRow label="Settlement deadline">
                    {deadline ? (
                        <TimeWithDistance value={deadline} />
                    ) : (
                        <Typography>None</Typography>
                    )}
                </DetailRow>
                {item.expiresAt && (
                    <DetailRow label="Expires if inactive">
                        <TimeWithDistance value={item.expiresAt} />
                    </DetailRow>
                )}
                {item.numIterations > 0 && (
                    <DetailRow label="Settled so far">
                        <Typography>
                            {item.numIterations}{' '}
                            {item.numIterations === 1 ? 'time' : 'times'}
                        </Typography>
                    </DetailRow>
                )}
            </Box>

            <LegList specs={[spec]} title="Your transfers in this trade" />

            {error && <Alert severity="error">{error}</Alert>}

            {/* Why there is no withdraw button, when there isn't */}
            {!canWithdraw && spec.committed && !pastDeadline && (
                <Alert severity="info">
                    You committed to this allocation, so it can't be withdrawn
                    before the settlement deadline
                    {deadline ? '' : ' (none is set)'}.
                </Alert>
            )}
            {!canWithdraw &&
                !spec.committed &&
                withdraw?.status === 'awaiting' && (
                    <Typography variant="body2" color="text.secondary">
                        Withdraw: also needs{' '}
                        {[...new Set(withdraw.groups.flat())]
                            .filter((p) => p !== party)
                            .join(', ')}
                    </Typography>
                )}

            {canWithdraw &&
                (confirming ? (
                    <Box sx={{ display: 'grid', gap: 2 }}>
                        <Alert
                            severity="warning"
                            sx={{
                                py: 2,
                                '& .MuiAlert-message': { fontSize: 16 },
                            }}
                        >
                            <AlertTitle sx={{ fontSize: 18, fontWeight: 700 }}>
                                Reject this allocation?
                            </AlertTitle>
                            Your funds will be released. The trade can't settle
                            without this allocation, and the request can't be
                            accepted again; the venue would have to send a new
                            one.
                        </Alert>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 2,
                            }}
                        >
                            <PillButton
                                variant="outlined"
                                disabled={isLoading}
                                onClick={() => setConfirming(false)}
                                sx={{ py: 1.25, fontSize: 18 }}
                            >
                                Keep allocation
                            </PillButton>
                            <PillButton
                                tone="danger"
                                disabled={isLoading}
                                onClick={onWithdraw}
                                sx={{ py: 1.25, fontSize: 18 }}
                            >
                                {isLoading ? (
                                    <CircularProgress
                                        size={24}
                                        color="inherit"
                                    />
                                ) : (
                                    'Reject allocation'
                                )}
                            </PillButton>
                        </Box>
                    </Box>
                ) : (
                    <PillButton
                        variant="outlined"
                        color="warning"
                        disabled={isLoading}
                        onClick={() => setConfirming(true)}
                        sx={{ py: 1.25, fontSize: 18 }}
                    >
                        Reject allocation
                    </PillButton>
                ))}
        </Box>
    )
}
