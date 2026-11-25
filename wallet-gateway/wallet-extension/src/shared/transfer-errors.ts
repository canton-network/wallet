// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { errorCodes, rpcErrors } from '@canton-network/core-rpc-errors'

/**
 * The `data` of a token service write error after which the transaction
 * can't have executed: the write failed before signing, or the ledger
 * reported that the transaction failed. Every other error, an uncoded one
 * from a closed message channel included, leaves the outcome unknown.
 */
export const NOT_SUBMITTED = { outcome: 'not-submitted' } as const

export function notSubmittedError(message: string) {
    return rpcErrors.transactionRejected({ message, data: NOT_SUBMITTED })
}

/** Whether the page may offer the same transfer again after `error`. */
export function isNotSubmitted(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false
    const { code, data } = error as { code?: unknown; data?: unknown }
    return (
        code === errorCodes.rpc.transactionRejected &&
        typeof data === 'object' &&
        data !== null &&
        (data as { outcome?: unknown }).outcome === NOT_SUBMITTED.outcome
    )
}
