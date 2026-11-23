// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { parsePreparedTransaction } from '@canton-network/core-tx-visualizer'
import { TransactionDetail } from '@canton-network/core-wallet-ui-components/react'
import type { GetTransactionResult } from '@canton-network/core-wallet-user-rpc-client'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { queryKeys } from '@/ui/lib/query/keys.ts'

import {
    actingParty,
    transactionQuery,
    useApproveTransaction,
    useRejectTransaction,
} from './api.ts'

const monospace = { fontFamily: 'monospace', wordBreak: 'break-all' } as const

export function ApproveTransactionPage({ id }: { id: string }) {
    const { data: transaction } = useSuspenseQuery(transactionQuery(id))
    const waiting =
        transaction?.status === 'pending' || transaction?.status === 'signed'

    return (
        <Stack spacing={2} sx={{ p: 1, maxWidth: 440, mx: 'auto' }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                Approve this transaction?
            </Typography>
            {transaction && waiting ? (
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

function TransactionPrompt({
    transaction,
}: {
    transaction: GetTransactionResult
}) {
    const queryClient = useQueryClient()
    const party = actingParty(transaction.payload ?? '')
    const approve = useApproveTransaction(transaction.id, party ?? '')
    const reject = useRejectTransaction(transaction.id)
    const parsed = useMemo(() => {
        try {
            return parsePreparedTransaction(transaction.preparedTransaction)
        } catch {
            return null
        }
    }, [transaction.preparedTransaction])

    // The page opens in the toolbar popup, which has nothing else to show.
    const onApprove = () =>
        approve.mutate(undefined, {
            onSuccess: (status) => {
                if (status === 'executed') window.close()
            },
            // An execution that failed may have left it signed.
            onError: () =>
                queryClient.invalidateQueries({
                    queryKey: queryKeys.transactions.detail(transaction.id),
                }),
        })
    const onReject = () =>
        reject.mutate(undefined, { onSuccess: () => window.close() })

    return (
        <>
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                        Site
                    </Typography>
                    <Typography sx={monospace}>
                        {transaction.origin ?? 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Party
                    </Typography>
                    <Typography sx={monospace}>{party ?? 'Unknown'}</Typography>
                </Stack>
            </Paper>
            <Alert severity="info" sx={{ color: 'text.primary' }}>
                Approving signs this transaction as the party above and submits
                it to the ledger.
            </Alert>
            {approve.data !== undefined && approve.data !== 'executed' && (
                <Alert severity="info" sx={{ color: 'text.primary' }}>
                    Awaiting external signature. Approve the request with your
                    signing provider.
                </Alert>
            )}
            {approve.isError && (
                <Alert severity="error">
                    Couldn't approve the transaction. {approve.error.message}
                </Alert>
            )}
            {reject.isError && (
                <Alert severity="error">
                    Couldn't reject the transaction. {reject.error.message}
                </Alert>
            )}
            <TransactionDetail
                commandId={transaction.commandId}
                status={transaction.status}
                txHash={transaction.preparedTransactionHash}
                tx={transaction.preparedTransaction}
                parsed={parsed}
                createdAt={transaction.createdAt ?? null}
                signedAt={transaction.signedAt ?? null}
                origin={transaction.origin ?? null}
                externalTxId={transaction.externalTxId ?? null}
                isApproving={approve.isPending}
                isDeleting={reject.isPending}
                submitFailed={Boolean(transaction.failureReason)}
                disabled={party === undefined}
                onTransactionApprove={onApprove}
                onTransactionDelete={onReject}
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
