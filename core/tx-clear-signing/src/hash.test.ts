// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { HashingSchemeVersion } from '@canton-network/core-ledger-proto'
import { computePreparedTransactionHash } from '@canton-network/core-tx-hashing'
import { describe, expect, it } from 'vitest'

import glLockCreate from './__tests__/fixtures/splice/gl-lock-create.json'
import createAndExercise from './__tests__/fixtures/v2-create-and-exercise.json'
import { fromBase64, toBase64 } from './bytes.ts'
import { hashesTo } from './hash.ts'

function hexToBase64(hex: string): string {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
    }
    return toBase64(bytes)
}

// Protobuf field 999, wire type varint, value 1. Concatenated messages decode as one.
const UNKNOWN_FIELD = Uint8Array.from([0xb8, 0x3e, 0x01])

describe('hashesTo', () => {
    it('accepts the hash under the scheme that reproduces it', async () => {
        const v2Hash = hexToBase64(createAndExercise.expected.hash)
        await expect(
            hashesTo(createAndExercise.preparedTransaction, v2Hash)
        ).resolves.toBe(true)
        await expect(
            hashesTo(
                glLockCreate.preparedTransaction,
                glLockCreate.preparedTransactionHash
            )
        ).resolves.toBe(true)
    })

    it('rejects a hash that belongs to another transaction', async () => {
        await expect(
            hashesTo(
                createAndExercise.preparedTransaction,
                btoa('x'.repeat(32))
            )
        ).resolves.toBe(false)
    })

    it('refuses a transaction with an unknown field', async () => {
        const tx = toBase64(
            Uint8Array.from([
                ...fromBase64(createAndExercise.preparedTransaction),
                ...UNKNOWN_FIELD,
            ])
        )
        await expect(hashesTo(tx, btoa('x'.repeat(32)))).rejects.toMatchObject({
            name: 'TxHashingError',
            code: 'UNKNOWN_FIELD',
        })
    })
})

describe('hashesTo scheme selection', () => {
    it('accepts the V3 hash of a transaction that also hashes under V2', async () => {
        const v2Transaction = createAndExercise.preparedTransaction
        const digest = await computePreparedTransactionHash(
            v2Transaction,
            HashingSchemeVersion.V3
        )
        const v3Hash = toBase64(digest)
        expect(v3Hash).not.toBe(hexToBase64(createAndExercise.expected.hash))
        await expect(hashesTo(v2Transaction, v3Hash)).resolves.toBe(true)
    })
})
