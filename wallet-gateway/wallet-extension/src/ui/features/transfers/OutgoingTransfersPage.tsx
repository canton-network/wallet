// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PageHeader } from '@canton-network/core-wallet-ui-components/react'
import {
    canWithdraw,
    useExerciseTransfer,
    useOutgoingTransfers,
    useTokenContext,
    type OutgoingTransfer,
} from '@canton-network/core-wallet-ui-components/react/token'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { ButtonLink } from '@/ui/components/ButtonLink.tsx'
import { PageLoader } from '@/ui/components/feedback.tsx'
import { toTokenWallets } from '@/ui/features/assets/index.ts'
import { walletsQuery } from '@/ui/features/parties/index.ts'

export function OutgoingTransfersPage() {
    const wallets = useQuery(walletsQuery())
    const tokenWallets = useMemo(
        () => toTokenWallets(wallets.data ?? []),
        [wallets.data]
    )
    const [selected, setSelected] = useState<string>()
    const partyId =
        selected ??
        (tokenWallets.find((wallet) => wallet.primary) ?? tokenWallets[0])
            ?.partyId

    return (
        <>
            <PageHeader heading="Outgoing transfers">
                <ButtonLink to="/assets" size="small" startIcon={<ArrowBack />}>
                    Assets
                </ButtonLink>
            </PageHeader>

            {wallets.isError ? (
                <Alert severity="error">
                    Couldn't load the parties. {wallets.error.message}
                </Alert>
            ) : wallets.isPending ? (
                <PageLoader />
            ) : !partyId ? (
                <Alert severity="info">You have no allocated parties.</Alert>
            ) : (
                <Stack spacing={2}>
                    <TextField
                        select
                        label="Party"
                        value={partyId}
                        onChange={(event) => setSelected(event.target.value)}
                    >
                        {tokenWallets.map((wallet) => (
                            <MenuItem
                                key={wallet.partyId}
                                value={wallet.partyId}
                            >
                                {wallet.hint}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Transfers partyId={partyId} />
                </Stack>
            )}
        </>
    )
}

function Transfers({ partyId }: { partyId: string }) {
    const outgoing = useOutgoingTransfers(partyId)
    const [withdrawing, setWithdrawing] = useState<OutgoingTransfer>()

    const retry = (
        <Button color="inherit" size="small" onClick={outgoing.refetch}>
            Retry
        </Button>
    )
    const failures = outgoing.failures.map(
        ({ version, error }) =>
            `Couldn't load the token standard ${version} transfers. ${error.message}`
    )

    if (outgoing.isError) {
        return (
            <Alert severity="error" action={retry}>
                {failures.join(' ')}
            </Alert>
        )
    }
    if (outgoing.isLoading) return <PageLoader />

    return (
        <>
            {failures.length > 0 && (
                <Alert severity="warning" action={retry}>
                    {failures.join(' ')}
                </Alert>
            )}
            {outgoing.transfers.length === 0 && (
                <Alert severity="info">
                    No transfers wait for their receiver.
                </Alert>
            )}
            {outgoing.transfers.map((transfer) => (
                <TransferCard
                    key={transfer.contractId}
                    transfer={transfer}
                    canWithdraw={canWithdraw(partyId, transfer)}
                    onWithdraw={() => setWithdrawing(transfer)}
                />
            ))}
            {withdrawing && (
                <WithdrawDialog
                    partyId={partyId}
                    transfer={withdrawing}
                    onClose={() => setWithdrawing(undefined)}
                />
            )}
        </>
    )
}

function useSymbol({ instrumentId }: OutgoingTransfer): string {
    const { instruments } = useTokenContext()
    return (
        instruments
            .get(instrumentId.admin)
            ?.find((instrument) => instrument.id === instrumentId.id)?.symbol ??
        instrumentId.id
    )
}

function TransferCard({
    transfer,
    canWithdraw,
    onWithdraw,
}: {
    transfer: OutgoingTransfer
    canWithdraw: boolean
    onWithdraw: () => void
}) {
    const symbol = useSymbol(transfer)
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="subtitle1" component="h2">
                    {transfer.amount} {symbol}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    To {transfer.receiver}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Expires {new Date(transfer.executeBefore).toLocaleString()}
                </Typography>
                {canWithdraw ? (
                    <Button size="small" sx={{ mt: 1 }} onClick={onWithdraw}>
                        Withdraw
                    </Button>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        This transfer doesn't let your party withdraw it alone.
                    </Typography>
                )}
            </CardContent>
        </Card>
    )
}

function WithdrawDialog({
    partyId,
    transfer,
    onClose,
}: {
    partyId: string
    transfer: OutgoingTransfer
    onClose: () => void
}) {
    const exercise = useExerciseTransfer()
    const symbol = useSymbol(transfer)

    const withdraw = () =>
        exercise.mutate(
            {
                party: partyId,
                contractId: transfer.contractId,
                instrumentId: transfer.instrumentId,
                instructionChoice: 'Withdraw',
                version: transfer.version,
            },
            { onSuccess: onClose }
        )

    return (
        <Dialog open onClose={exercise.isPending ? undefined : onClose}>
            <DialogTitle>Withdraw this transfer?</DialogTitle>
            <DialogContent>
                <Typography sx={{ wordBreak: 'break-all' }}>
                    {transfer.amount} {symbol} to {transfer.receiver} goes back
                    to your party.
                </Typography>
                {exercise.isError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        The withdrawal failed: {exercise.error.message}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={exercise.isPending}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={withdraw}
                    loading={exercise.isPending}
                >
                    Withdraw
                </Button>
            </DialogActions>
        </Dialog>
    )
}
