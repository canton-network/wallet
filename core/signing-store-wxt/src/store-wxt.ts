// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    SigningDriverConfig,
    SigningDriverStatus,
    SigningDriverStore,
    SigningKey,
    SigningTransaction,
} from '@canton-network/core-signing-lib'
import { UserId } from '@canton-network/core-wallet-auth'
import {
    toSigningKey,
    fromSigningKey,
    signingTransactionItem,
    toSigningTransaction,
    fromSigningTransaction,
    signingTransactionIndexItem,
    SigningTransactionRecord,
    signingDriverConfigItem,
    toSigningDriverConfig,
    fromSigningDriverConfig,
    signingKeysItem,
    SigningKeyRecord,
} from './schemas.js'

/* eslint-disable @typescript-eslint/no-unused-vars */
// this is required because the extension is single user, but we need to satisfy the SigningDriverStore interface

export class WxtStore implements SigningDriverStore {
    constructor(private userId: UserId) {}

    async getSigningKey(
        userId: string,
        keyId: string
    ): Promise<SigningKey | undefined> {
        const record = await signingKeysItem().getValue()
        const signingKey = record
            ? record.find((r) => r.id === keyId)
            : undefined

        return signingKey ? toSigningKey(signingKey) : undefined
    }
    async getSigningKeyByPublicKey(
        publicKey: string
    ): Promise<SigningKey | undefined> {
        const keys = await this.listSigningKeys(this.userId)
        const signingKey = keys.find((key) => key.publicKey === publicKey)
        if (!signingKey) return undefined
        return signingKey
    }
    async getSigningKeyByName(
        userId: string,
        name: string
    ): Promise<SigningKey | undefined> {
        const keys = await this.listSigningKeys(this.userId)
        const signingKey = keys.find((key) => key.name === name)
        if (!signingKey) return undefined
        return signingKey
    }
    async listSigningTransactionsByTxIdsAndPublicKeys(
        txIds: string[],
        publicKeys: string[]
    ): Promise<SigningTransaction[]> {
        if (!txIds.length && !publicKeys.length) return []

        const records = await this.listSigningTransactions(this.userId)

        return records.filter((record) => {
            if (!record) return false

            const matchesTxId = txIds.length > 0 && txIds.includes(record.id)
            const matchesPublicKey =
                publicKeys.length > 0 && publicKeys.includes(record.publicKey)

            return matchesTxId || matchesPublicKey
        })
    }

    async setSigningKey(userId: string, key: SigningKey): Promise<void> {
        const item = signingKeysItem()
        const keys = await item.getValue()
        const idx = keys?.findIndex((k) => (k.id = key.id))
        const existing = idx >= 0 ? keys[idx] : undefined

        const serialized = fromSigningKey(key, userId)

        const updated: SigningKeyRecord = {
            ...serialized,
            createdAt: existing?.createdAt ?? serialized.createdAt,
            updatedAt: new Date().toISOString(),
        }

        const nextKeys =
            idx >= 0
                ? keys.map((key, index) => (index === idx ? updated : key))
                : [...keys, updated]

        await item.setValue(nextKeys)
    }
    async deleteSigningKey(userId: string, keyId: string): Promise<void> {
        const item = signingKeysItem()
        const keys = await item.getValue()

        const nextKeys = keys.filter((k) => k.id !== keyId)
        if (nextKeys.length !== keys.length) {
            await item.setValue(nextKeys)
        }
    }
    async listSigningKeys(userId: string): Promise<SigningKey[]> {
        const keys = await signingKeysItem().getValue()
        return keys.map((x) => toSigningKey(x))
    }
    async getSigningTransaction(
        userId: string,
        txId: string
    ): Promise<SigningTransaction | undefined> {
        const record = await signingTransactionItem(txId).getValue()
        return record ? toSigningTransaction(record) : undefined
    }

    async setSigningTransaction(
        userId: string,
        transaction: SigningTransaction
    ): Promise<void> {
        const item = signingTransactionItem(transaction.id)
        const existing = await item.getValue()
        const serialized = fromSigningTransaction(transaction, this.userId)

        const writeOperations: Promise<unknown>[] = [
            item.setValue({
                ...serialized,
                createdAt: existing?.createdAt ?? serialized.createdAt,
            }),
        ]

        if (!existing) {
            const index = await signingTransactionIndexItem().getValue()
            if (!index.includes(transaction.id)) {
                writeOperations.push(
                    signingTransactionIndexItem().setValue([
                        ...index,
                        transaction.id,
                    ])
                )
            }
        }

        await Promise.all(writeOperations)
    }

    async updateSigningTransactionStatus(
        userId: string,
        txId: string,
        status: SigningDriverStatus
    ): Promise<void> {
        const signingTx = signingTransactionItem(txId)
        const existing = await signingTx.getValue()

        if (!existing) {
            throw new Error(
                `No signing tx found for txId: ${txId}, userId: ${this.userId}`
            )
        }

        //TODO: maybe also update updatedAt
        const updated: SigningTransactionRecord = {
            ...existing,
            status: status,
        }

        signingTx.setValue(updated)
    }
    async listSigningTransactions(
        userId: string,
        limit?: number,
        before?: string
    ): Promise<SigningTransaction[]> {
        const index = await signingTransactionIndexItem().getValue()
        const txs = await Promise.all(
            index.map((txId) => this.getSigningTransaction(this.userId, txId))
        )

        const validTxs = txs
            .filter((k): k is SigningTransaction => k != undefined)
            .sort((a, b) =>
                a.createdAt
                    .toISOString()
                    .localeCompare(b.createdAt.toISOString())
            )

        let beforeDate: string | undefined = before

        if (before) {
            const isIsoDate = !isNaN(Date.parse(before)) && before.includes('T')
            if (!isIsoDate) {
                const targetTx = await this.getSigningTransaction(
                    userId,
                    before
                )
                if (targetTx) {
                    beforeDate = targetTx.createdAt.toISOString()
                }
            }
        }

        const filteredTxs = beforeDate
            ? validTxs.filter((k) => k.createdAt.toISOString() < beforeDate!)
            : validTxs

        return limit ? filteredTxs.slice(0, limit) : filteredTxs
    }

    async getSigningDriverConfiguration(
        userId: string,
        driverId: string
    ): Promise<SigningDriverConfig | undefined> {
        const record = await signingDriverConfigItem(driverId).getValue()
        return record ? toSigningDriverConfig(record) : undefined
    }
    async setSigningDriverConfiguration(
        userId: string,
        config: SigningDriverConfig
    ): Promise<void> {
        const item = signingDriverConfigItem(config.driverId)
        const existing = await item.getValue()
        const serialized = fromSigningDriverConfig(config, userId)

        if (existing && existing.config === serialized.config) return

        await item.setValue(serialized)
    }
    async setSigningKeys(userId: string, keys: SigningKey[]): Promise<void> {
        const item = signingKeysItem()
        const existingKeys = await item.getValue()
        const keyMap = new Map(existingKeys.map((k) => [k.id, k]))

        for (const key of keys) {
            const existing = keyMap.get(key.id)
            const serialized = fromSigningKey(key, this.userId)
            keyMap.set(key.id, {
                ...serialized,
                createdAt: existing?.createdAt ?? serialized.createdAt,
                updatedAt: new Date().toISOString(),
            })
        }

        await item.setValue(Array.from(keyMap.values()))
    }
    async setSigningTransactions(
        userId: string,
        transactions: SigningTransaction[]
    ): Promise<void> {
        if (!transactions.length) return

        await Promise.all(
            transactions.map(async (tx) => {
                const item = signingTransactionItem(tx.id)
                const existing = await item.getValue()

                const serialized: SigningTransactionRecord =
                    fromSigningTransaction(tx, this.userId)
                await item.setValue({
                    ...serialized,
                    createdAt:
                        existing?.createdAt ?? tx.createdAt.toISOString(),
                })
            })
        )

        const currentIndex = await signingTransactionIndexItem().getValue()
        const newIds = transactions.map((t) => t.id)
        const mergedIndex = Array.from(new Set([...currentIndex, ...newIds]))

        await signingTransactionIndexItem().setValue(mergedIndex)
    }
}
