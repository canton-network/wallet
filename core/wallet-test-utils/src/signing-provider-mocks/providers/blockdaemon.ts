// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    SigningProviderMockModule,
    SigningProviderMockRoute,
} from '../server.js'
import { generateKeyPairSync } from 'node:crypto'

type SigningStatus = 'pending' | 'signed' | 'rejected' | 'failed'

interface BlockdaemonMockKey {
    id: string
    name: string
    publicKey: string
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

export interface BlockdaemonMockProviderOptions {
    pathPrefix?: string
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

const DEFAULT_PREFIX = '/blockdaemon'

function createPublicKey(): string {
    // Canton validates Ed25519 points for topology generation, so the mock must
    // return cryptographically valid public keys.
    const { publicKey } = generateKeyPairSync('ed25519')
    const spkiDer = publicKey.export({ type: 'spki', format: 'der' }) // TODO is this correct format?
    const keyBytes = Buffer.from(spkiDer).subarray(-32)
    return keyBytes.toString('base64')
}

function createSignatureFromCounter(counter: number): string {
    const oneByte = ((counter + 127) % 255).toString(16).padStart(2, '0')
    return Buffer.from(oneByte.repeat(64), 'hex').toString('base64')
}

export function createBlockdaemonMockProvider(
    options: BlockdaemonMockProviderOptions = {}
): SigningProviderMockModule {
    const pathPrefix = options.pathPrefix ?? DEFAULT_PREFIX

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
                const key: BlockdaemonMockKey = {
                    id: `mock-key-${keyCounter}`,
                    name: name ?? `mock-key-${keyCounter}`,
                    publicKey: createPublicKey(),
                    ...(userIdentifier !== undefined && { userIdentifier }),
                }
                keysByPublicKey.set(key.publicKey, key)
                return { body: key }
            },
        },
        {
            method: 'POST',
            path: '/getKeys',
            handler: () => ({
                body: Array.from(keysByPublicKey.values()).map((key) => ({
                    id: key.id,
                    name: key.name,
                    publicKey: key.publicKey,
                })),
            }),
        },
        {
            method: 'POST',
            path: '/signTransaction',
            handler: ({ body }) => {
                const parsed = body as SignTransactionBody
                const publicKey =
                    parsed.keyIdentifier?.publicKey ?? createPublicKey()

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
                        txHash: parsed.txHash,
                    }),
                    publicKey,
                    ...(parsed.userIdentifier !== undefined && {
                        userIdentifier: parsed.userIdentifier,
                    }),
                    signature: createSignatureFromCounter(txCounter),
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
    ]

    routes.push({
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
    })

    return {
        pathPrefix,
        routes,
    }
}
