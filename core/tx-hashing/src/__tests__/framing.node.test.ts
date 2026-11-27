// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PreparedTransaction } from '@canton-network/core-ledger-proto'
import { describe, expect, it } from 'vitest'

import { fromBase64 } from '../bytes.ts'
import { readPreparedTransaction } from '../decode.ts'
import { TxHashingError } from '../errors.ts'
import { loadVectors } from './helpers/load-vectors.ts'

// A flipped bit must give another transaction or a refusal, except for bits
// that every parser drops: a bool of 3 is true, and an int32 or an int64 keeps
// the low 32 or 64 bits of a ten-byte varint. These vectors hold no `true`
// bool and no ten-byte varint.
describe('a flipped bit', () => {
    it.each(['v2-variant-enum', 'v3-input-contracts-disclosed'])(
        'never decodes %s to the original transaction',
        (id) => {
            const vector = loadVectors().find((v) => v.id === id)
            if (vector === undefined) throw new Error(`no vector ${id}`)
            const bytes = fromBase64(vector.preparedTransaction)
            const original = readPreparedTransaction(bytes)
            const unchanged: string[] = []
            for (let at = 0; at < bytes.length; at++) {
                for (let bit = 0; bit < 8; bit++) {
                    const flipped = new Uint8Array(bytes)
                    flipped[at] ^= 1 << bit
                    let decoded: PreparedTransaction
                    try {
                        decoded = readPreparedTransaction(flipped)
                    } catch (error) {
                        if (error instanceof TxHashingError) continue
                        throw error
                    }
                    if (PreparedTransaction.equals(original, decoded)) {
                        unchanged.push(`byte ${at} bit ${bit}`)
                    }
                }
            }
            expect(unchanged).toEqual([])
        },
        // About 17,000 decodes a vector
        30_000
    )
})
