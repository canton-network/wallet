// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    SigningDriverConfig,
    SigningDriverStatus,
    SigningKey,
    SigningTransaction,
} from '@canton-network/core-signing-lib'
import { UserId } from '@canton-network/core-wallet-auth'
import { storage } from '@wxt-dev/storage'

//signing key schemas

export interface SigningKeyRecord {
    id: string
    userId: UserId
    name: string
    publicKey: string
    privateKey: string | null
    metadata: string | null
    createdAt: string
    updatedAt: string
}

export const signingKeysItem = () =>
    storage.defineItem<SigningKeyRecord[]>(`local:signingKeys`, {
        fallback: [],
    })

export const fromSigningKey = (
    key: SigningKey,
    userId: UserId,
    encrypt?: (data: string) => string
): SigningKeyRecord => {
    return {
        id: key.id,
        userId: userId,
        name: key.name,
        publicKey: key.publicKey,
        privateKey: key.privateKey
            ? encrypt
                ? encrypt(key.privateKey)
                : key.privateKey
            : null,
        metadata: key.metadata ? JSON.stringify(key.metadata) : null,
        createdAt: key.createdAt.toISOString(),
        updatedAt: key.updatedAt.toISOString(),
    }
}

export const toSigningKey = (
    record: SigningKeyRecord,
    decrypt?: (data: string) => string
): SigningKey => {
    return {
        id: record.id,
        name: record.name,
        publicKey: record.publicKey,
        ...(record.privateKey
            ? {
                  privateKey: decrypt
                      ? decrypt(record.privateKey)
                      : record.privateKey,
              }
            : {}),
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
        ...(record.metadata
            ? {
                  metadata:
                      typeof record.metadata === 'string'
                          ? JSON.parse(record.metadata)
                          : record.metadata,
              }
            : {}),
    }
}

//signing transaction item schemas

export interface SigningTransactionRecord {
    id: string
    userId: UserId
    hash: string
    signature: string | null
    publicKey: string
    status: string
    metadata: string | null
    createdAt: string
    updatedAt: string
    signedAt: string | null
}

export const signingTransactionsItem = () =>
    storage.defineItem<SigningTransactionRecord[]>(
        `local:signingTransactions`,
        {
            fallback: [],
        }
    )

export const fromSigningTransaction = (
    transaction: SigningTransaction,
    userId: UserId
): SigningTransactionRecord => {
    return {
        id: transaction.id,
        userId: userId,
        hash: transaction.hash,
        signature: transaction.signature || null,
        publicKey: transaction.publicKey,
        status: transaction.status,
        metadata: transaction.metadata
            ? JSON.stringify(transaction.metadata)
            : null,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
        signedAt: transaction.signedAt?.toISOString() || null,
    }
}

export const toSigningTransaction = (
    record: SigningTransactionRecord
): SigningTransaction => {
    return {
        id: record.id,
        hash: record.hash,
        ...(record.signature ? { signature: record.signature } : {}),
        publicKey: record.publicKey,
        status: record.status as SigningDriverStatus,
        ...(record.metadata
            ? {
                  metadata:
                      typeof record.metadata === 'string'
                          ? JSON.parse(record.metadata)
                          : record.metadata,
              }
            : {}),
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
        ...(record.signedAt ? { signedAt: new Date(record.signedAt) } : {}),
    }
}

//signing driver schemas

export interface SigningDriverConfigRecord {
    userId: UserId
    driverId: string
    config: string
}
export const signingDriverConfigItem = (driverId: string) =>
    storage.defineItem<SigningDriverConfigRecord>(
        `local:signingDriverConfigItem:${driverId}`,
        {}
    )

export const fromSigningDriverConfig = (
    config: SigningDriverConfig,
    userId: UserId
): SigningDriverConfigRecord => {
    return {
        userId: userId,
        driverId: config.driverId,
        config: JSON.stringify(config.config),
    }
}

export const toSigningDriverConfig = (
    record: SigningDriverConfigRecord
): SigningDriverConfig => {
    return {
        driverId: record.driverId,
        config:
            typeof record.config === 'string'
                ? JSON.parse(record.config)
                : record.config,
    }
}
