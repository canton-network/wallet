// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SigningProviderMockRoute } from '../server.js'
import {
    createMockEd25519KeyPair,
    MockEd25519KeyPair,
    signMultiHashBase64,
} from '../crypto.js'

type SigningStatus = 'pending' | 'signed' | 'rejected' | 'failed'

interface BlockdaemonMockKey {
    id: string
    name: string
    key: MockEd25519KeyPair
    userIdentifier?: string
}

interface BlockdaemonMockTransaction {
    txId: string
    status: SigningStatus
    tx: string
    txHash: string
    signature: string
    publicKey: string
    userIdentifier?: string
}

interface SignTransactionBody {
    tx: string
    txHash: string
    keyIdentifier: { publicKey: string; id?: string }
    internalTxId?: string
    userIdentifier?: string
}

interface CreateKeyBody {
    name: string
    userIdentifier?: string
}

interface GetTransactionBody {
    txId: string
}

interface GetTransactionsBody {
    txIds?: string[]
    publicKeys?: string[]
}

interface SetTransactionStateBody {
    txId?: string
    status?: SigningStatus
    signature?: string
    publicKey?: string
}

export function createBlockdaemonMockProvider(): SigningProviderMockRoute[] {
    const keysByPublicKey = new Map<string, BlockdaemonMockKey>()
    const transactionsById = new Map<string, BlockdaemonMockTransaction>()
    let keyCounter = 0
    let txCounter = 0

    const routes: SigningProviderMockRoute[] = [
        {
            method: 'POST',
            path: '/createKey',
            handler: ({ body }) => {
                const { name, userIdentifier } = body as CreateKeyBody

                keyCounter++
                const keyPair = createMockEd25519KeyPair()
                const key: BlockdaemonMockKey = {
                    id: `mock-key-${keyCounter}`,
                    name,
                    key: keyPair,
                    ...(userIdentifier !== undefined && { userIdentifier }),
                }
                keysByPublicKey.set(key.key.publicKeyBase64, key)
                return {
                    body: {
                        id: key.id,
                        name: key.name,
                        publicKey: key.key.publicKeyBase64,
                    },
                }
            },
        },
        {
            method: 'POST',
            path: '/getKeys',
            handler: () => ({
                body: Array.from(keysByPublicKey.values()).map((key) => ({
                    id: key.id,
                    name: key.name,
                    publicKey: key.key.publicKeyBase64,
                })),
            }),
        },
        {
            method: 'POST',
            path: '/signTransaction',
            handler: ({ body }) => {
                const parsed = body as SignTransactionBody
                const requestedPublicKey = parsed.keyIdentifier?.publicKey
                const key = requestedPublicKey
                    ? keysByPublicKey.get(requestedPublicKey)
                    : undefined
                if (!key) {
                    return {
                        status: 400,
                        body: {
                            error: 'incorrect_key',
                        },
                    }
                }

                txCounter += 1
                const txId =
                    parsed.internalTxId && parsed.internalTxId.length > 0
                        ? parsed.internalTxId
                        : `mock-tx-${txCounter}`
                const tx: BlockdaemonMockTransaction = {
                    txId,
                    status: 'pending',
                    tx: parsed.tx,
                    txHash: parsed.txHash,
                    publicKey: key.key.publicKeyBase64,
                    signature: signMultiHashBase64(parsed.txHash, key.key),
                    ...(parsed.userIdentifier !== undefined && {
                        userIdentifier: parsed.userIdentifier,
                    }),
                }
                transactionsById.set(txId, tx)

                return {
                    body: {
                        txId,
                        status: 'pending',
                        publicKey: tx.publicKey,
                    },
                }
            },
        },
        {
            method: 'POST',
            path: '/getTransaction',
            handler: ({ body }) => {
                const { txId } = body as GetTransactionBody
                const tx = transactionsById.get(txId)
                if (!tx) {
                    return {
                        status: 404,
                        body: { error: 'transaction_not_found', txId },
                    }
                }

                return {
                    body: {
                        txId: tx.txId,
                        status: tx.status,
                        ...(tx.status === 'signed' && {
                            signature: tx.signature,
                            publicKey: tx.publicKey,
                        }),
                    },
                }
            },
        },
        {
            method: 'POST',
            path: '/getTransactions',
            handler: ({ body }) => {
                const { txIds, publicKeys } = body as GetTransactionsBody
                const filtered = Array.from(transactionsById.values()).filter(
                    (transaction) => {
                        const txIdMatches =
                            !txIds ||
                            txIds.length === 0 ||
                            txIds.includes(transaction.txId)
                        const publicKeyMatches =
                            !publicKeys ||
                            publicKeys.length === 0 ||
                            publicKeys.includes(transaction.publicKey)
                        return txIdMatches && publicKeyMatches
                    }
                )

                return {
                    body: filtered.map((tx) => ({
                        txId: tx.txId,
                        status: tx.status,
                        ...(tx.status === 'signed' && {
                            signature: tx.signature,
                            publicKey: tx.publicKey,
                        }),
                    })),
                }
            },
        },
        {
            method: 'POST',
            path: '/_admin/setTransactionState',
            handler: ({ body }) => {
                const { txId, status, signature, publicKey } =
                    body as SetTransactionStateBody
                const resolvedStatus = status ?? 'pending'
                if (!txId) {
                    return {
                        status: 400,
                        body: {
                            error: 'missing_tx_id',
                        },
                    }
                }

                const existing = transactionsById.get(txId)
                if (!existing) {
                    return {
                        status: 404,
                        body: {
                            error: 'tx_not_found',
                            txId,
                        },
                    }
                }

                const nextTx: BlockdaemonMockTransaction = {
                    ...existing,
                    status: resolvedStatus,
                    ...(publicKey !== undefined && { publicKey }),
                    ...(signature !== undefined && { signature }),
                }
                transactionsById.set(txId, nextTx)

                return {
                    body: {
                        txId: nextTx.txId,
                        status: nextTx.status,
                        ...(nextTx.status === 'signed' && {
                            signature: nextTx.signature,
                            publicKey: nextTx.publicKey,
                        }),
                    },
                }
            },
        },
    ]

    return routes
}
