// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
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

import { useSymbol } from './useSymbol.ts'

const TEXTS: Record<
    TransferInstructionChoice,
    {
        title: string
        failure: string
        outcome: (amount: string, transfer: PendingTransfer) => string
    }
> = {
    Accept: {
        title: 'Accept this transfer?',
        failure: 'The acceptance failed',
        outcome: (amount, { sender }) =>
            `${amount} from ${sender} goes to your party.`,
    },
    Reject: {
        title: 'Reject this transfer?',
        failure: 'The rejection failed',
        outcome: (amount, { sender }) => `${amount} goes back to ${sender}.`,
    },
    Withdraw: {
        title: 'Withdraw this transfer?',
        failure: 'The withdrawal failed',
        outcome: (amount, { receiver }) =>
            `${amount} to ${receiver} goes back to your party.`,
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
    const symbol = useSymbol(transfer)
    const texts = TEXTS[choice]

    const confirm = () =>
        exercise.mutate(
            {
                party: partyId,
                contractId: transfer.contractId,
                instrumentId: transfer.instrumentId,
                instructionChoice: choice,
                version: transfer.version,
            },
            { onSuccess: onClose }
        )

    return (
        <Dialog open onClose={exercise.isPending ? undefined : onClose}>
            <DialogTitle>{texts.title}</DialogTitle>
            <DialogContent>
                <Typography sx={{ wordBreak: 'break-all' }}>
                    {texts.outcome(`${transfer.amount} ${symbol}`, transfer)}
                </Typography>
                {exercise.isError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {texts.failure}: {exercise.error.message}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
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
            </DialogActions>
        </Dialog>
    )
}
