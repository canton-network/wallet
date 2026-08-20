// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserId } from '@canton-network/core-wallet-auth'
import { storage } from '@wxt-dev/storage'

const STORAGE_LOCATION = 'local'

export function item<T>(key: string) {
    return storage.defineItem<T>(`${STORAGE_LOCATION}:${key}`)
}

export function items<T>(key: string) {
    return storage.defineItem<T[]>(`${STORAGE_LOCATION}:${key}`, {
        fallback: [],
    })
}

export const signingKeysItem = () => items<SigningKeyRecord>('signingKeys')

export const signingTransactionsItem = () =>
    items<SigningTransactionRecord>('signingTransactions')

export const signingDriverConfigItem = (driverId: string) =>
    item<SigningDriverConfigRecord>(`signingDriverConfigItem:${driverId}`)

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

export interface SigningDriverConfigRecord {
    userId: UserId
    driverId: string
    config: string
}
