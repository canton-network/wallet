// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    HashingSchemeVersion,
    PreparedTransaction,
} from '@canton-network/core-ledger-proto'
import { describe, expect, it } from 'vitest'

import { fromBase64, toBase64 } from '../bytes.ts'
import { hashPreparedTransaction } from '../prepared-transaction.ts'
import bigInt64V2 from './fixtures/big-int64-v2.json'
import { loadVectors } from './helpers/load-vectors.ts'

const { preparedTransaction, preparedTransactionHash } = bigInt64V2

describe('hashPreparedTransaction', () => {
    it('matches the hash the Ledger API returns, in base64 and hex', async () => {
        const fromLedgerApi = 'f97Cv1BO7QS7jmSY03p56JGsPf60Vx/ABXmRub7iiQI='
        const preparedTx =
            'CsoHCgMyLjESATAamwcKATDCPpQHCpEHCgMyLjESQjAwMTY4Nzc3ODEwNzU3MmJlZWVjYzQzODk3MmQxODQ4M2VhZDI1MGQxZDUwYmI2MzU3ZjdmYjhmNjdkY2U3ZDYzNRoNc3BsaWNlLXdhbGxldCKCAQpAZWI2ZTAxZWZhY2MzMzk3ZTIzYzZiZThiOWJlN2RiNGJmMzc2NzIyMTE5NzRkNjllMjRiNDg5ODBlMmY5OGI3ZRIhU3BsaWNlLldhbGxldC5UcmFuc2ZlclByZWFwcHJvdmFsGhtUcmFuc2ZlclByZWFwcHJvdmFsUHJvcG9zYWwqtQNysgMKggEKQGViNmUwMWVmYWNjMzM5N2UyM2M2YmU4YjliZTdkYjRiZjM3NjcyMjExOTc0ZDY5ZTI0YjQ4OTgwZTJmOThiN2USIVNwbGljZS5XYWxsZXQuVHJhbnNmZXJQcmVhcHByb3ZhbBobVHJhbnNmZXJQcmVhcHByb3ZhbFByb3Bvc2FsElcKCHJlY2VpdmVyEks6SWJvYjo6MTIyMDViZTNiOWQxNzc1NzNmZmZiNjhlYjI0NTk4NmY4OGI5ZGY1OGQ0NGNlNTc1ODE5MDc4OTcwNTgwZDg3ZDFkYzAScgoIcHJvdmlkZXISZjpkYXBwX3VzZXJfbG9jYWxuZXQtbG9jYWxwYXJ0eS0xOjoxMjIwM2E1MmZlNWFmM2I4N2UwNjk2MTgyYWM2NjhhNmNiMzE1ZGFiNGJkYzMwZGE5ZTViNmRkYTllYjcyODc4NDIxNhJeCgtleHBlY3RlZERzbxJPUk0KSzpJRFNPOjoxMjIwYmJkMDAwYjY5ODc1NzNiOGMwOWY0NDRlNGRmNTUwOWFmODk5N2I4MzkxMDlkN2UyYzIxMmQ1NDdmMGFmMDk1MDJJYm9iOjoxMjIwNWJlM2I5ZDE3NzU3M2ZmZmI2OGViMjQ1OTg2Zjg4YjlkZjU4ZDQ0Y2U1NzU4MTkwNzg5NzA1ODBkODdkMWRjMDpkYXBwX3VzZXJfbG9jYWxuZXQtbG9jYWxwYXJ0eS0xOjoxMjIwM2E1MmZlNWFmM2I4N2UwNjk2MTgyYWM2NjhhNmNiMzE1ZGFiNGJkYzMwZGE5ZTViNmRkYTllYjcyODc4NDIxNjpJYm9iOjoxMjIwNWJlM2I5ZDE3NzU3M2ZmZmI2OGViMjQ1OTg2Zjg4YjlkZjU4ZDQ0Y2U1NzU4MTkwNzg5NzA1ODBkODdkMWRjMCIiEiDBzeNcgqLvsssBxhNx7wP9pK71TsAprgz+a8jag/Lb3RL3ARJxCklib2I6OjEyMjA1YmUzYjlkMTc3NTczZmZmYjY4ZWIyNDU5ODZmODhiOWRmNThkNDRjZTU3NTgxOTA3ODk3MDU4MGQ4N2QxZGMwEiQ5NzU4ZTQ2ZS05ZmJlLTRmOTQtOTczZC04NWQ5ZTBmMTMyNzUaU2dsb2JhbC1kb21haW46OjEyMjBiYmQwMDBiNjk4NzU3M2I4YzA5ZjQ0NGU0ZGY1NTA5YWY4OTk3YjgzOTEwOWQ3ZTJjMjEyZDU0N2YwYWYwOTUwKiQ5NGJkYmFmNS0wYjJjLTQwYmMtOTZjZC1jM2M5YTlkODQ3ZDIw+eaGkdz0jwM='

        expect(await hashPreparedTransaction(preparedTx, 'base64')).toBe(
            fromLedgerApi
        )
        expect(await hashPreparedTransaction(preparedTx, 'hex')).toBe(
            '7fdec2bf504eed04bb8e6498d37a79e891ac3dfeb4571fc0057991b9bee28902'
        )
    })

    it('hashes a decoded prepared transaction like its base64', async () => {
        expect(
            await hashPreparedTransaction(
                PreparedTransaction.fromBinary(fromBase64(preparedTransaction))
            )
        ).toBe(preparedTransactionHash)
    })

    it('refuses input that is not base64', async () => {
        await expect(hashPreparedTransaction('badtx')).rejects.toThrow(
            expect.objectContaining({
                name: 'TxHashingError',
                code: 'DECODE_FAILED',
            })
        )
    })

    it('hashes an int64 above 2^53 exactly', async () => {
        // 2^53 + 1, which a JavaScript number rounds to 2^53
        expect(
            PreparedTransaction.toJsonString(
                PreparedTransaction.fromBinary(fromBase64(preparedTransaction))
            )
        ).toContain('"int64":"9007199254740993"')

        expect(await hashPreparedTransaction(preparedTransaction)).toBe(
            preparedTransactionHash
        )
    })

    it('refuses two nodes of one id', async () => {
        const prepared = PreparedTransaction.fromBinary(
            fromBase64(preparedTransaction)
        )
        const { nodes } = prepared.transaction!
        nodes.push({ ...nodes[0], nodeId: '5' })

        await expect(hashPreparedTransaction(prepared)).rejects.toThrow(
            expect.objectContaining({
                name: 'TxHashingError',
                code: 'DUPLICATE_NODE_ID',
            })
        )
    })

    it('hashes V3 when hashingScheme is V3', async () => {
        const vector = loadVectors().find(({ id }) => id === 'v3-create-plain')
        if (vector?.kind !== 'accepted') throw new Error('v3-create-plain')

        expect(
            await hashPreparedTransaction(vector.preparedTransaction, 'hex', {
                hashingScheme: HashingSchemeVersion.V3,
            })
        ).toBe(vector.expected.hash)
    })

    it('applies limits.maxNodes', async () => {
        // The participant's transaction has six nodes
        const hash = (maxNodes: number) =>
            hashPreparedTransaction(preparedTransaction, 'base64', {
                limits: { maxNodes },
            })

        await expect(hash(5)).rejects.toThrow(
            expect.objectContaining({
                name: 'TxHashingError',
                code: 'NODE_LIMIT_EXCEEDED',
            })
        )
        expect(await hash(6)).toBe(preparedTransactionHash)
    })

    it('hashes under V2 when the options are undefined', async () => {
        expect(
            await hashPreparedTransaction(preparedTransaction, 'base64', {
                hashingScheme: undefined,
                limits: undefined,
                readUnknownField: undefined,
            })
        ).toBe(preparedTransactionHash)
    })

    describe('with an unknown field', () => {
        // A message consisting only of field 999 (varint, value 1)
        const unknownField = Uint8Array.from([0xb8, 0x3e, 0x01])
        // Protobuf decodes concatenated messages as one: the transaction with
        // field 999 added
        const tx = toBase64(
            Uint8Array.from([
                ...fromBase64(preparedTransaction),
                ...unknownField,
            ])
        )

        it('refuses to hash it by default', async () => {
            await expect(hashPreparedTransaction(tx)).rejects.toThrow(
                expect.objectContaining({
                    name: 'TxHashingError',
                    code: 'UNKNOWN_FIELD',
                })
            )
        })

        it('hashes without it with readUnknownField: false', async () => {
            expect(
                await hashPreparedTransaction(tx, 'base64', {
                    readUnknownField: false,
                })
            ).toBe(preparedTransactionHash)
        })

        it('rejects it while decoding with readUnknownField: throw', async () => {
            await expect(
                hashPreparedTransaction(tx, 'hex', {
                    readUnknownField: 'throw',
                })
            ).rejects.toThrow(/Unknown field 999/)
        })
    })
})
