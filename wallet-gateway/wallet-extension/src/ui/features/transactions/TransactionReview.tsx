// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { parsePreparedTransaction } from '@canton-network/core-tx-visualizer'
import { TransactionDetail } from '@canton-network/core-wallet-ui-components/react'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useMemo } from 'react'

const monospace = { fontFamily: 'monospace', wordBreak: 'break-all' } as const

export interface ReviewedTransaction {
    commandId: string
    preparedTransaction: string
    preparedTransactionHash: string
    /** An ISO 8601 date. */
    createdAt?: string | undefined
    origin: string
}

export interface ReviewActions {
    isApproving: boolean
    isRejecting: boolean
    disabled: boolean
    onApprove: () => void
    onReject: () => void
}

/**
 * A prepared transaction, with its raw data when it can't be decoded. With
 * `actions` it is pending and the user approves or rejects it. Without, its
 * outcome is unknown: an empty status reads "Unknown" and renders no
 * buttons.
 */
export function TransactionReview({
    transaction,
    actions,
}: {
    transaction: ReviewedTransaction
    actions?: ReviewActions | undefined
}) {
    const parsed = useMemo(() => {
        try {
            return parsePreparedTransaction(transaction.preparedTransaction)
        } catch {
            return null
        }
    }, [transaction.preparedTransaction])

    return (
        <>
            <TransactionDetail
                commandId={transaction.commandId}
                status={actions ? 'pending' : ''}
                txHash={transaction.preparedTransactionHash}
                tx={transaction.preparedTransaction}
                parsed={parsed}
                createdAt={transaction.createdAt ?? null}
                signedAt={null}
                origin={transaction.origin}
                externalTxId={null}
                isApproving={actions?.isApproving ?? false}
                isDeleting={actions?.isRejecting ?? false}
                submitFailed={false}
                disabled={actions?.disabled ?? true}
                onTransactionApprove={actions?.onApprove}
                onTransactionDelete={actions?.onReject}
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
