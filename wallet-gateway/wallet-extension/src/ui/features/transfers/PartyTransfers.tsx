// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PageHeader } from '@canton-network/core-wallet-ui-components/react'
import type {
    PendingTransfer,
    PendingTransfersResult,
} from '@canton-network/core-wallet-ui-components/react/token'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useQuery } from '@tanstack/react-query'
import { Fragment, useMemo, useState, type ReactNode } from 'react'

import { PageLoader } from '@/ui/components/feedback.tsx'
import { toTokenWallets } from '@/ui/features/assets/index.ts'
import { walletsQuery } from '@/ui/features/parties/index.ts'

import { isActionable } from './is-actionable.ts'

/** A transfers page for one of the user's parties, the primary by default. */
export function PartyTransfersPage({
    heading,
    children,
}: {
    heading: string
    children: (partyId: string) => ReactNode
}) {
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
            <PageHeader heading={heading} />

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
                    {/* A new party drops the old one's unsubmitted dialog. */}
                    <Fragment key={partyId}>{children(partyId)}</Fragment>
                </Stack>
            )}
        </>
    )
}

/**
 * The loaded transfers, with an alert for the versions that failed and,
 * when none loaded, `No transfers wait for {waitingFor}.`
 */
export function TransferList({
    pending,
    waitingFor,
    children,
}: {
    pending: PendingTransfersResult
    waitingFor: string
    children: (transfer: PendingTransfer, actionable: boolean) => ReactNode
}) {
    const retry = (
        <Button color="inherit" size="small" onClick={pending.refetch}>
            Retry
        </Button>
    )
    const failures = pending.failures.map(
        ({ version, error }) =>
            `Couldn't load the token standard ${version} transfers. ${error.message}`
    )

    const loaded = (['v1', 'v2'] as const).filter(
        (version) =>
            !pending.failures.some((failure) => failure.version === version)
    )

    if (pending.isError) {
        return (
            <Alert severity="error" action={retry}>
                {failures.join(' ')}
            </Alert>
        )
    }
    if (pending.isLoading) return <PageLoader />

    return (
        <>
            {failures.length > 0 && (
                <Alert severity="warning" action={retry}>
                    {failures.join(' ')}
                </Alert>
            )}
            {pending.transfers.length === 0 && (
                <Alert severity="info">
                    {failures.length === 0
                        ? `No transfers wait for ${waitingFor}.`
                        : `No token standard ${loaded.join(' or ')} transfers wait for ${waitingFor}.`}
                </Alert>
            )}
            {pending.transfers.map((transfer) =>
                children(transfer, isActionable(pending, transfer))
            )}
        </>
    )
}
