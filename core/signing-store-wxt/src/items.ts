// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserId } from '@canton-network/core-wallet-auth'
import { storage } from '@wxt-dev/storage'

export const signingKeysItem = () =>
    storage.defineItem<SigningKeyRecord[]>(`local:signingKeys`, {
        fallback: [],
    })

export const signingTransactionsItem = () =>
    storage.defineItem<SigningTransactionRecord[]>(
        `local:signingTransactions`,
        {
            fallback: [],
        }
    )

export const signingDriverConfigItem = (driverId: string) =>
    storage.defineItem<SigningDriverConfigRecord>(
        `local:signingDriverConfigItem:${driverId}`,
        {}
    )

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
