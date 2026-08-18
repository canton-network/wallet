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

export const signingKeyItem = (keyId: string) =>
    storage.defineItem<SigningKeyRecord>(`local:signingKeyItem:${keyId}`, {})

export const signingKeyIndexItem = () =>
    storage.defineItem<string[]>(`local:signingKeyItemIndex`, {
        fallback: [],
    })

export const publicKeyIndexItem = (publicKey: string) =>
    storage.defineItem<string | null>(
        `local:signingKeyByPublicKey:${publicKey}`,
        { fallback: null }
    )

export const nameIndexItem = (name: string) =>
    storage.defineItem<string | null>(`local:signingKeyByName:${name}`, {
        fallback: null,
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
    table: SigningKeyRecord,
    decrypt?: (data: string) => string
): SigningKey => {
    return {
        id: table.id,
        name: table.name,
        publicKey: table.publicKey,
        ...(table.privateKey
            ? {
                  privateKey: decrypt
                      ? decrypt(table.privateKey)
                      : table.privateKey,
              }
            : {}),
        createdAt: new Date(table.createdAt),
        updatedAt: new Date(table.updatedAt),
        ...(table.metadata
            ? {
                  metadata:
                      typeof table.metadata === 'string'
                          ? JSON.parse(table.metadata)
                          : table.metadata,
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

export const signingTransactionItem = (txId: string) =>
    storage.defineItem<SigningTransactionRecord>(
        `local:signingTransactionitem:${txId}`,
        {}
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
    table: SigningTransactionRecord
): SigningTransaction => {
    return {
        id: table.id,
        hash: table.hash,
        ...(table.signature ? { signature: table.signature } : {}),
        publicKey: table.publicKey,
        status: table.status as SigningDriverStatus,
        ...(table.metadata
            ? {
                  metadata:
                      typeof table.metadata === 'string'
                          ? JSON.parse(table.metadata)
                          : table.metadata,
              }
            : {}),
        createdAt: new Date(table.createdAt),
        updatedAt: new Date(table.updatedAt),
        ...(table.signedAt ? { signedAt: new Date(table.signedAt) } : {}),
    }
}

export const signingTransactionIndexItem = () =>
    storage.defineItem<string[]>(`local:signingTransactionItemIndex`, {
        fallback: [],
    })

export const txsByPublicKeysIndexItem = (publicKey: string) =>
    storage.defineItem<string[]>(
        `local:signignTransactionByPublicKey:${publicKey}`,
        { fallback: [] }
    )

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
    table: SigningDriverConfigRecord
): SigningDriverConfig => {
    return {
        driverId: table.driverId,
        config:
            typeof table.config === 'string'
                ? JSON.parse(table.config)
                : table.config,
    }
}
