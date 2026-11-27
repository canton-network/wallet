// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { hashPreparedTransaction } from '@canton-network/core-tx-visualizer'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import type { Store, Transaction } from '@canton-network/core-wallet-store'

import type { TxChangedExecutedPayload } from '../controllers/dapp/rpc-gen/typings.ts'
import type { TransactionSubmitter } from '../controllers/user/transactions.ts'
import { HASHING_SCHEME } from './prepare.ts'

export function actingParty(transaction: Transaction): string | undefined {
    const actAs = (transaction.payload as { actAs?: unknown } | undefined)
        ?.actAs
    return Array.isArray(actAs) && typeof actAs[0] === 'string'
        ? actAs[0]
        : undefined
}

export interface SubmitRequest {
    /** Scoped to `auth`, and holding the prepared transaction. */
    store: Store
    auth: AuthContext
    /** The session whose notifier reports the transaction. */
    sessionId: string
    transactionId: string
}

/**
 * Signs a stored, prepared transaction as its first acting party and
 * executes it. Resolves once it is executed.
 */
export async function submitTransaction(
    submitter: Pick<TransactionSubmitter, 'sign' | 'execute'>,
    { store, auth, sessionId, transactionId }: SubmitRequest
): Promise<TxChangedExecutedPayload> {
    const transaction = await store.getTransaction(transactionId)
    const partyId = transaction && actingParty(transaction)
    if (!transaction || !partyId) {
        throw new Error('The transaction has no acting party')
    }
    // Signing covers the hash only, so it must be the hash of the
    // transaction the user saw.
    const hash = await hashPreparedTransaction(
        transaction.preparedTransaction,
        'base64',
        { hashingScheme: HASHING_SCHEME }
    )
    if (hash !== transaction.preparedTransactionHash) {
        throw new Error(
            'The prepared transaction does not match its hash, so it was not signed'
        )
    }
    const params = { transactionId, partyId }
    const signed = await submitter.sign(store, auth, sessionId, params)
    if (signed.status !== 'signed') {
        throw new Error(`Signing returned status ${signed.status}`)
    }
    // The transaction service returns the payload of its `executed` event,
    // under a looser type.
    return (await submitter.execute(
        store,
        auth,
        sessionId,
        params
    )) as TxChangedExecutedPayload
}
