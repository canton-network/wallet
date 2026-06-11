// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest'
import type {
    SigningDriverConfig,
    SigningKey,
    SigningTransaction,
} from '@canton-network/core-signing-lib'
import {
    fromSigningDriverConfig,
    fromSigningKey,
    fromSigningTransaction,
    toSigningDriverConfig,
    toSigningKey,
    toSigningTransaction,
} from './schema.js'

const userId = 'user-1'
const createdAt = new Date('2024-06-01T12:00:00.000Z')
const updatedAt = new Date('2024-06-02T12:00:00.000Z')
const signedAt = new Date('2024-06-03T12:00:00.000Z')

describe('schema mappers', () => {
    test('fromSigningKey and toSigningKey round-trip with optional fields', () => {
        const key: SigningKey = {
            id: 'key-1',
            name: 'name-1',
            publicKey: 'pub',
            privateKey: 'secret',
            metadata: {},
            createdAt,
            updatedAt,
        }

        const table = fromSigningKey(key, userId)
        expect(table.privateKey).toBe('secret')
        expect(table.metadata).toBe(JSON.stringify(key.metadata))

        const roundTrip = toSigningKey(table)
        expect(roundTrip).toMatchObject({
            id: key.id,
            name: key.name,
            publicKey: key.publicKey,
            privateKey: key.privateKey,
            metadata: key.metadata,
        })
        expect(roundTrip.createdAt).toEqual(createdAt)
        expect(roundTrip.updatedAt).toEqual(updatedAt)
    })

    test('fromSigningKey uses encrypt for private keys and or sets it null if omitted', () => {
        const withPrivate: SigningKey = {
            id: 'key-1',
            name: 'name-1',
            publicKey: 'pub',
            privateKey: 'plain',
            createdAt,
            updatedAt,
        }
        expect(
            fromSigningKey(withPrivate, userId, (data) => `enc:${data}`)
                .privateKey
        ).toBe('enc:plain')

        const withoutPrivate: SigningKey = {
            id: 'key-2',
            name: 'name-2',
            publicKey: 'pub-2',
            createdAt,
            updatedAt,
        }
        expect(fromSigningKey(withoutPrivate, userId).privateKey).toBeNull()
    })

    test('toSigningKey decrypts private keys', () => {
        const table = fromSigningKey(
            {
                id: 'key-1',
                name: 'name-1',
                publicKey: 'pub',
                privateKey: 'encrypted',
                metadata: {},
                createdAt,
                updatedAt,
            },
            userId
        )

        expect(toSigningKey(table, (data) => `dec:${data}`).privateKey).toBe(
            'dec:encrypted'
        )
    })

    test('fromSigningTransaction and toSigningTransaction round-trip', () => {
        const tx: SigningTransaction = {
            id: 'tx-1',
            hash: 'abc',
            signature: 'sig',
            publicKey: 'pub',
            status: 'signed',
            metadata: { driver: 'internal' },
            createdAt,
            updatedAt,
            signedAt,
        }

        const table = fromSigningTransaction(tx, userId)
        expect(table.signature).toBe('sig')
        expect(table.signedAt).toBe(signedAt.toISOString())

        const roundTrip = toSigningTransaction(table)
        expect(roundTrip).toMatchObject({
            id: tx.id,
            hash: tx.hash,
            signature: tx.signature,
            publicKey: tx.publicKey,
            status: tx.status,
            metadata: tx.metadata,
        })
        expect(roundTrip.signedAt).toEqual(signedAt)
    })

    test('toSigningTransaction omits optional signature and signedAt', () => {
        const table = fromSigningTransaction(
            {
                id: 'tx-2',
                hash: 'h2',
                publicKey: 'pub2',
                status: 'pending',
                createdAt,
                updatedAt,
            },
            userId
        )

        const tx = toSigningTransaction(table)
        expect(tx.signature).toBeUndefined()
        expect(tx.signedAt).toBeUndefined()
        expect(tx.metadata).toBeUndefined()
    })

    test('fromSigningDriverConfig and toSigningDriverConfig round-trip', () => {
        const config: SigningDriverConfig = {
            driverId: 'driver-id',
            config: { enabled: true, retries: 3 },
        }

        const table = fromSigningDriverConfig(config, userId)
        expect(toSigningDriverConfig(table)).toEqual(config)
    })
})
