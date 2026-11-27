// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { parsePreparedTransaction } from '@canton-network/core-tx-visualizer'
import { TransactionDetail } from '@canton-network/core-wallet-ui-components/react'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import type { TxApprovalDetail } from '@/background/tx-approval.ts'

import { transactionQuery, useDecideTransaction } from './api.ts'

const monospace = { fontFamily: 'monospace', wordBreak: 'break-all' } as const

export function ApproveTransactionPage({ id }: { id: string }) {
    const { data: transaction } = useSuspenseQuery(transactionQuery(id))

    return (
        <Stack spacing={2} sx={{ p: 1, maxWidth: 440, mx: 'auto' }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                Approve this transaction?
            </Typography>
            {transaction ? (
                <TransactionPrompt transaction={transaction} />
            ) : (
                <Alert severity="info">
                    This transaction is no longer waiting for an answer. It may
                    have timed out. Submit it again from the site.
                </Alert>
            )}
        </Stack>
    )
}

function TransactionPrompt({ transaction }: { transaction: TxApprovalDetail }) {
    const decide = useDecideTransaction(transaction.id)
    const parsed = useMemo(() => {
        try {
            return parsePreparedTransaction(transaction.preparedTransaction)
        } catch {
            return null
        }
    }, [transaction.preparedTransaction])

    // The page opens in the toolbar popup, which has nothing else to show.
    const answer = (approved: boolean) =>
        decide.mutate(approved, { onSuccess: () => window.close() })

    return (
        <>
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                        Site
                    </Typography>
                    <Typography sx={monospace}>{transaction.origin}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Party
                    </Typography>
                    <Typography sx={monospace}>
                        {transaction.partyId ?? 'Unknown'}
                    </Typography>
                </Stack>
            </Paper>
            <Alert severity="info" sx={{ color: 'text.primary' }}>
                Approving signs this transaction as the party above and submits
                it to the ledger.
            </Alert>
            {decide.isError && (
                <Alert severity="error">
                    {decide.variables
                        ? "Couldn't approve the transaction."
                        : "Couldn't reject the transaction."}{' '}
                    {decide.error.message}
                </Alert>
            )}
            <TransactionDetail
                commandId={transaction.commandId}
                status="pending"
                txHash={transaction.preparedTransactionHash}
                tx={transaction.preparedTransaction}
                parsed={parsed}
                createdAt={transaction.createdAt ?? null}
                signedAt={null}
                origin={transaction.origin}
                externalTxId={null}
                isApproving={decide.isPending && decide.variables}
                isDeleting={decide.isPending && !decide.variables}
                submitFailed={false}
                // A decision ends the prompt, even one that failed.
                disabled={
                    transaction.partyId === undefined ||
                    decide.isPending ||
                    decide.isError
                }
                onTransactionApprove={() => answer(true)}
                onTransactionDelete={() => answer(false)}
            />
            {parsed === null && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Couldn't decode the transaction. Its raw data:
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ ...monospace, maxHeight: 160, overflow: 'auto' }}
                    >
                        {transaction.preparedTransaction}
                    </Typography>
                </Paper>
            )}
        </>
    )
}
