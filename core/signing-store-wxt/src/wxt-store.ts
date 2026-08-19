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
    signingKeyItem,
    toSigningKey,
    publicKeyIndexItem,
    nameIndexItem,
    fromSigningKey,
    signingKeyIndexItem,
    signingTransactionItem,
    toSigningTransaction,
    fromSigningTransaction,
    signingTransactionIndexItem,
    SigningTransactionRecord,
    signingDriverConfigItem,
    toSigningDriverConfig,
    fromSigningDriverConfig,
} from './schemas.js'

/* eslint-disable @typescript-eslint/no-unused-vars */

export class WxtStore implements SigningDriverStore {
    constructor(private userId: UserId) {}

    async getSigningKey(
        userId: string,
        keyId: string
    ): Promise<SigningKey | undefined> {
        const record = await signingKeyItem(keyId).getValue()
        return record ? toSigningKey(record) : undefined
    }
    async getSigningKeyByPublicKey(
        publicKey: string
    ): Promise<SigningKey | undefined> {
        const keyId = await publicKeyIndexItem(publicKey).getValue()
        if (!keyId) return undefined
        return this.getSigningKey(this.userId, keyId)
    }
    async getSigningKeyByName(
        userId: string,
        name: string
    ): Promise<SigningKey | undefined> {
        const keyId = await nameIndexItem(name).getValue()
        if (!keyId) return undefined
        return this.getSigningKey(this.userId, keyId)
    }
    async listSigningTransactionsByTxIdsAndPublicKeys(
        txIds: string[],
        publicKeys: string[]
    ): Promise<SigningTransaction[]> {
        if (!txIds.length && !publicKeys.length) return []

        const index = await signingTransactionIndexItem().getValue()
        const records = await Promise.all(
            index.map((id) => signingTransactionItem(id).getValue())
        )

        return records
            .filter((record): record is SigningTransactionRecord => {
                if (!record) return false

                const matchesTxId =
                    txIds.length > 0 && txIds.includes(record.id)
                const matchesPublicKey =
                    publicKeys.length > 0 &&
                    publicKeys.includes(record.publicKey)

                return matchesTxId || matchesPublicKey
            })
            .map((tx) => toSigningTransaction(tx))
    }

    async setSigningKey(userId: string, key: SigningKey): Promise<void> {
        const item = signingKeyItem(key.id)
        const existing = await item.getValue()
        const serialized = fromSigningKey(key, userId)

        const writeKey: Promise<unknown>[] = [
            item.setValue({
                ...serialized,
                createdAt: existing?.createdAt ?? serialized.createdAt,
                updatedAt: new Date().toISOString(),
            }),
        ]
        if (!existing) {
            const index = await signingKeyIndexItem().getValue()
            if (!index.includes(key.id)) {
                writeKey.push(
                    signingKeyIndexItem().setValue([...index, key.id])
                )
            }
        }

        if (existing && existing.publicKey !== key.publicKey) {
            writeKey.push(publicKeyIndexItem(existing.publicKey).removeValue())
        }
        writeKey.push(publicKeyIndexItem(key.publicKey).setValue(key.id))

        if (existing && existing.name !== key.name) {
            writeKey.push(nameIndexItem(existing.name).removeValue())
        }
        writeKey.push(nameIndexItem(key.name).setValue(key.id))

        await Promise.all(writeKey)
    }
    async deleteSigningKey(userId: string, keyId: string): Promise<void> {
        const item = signingKeyItem(keyId)
        const existing = await item.getValue()
        if (!existing) return

        const index = await signingKeyIndexItem().getValue()
        const updatedIndex = index.filter((id) => id !== keyId)

        Promise.all([
            item.removeValue(),
            nameIndexItem(existing.name).removeValue(),
            publicKeyIndexItem(existing.publicKey).removeValue(),
            signingKeyIndexItem().setValue(updatedIndex),
        ])
    }
    async listSigningKeys(userId: string): Promise<SigningKey[]> {
        const index = await signingKeyIndexItem().getValue()
        const keys = await Promise.all(
            index.map((keyId) => this.getSigningKey(this.userId, keyId))
        )
        return keys.filter((k): k is SigningKey => k != undefined)
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
        await Promise.all(
            keys.map(async (key) => {
                const item = signingKeyItem(key.id)
                const existing = await item.getValue()
                const serialized = fromSigningKey(key, this.userId)

                await Promise.all([
                    item.setValue({
                        ...serialized,
                        createdAt: existing?.createdAt ?? serialized.createdAt,
                        updatedAt: new Date().toISOString(),
                    }),
                    publicKeyIndexItem(key.publicKey).setValue(key.id),
                    nameIndexItem(key.name).setValue(key.id),
                ])
            })
        )

        const currentIndex = await signingKeyIndexItem().getValue()
        const newIds = keys.map((k) => k.id)
        const mergedIndex = Array.from(new Set([...currentIndex, ...newIds]))

        await signingKeyIndexItem().setValue(mergedIndex)
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
