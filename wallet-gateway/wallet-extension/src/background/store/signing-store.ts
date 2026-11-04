// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO(#2498/#2406): temporary store for the wallet-kernel driver. The
// HD-wallet driver replaces it.

import type {
    SigningDriverConfig,
    SigningDriverStore,
    SigningKey,
    SigningTransaction,
} from '@canton-network/core-signing-lib'
import type { Vault } from '../vault'

interface Timestamps {
    createdAt: string
    updatedAt: string
}

type SigningKeyRecord = Omit<SigningKey, keyof Timestamps> & Timestamps

type SigningTransactionRecord = Omit<
    SigningTransaction,
    keyof Timestamps | 'signedAt'
> &
    Timestamps & { signedAt?: string }

/** Vault values must be JSON, so dates are ISO strings. */
interface SigningStoreData {
    version: 1
    keys: SigningKeyRecord[]
    transactions: SigningTransactionRecord[]
    configs: Record<string, SigningDriverConfig>
}

const toKey = (record: SigningKeyRecord): SigningKey => ({
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
})

const toTransaction = ({
    signedAt,
    ...record
}: SigningTransactionRecord): SigningTransaction => ({
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    ...(signedAt ? { signedAt: new Date(signedAt) } : {}),
})

/** Upserts by ID, keeping `createdAt`. */
function upsert<R extends { id: string } & Timestamps>(
    records: R[],
    changes: R[]
): R[] {
    const byId = new Map(records.map((record) => [record.id, record]))
    const updatedAt = new Date().toISOString()
    for (const change of changes) {
        const existing = byId.get(change.id)
        byId.set(change.id, {
            ...change,
            createdAt: existing?.createdAt ?? change.createdAt,
            updatedAt,
        })
    }
    return [...byId.values()]
}

/**
 * Signing keys, transactions and driver configs in the vault item
 * `signingStore`. Every method rejects while the vault is locked. `userId` is
 * ignored.
 */
export function createVaultSigningStore(
    vault: Pick<Vault, 'defineItem'>
): SigningDriverStore {
    // Never log the value. It holds private keys.
    const item = vault.defineItem<SigningStoreData>('signingStore', {
        fallback: { version: 1, keys: [], transactions: [], configs: {} },
    })
    const keys = async () => (await item.getValue()).keys.map(toKey)

    const setSigningKeys = async (newKeys: SigningKey[]): Promise<void> => {
        const changes = newKeys.map((key): SigningKeyRecord => ({
            ...key,
            createdAt: key.createdAt.toISOString(),
            updatedAt: key.updatedAt.toISOString(),
        }))
        await item.update((data) => ({
            ...data,
            keys: upsert(data.keys, changes),
        }))
    }

    const setSigningTransactions = async (
        transactions: SigningTransaction[]
    ): Promise<void> => {
        const changes = transactions.map(
            ({ signedAt, ...tx }): SigningTransactionRecord => ({
                ...tx,
                createdAt: tx.createdAt.toISOString(),
                updatedAt: tx.updatedAt.toISOString(),
                ...(signedAt ? { signedAt: signedAt.toISOString() } : {}),
            })
        )
        await item.update((data) => ({
            ...data,
            transactions: upsert(data.transactions, changes),
        }))
    }

    return {
        async getSigningKey(_userId, keyId) {
            return (await keys()).find((key) => key.id === keyId)
        },
        async getSigningKeyByPublicKey(publicKey) {
            return (await keys()).find((key) => key.publicKey === publicKey)
        },
        async getSigningKeyByName(_userId, name) {
            return (await keys()).find((key) => key.name === name)
        },
        async listSigningTransactionsByTxIdsAndPublicKeys(txIds, publicKeys) {
            // Read before filtering, so empty filters reject while locked too.
            const { transactions } = await item.getValue()
            return transactions
                .filter(
                    (tx) =>
                        txIds.includes(tx.id) ||
                        publicKeys.includes(tx.publicKey)
                )
                .map(toTransaction)
        },
        async setSigningKey(_userId, key) {
            await setSigningKeys([key])
        },
        async deleteSigningKey(_userId, keyId) {
            await item.update((data) => ({
                ...data,
                keys: data.keys.filter((key) => key.id !== keyId),
            }))
        },
        async listSigningKeys() {
            return keys()
        },
        async getSigningTransaction(_userId, txId) {
            const { transactions } = await item.getValue()
            const tx = transactions.find((record) => record.id === txId)
            return tx ? toTransaction(tx) : undefined
        },
        async setSigningTransaction(_userId, transaction) {
            await setSigningTransactions([transaction])
        },
        async updateSigningTransactionStatus(_userId, txId, status) {
            await item.update((data) => {
                if (!data.transactions.some((tx) => tx.id === txId)) {
                    throw new Error(`No signing tx found for txId: ${txId}`)
                }
                const updatedAt = new Date().toISOString()
                return {
                    ...data,
                    transactions: data.transactions.map((tx) =>
                        tx.id === txId ? { ...tx, status, updatedAt } : tx
                    ),
                }
            })
        },
        async listSigningTransactions(_userId, limit, before) {
            const { transactions } = await item.getValue()
            const sorted = transactions.toSorted((a, b) =>
                a.createdAt.localeCompare(b.createdAt)
            )
            // `before` is an ISO date or a transaction ID, as in `WxtStore`.
            let beforeDate = before
            if (
                before &&
                (isNaN(Date.parse(before)) || !before.includes('T'))
            ) {
                const target = transactions.find((tx) => tx.id === before)
                if (target) beforeDate = target.createdAt
            }
            const filtered = beforeDate
                ? sorted.filter((tx) => tx.createdAt < beforeDate)
                : sorted
            return (limit ? filtered.slice(0, limit) : filtered).map(
                toTransaction
            )
        },
        async getSigningDriverConfiguration(_userId, driverId) {
            const { configs } = await item.getValue()
            return Object.hasOwn(configs, driverId)
                ? configs[driverId]
                : undefined
        },
        async setSigningDriverConfiguration(_userId, config) {
            await item.update((data) => ({
                ...data,
                configs: { ...data.configs, [config.driverId]: config },
            }))
        },
        async setSigningKeys(_userId, newKeys) {
            await setSigningKeys(newKeys)
        },
        async setSigningTransactions(_userId, transactions) {
            await setSigningTransactions(transactions)
        },
    }
}
