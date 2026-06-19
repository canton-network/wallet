// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@canton-network/core-tx-parser'
import { formatDateTimeString } from '@utils/date-format'
import { formatAmount, toDecimalOrNull } from '@utils/decimal'

export type TransactionFilter = 'all' | 'received' | 'sent'
export type TransactionDirection = 'received' | 'sent' | 'unknown'

type TransactionEvent = Transaction['events'][number]

export type TransactionDisplay = {
    type: string
    date: string
    asset: string
    amount: string | null
    direction: TransactionDirection
    counterparty: string | null
    updateId: string
}

export const FILTER_LABEL_BY_FILTER = {
    all: 'All',
    received: 'Received',
    sent: 'Sent',
} satisfies Record<TransactionFilter, string>

export function filterTransactions(
    transactions: Transaction[],
    walletId: string,
    filter: TransactionFilter
) {
    if (filter === 'all') return transactions

    return transactions.filter(
        (transaction) =>
            getTransactionDirection(transaction, walletId) === filter
    )
}

export function getTransactionDisplay(
    transaction: Transaction,
    walletId: string
): TransactionDisplay {
    const event = getPrimaryEvent(transaction)
    const direction = getTransactionDirection(transaction, walletId)
    const amount = getTransactionAmount(event)
    // console.log('Event', event)

    return {
        type: getTransactionType(event, direction),
        date: formatDateTimeString(transaction.recordTime),
        asset: getTransactionAsset(event),
        amount,
        direction,
        counterparty: getCounterparty(event, walletId),
        updateId: transaction.updateId,
    }
}

export function getCounterpartyLabel(direction: TransactionDirection) {
    if (direction === 'received') return 'Sender'
    if (direction === 'sent') return 'Recipient'
    return 'Counterparty'
}

export function getEmptyMessage({
    filter,
    hasMoreHistory,
    totalLoadedTransactions,
}: {
    filter: TransactionFilter
    hasMoreHistory: boolean
    totalLoadedTransactions: number
}) {
    if (filter === 'all') {
        return hasMoreHistory && totalLoadedTransactions === 0
            ? 'No transactions loaded yet.'
            : 'There are currently no transactions in this wallet'
    }

    return hasMoreHistory
        ? `No ${filter} transactions in the loaded history yet.`
        : `No ${filter} transactions.`
}

function getPrimaryEvent(
    transaction: Transaction
): TransactionEvent | undefined {
    return transaction.events[0]
}

/**
 * Returns the user-facing Activity label for a parsed transaction event.
 *
 * Transfer-instruction lifecycle rows intentionally remain separate, matching
 * Splice wallet history behavior. The labels distinguish offer creation
 * (`Pending`) from terminal transfer outcomes (`Completed`, `Rejected`, etc.)
 * so multiple rows from the same logical transfer do not look like duplicates.
 */
function getTransactionType(
    event: TransactionEvent | undefined,
    direction: TransactionDirection
): string {
    const status = event?.transferInstruction?.status.current?.tag

    if (status === 'Pending') {
        if (direction === 'received') return 'Offer received ↘'
        if (direction === 'sent') return 'Offer sent ↗'
        return 'Transfer offer'
    }

    if (status === 'Completed') {
        if (direction === 'received') return 'Transfer received ↘'
        if (direction === 'sent') return 'Transfer sent ↗'
        return 'Transfer completed'
    }

    if (status === 'Rejected') return 'Offer rejected'
    if (status === 'Withdrawn') return 'Offer withdrawn'
    if (status === 'Failed') return 'Offer failed'

    if (event?.label.type === 'TransferOut') return 'Transfer sent ↗'
    if (event?.label.type === 'TransferIn') return 'Transfer received ↘'
    if (event?.label.type === 'MergeSplit') return 'Merge/Split'
    if (event?.label.type === 'ExpireDust') return 'Dust expired'

    if (direction === 'received') return 'Received ↘'
    if (direction === 'sent') return 'Sent ↗'

    return event?.label.type ?? 'Unknown'
}

function getTransactionAsset(event: TransactionEvent | undefined): string {
    if (!event) return '—'

    const transfer = event.transferInstruction?.transfer
    if (transfer?.instrumentId) {
        const { admin, id } = transfer.instrumentId
        return id || admin
    }

    const summary = getHoldingSummary(event)
    if (summary?.instrumentId) {
        return summary.instrumentId.id || summary.instrumentId.admin
    }

    return '—'
}

function getTransactionAmount(
    event: TransactionEvent | undefined
): string | null {
    if (!event) return null

    const transfer = event.transferInstruction?.transfer
    if (transfer) {
        return formatAmount(transfer.amount ?? '0')
    }

    const summary = getHoldingSummary(event)
    if (!summary?.amountChange) return null

    const amountChange = toDecimalOrNull(summary.amountChange)
    if (amountChange) {
        return formatAmount(amountChange.abs())
    }

    return formatAmount(summary.amountChange)
}

function getTransactionDirection(
    transaction: Transaction,
    walletId: string
): TransactionDirection {
    const event = getPrimaryEvent(transaction)
    if (!event) return 'unknown'

    const transfer = event.transferInstruction?.transfer
    if (transfer) {
        if (transfer.sender === walletId) return 'sent'
        if (transfer.receiver === walletId) return 'received'
        return 'unknown'
    }

    const summary = getHoldingSummary(event)
    if (!summary?.amountChange) return 'unknown'

    const amountChange = toDecimalOrNull(summary.amountChange)
    if (!amountChange || amountChange.isZero()) return 'unknown'

    return amountChange.isNegative() ? 'sent' : 'received'
}

function getCounterparty(
    event: TransactionEvent | undefined,
    walletId: string
): string | null {
    if (!event) return null

    const transfer = event.transferInstruction?.transfer
    if (!transfer) return null

    if (transfer.sender === walletId) return transfer.receiver || null
    if (transfer.receiver === walletId) return transfer.sender || null

    return null
}

function getHoldingSummary(event: TransactionEvent) {
    return (
        event.unlockedHoldingsChangeSummaries[0] ||
        event.lockedHoldingsChangeSummaries[0]
    )
}
