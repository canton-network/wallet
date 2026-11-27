// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    tokenQueryKeys,
    useExerciseTransfer,
    type PendingTransfer,
    type TransferInstructionChoice,
} from '@canton-network/core-wallet-ui-components/react/token'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { isNotSubmitted } from '@/shared/transfer-errors.ts'

import { partyLabel } from './party-label.ts'
import { hasExpired, useHasExpired } from './useHasExpired.ts'
import { useSymbol } from './useSymbol.ts'

const TEXTS: Record<
    TransferInstructionChoice,
    {
        title: string
        /** What the choice is called after "The". */
        noun: string
        outcome: (amount: string, transfer: PendingTransfer) => string
    }
> = {
    Accept: {
        title: 'Accept this transfer?',
        noun: 'acceptance',
        outcome: (amount, { sender }) =>
            `${amount} from ${partyLabel(sender)} goes to your party.`,
    },
    Reject: {
        title: 'Reject this transfer?',
        noun: 'rejection',
        outcome: (amount, { sender }) =>
            `${amount} goes back to ${partyLabel(sender)}.`,
    },
    Withdraw: {
        title: 'Withdraw this transfer?',
        noun: 'withdrawal',
        outcome: (amount, { receiver }) =>
            `${amount} to ${partyLabel(receiver)} goes back to your party.`,
    },
}

/** Confirms a choice on a pending transfer, then exercises it. */
export function TransferChoiceDialog({
    partyId,
    transfer,
    choice,
    onClose,
}: {
    partyId: string
    transfer: PendingTransfer
    choice: TransferInstructionChoice
    onClose: () => void
}) {
    const exercise = useExerciseTransfer()
    const queryClient = useQueryClient()
    const symbol = useSymbol(transfer)
    const texts = TEXTS[choice]
    // The timer can fire late, for example after the computer slept, so
    // confirming checks the deadline again.
    const [expiredOnConfirm, setExpiredOnConfirm] = useState(false)
    const expired = useHasExpired(transfer.executeBefore) || expiredOnConfirm
    const acceptExpired = choice === 'Accept' && expired
    const unknownOutcome = exercise.isError && !isNotSubmitted(exercise.error)

    const confirm = () => {
        if (choice === 'Accept' && hasExpired(transfer.executeBefore)) {
            setExpiredOnConfirm(true)
            return
        }
        exercise.mutate(
            {
                party: partyId,
                contractId: transfer.contractId,
                instrumentId: transfer.instrumentId,
                instructionChoice: choice,
                version: transfer.version,
            },
            {
                onSuccess: onClose,
                onError: (error) => {
                    if (isNotSubmitted(error)) return
                    // It may have executed: show what the ledger has now.
                    void queryClient.invalidateQueries({
                        queryKey: tokenQueryKeys.pendingTransfers.all,
                    })
                    void queryClient.invalidateQueries({
                        queryKey: tokenQueryKeys.holdings.all,
                    })
                },
            }
        )
    }

    return (
        <Dialog open onClose={exercise.isPending ? undefined : onClose}>
            <DialogTitle>{texts.title}</DialogTitle>
            <DialogContent>
                <Typography sx={{ wordBreak: 'break-all' }}>
                    {texts.outcome(`${transfer.amount} ${symbol}`, transfer)}
                </Typography>
                {unknownOutcome ? (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        We couldn't confirm whether the {texts.noun} went
                        through. {exercise.error.message} Check your transfers
                        and your assets before you try again.
                    </Alert>
                ) : (
                    exercise.isError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            The {texts.noun} failed: {exercise.error.message}
                        </Alert>
                    )
                )}
                {acceptExpired && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        This transfer expired, so your party can no longer
                        accept it.
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                {unknownOutcome || acceptExpired ? (
                    <Button onClick={onClose}>Close</Button>
                ) : (
                    <>
                        <Button onClick={onClose} disabled={exercise.isPending}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={confirm}
                            loading={exercise.isPending}
                        >
                            {choice}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    )
}
