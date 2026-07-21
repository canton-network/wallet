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
    tx?: string
    txHash?: string
    signature?: string
    publicKey?: string
    userIdentifier?: string
}

interface SignTransactionBody {
    tx?: string
    txHash?: string
    keyIdentifier?: { publicKey?: string }
    internalTxId?: string
    userIdentifier?: string
}

interface CreateKeyBody {
    name?: string
    userIdentifier?: string
}

interface GetTransactionBody {
    txId?: string
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

function createSignatureFromCounter(counter: number): string {
    const oneByte = ((counter + 127) % 255).toString(16).padStart(2, '0')
    return Buffer.from(oneByte.repeat(64), 'hex').toString('base64')
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
                    name: name ?? `mock-key-${keyCounter}`,
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
                    ...(parsed.tx !== undefined && { tx: parsed.tx }),
                    ...(parsed.txHash !== undefined && {
                        // TODO could there be no hash?
                        txHash: parsed.txHash,
                    }),
                    publicKey: key.key.publicKeyBase64,
                    ...(parsed.userIdentifier !== undefined && {
                        userIdentifier: parsed.userIdentifier,
                    }),
                    signature:
                        parsed.txHash !== undefined
                            ? signMultiHashBase64(parsed.txHash, key.key)
                            : createSignatureFromCounter(txCounter),
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
                const resolvedTxId =
                    txId ??
                    Array.from(transactionsById.keys())[0] ??
                    'mock-tx-1'
                let tx = transactionsById.get(resolvedTxId)
                if (!tx) {
                    // TODO remove
                    tx = {
                        txId: resolvedTxId,
                        status: 'pending',
                        signature: createSignatureFromCounter(txCounter + 1),
                    }
                    transactionsById.set(resolvedTxId, tx)
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
                            (transaction.publicKey !== undefined &&
                                publicKeys.includes(transaction.publicKey))
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
                    txId,
                    status: resolvedStatus,
                    ...(existing.tx !== undefined && { tx: existing.tx }),
                    ...(existing.txHash !== undefined && {
                        txHash: existing.txHash,
                    }),
                    ...(existing.userIdentifier !== undefined && {
                        userIdentifier: existing.userIdentifier,
                    }),
                    ...(publicKey !== undefined
                        ? { publicKey }
                        : existing.publicKey !== undefined
                          ? { publicKey: existing.publicKey }
                          : {}),
                    ...(signature !== undefined
                        ? { signature }
                        : existing.signature !== undefined
                          ? { signature: existing.signature }
                          : {}),
                }
                transactionsById.set(txId, nextTx)

                return {
                    body: {
                        txId: nextTx.txId,
                        status: nextTx.status,
                        ...(nextTx.signature !== undefined && {
                            signature: nextTx.signature,
                        }),
                        ...(nextTx.publicKey !== undefined && {
                            publicKey: nextTx.publicKey,
                        }),
                    },
                }
            },
        },
    ]

    return routes
}
