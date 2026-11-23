// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import { fromBase64 } from '../bytes.ts'
import { TxHashingError } from '../errors.ts'
import {
    computeMultiHashForTopology,
    computeSha256CantonHash,
    computeTopologyMultiHash,
    HashPurpose,
} from '../topology.ts'
import generateTopology372 from './fixtures/generate-topology-3.7.2.json'
import decentralizedParty from './fixtures/topology-decentralized-party.json'
import { toHex } from './helpers/hex.ts'

const { v30, v31 } = generateTopology372

describe('computeSha256CantonHash', () => {
    const bytes = Uint8Array.of(1, 2, 3)

    it('prefixes the SHA-256 multihash header', async () => {
        const hash = await computeSha256CantonHash(11, bytes)

        expect(hash).toHaveLength(34)
        expect(toHex(hash.subarray(0, 2))).toBe('1220')
    })

    it('depends on the purpose', async () => {
        expect(await computeSha256CantonHash(11, bytes)).not.toEqual(
            await computeSha256CantonHash(55, bytes)
        )
    })
})

describe('computeMultiHashForTopology', () => {
    it('counts the hashes, then lists them by length and value in ascending order', async () => {
        const low = Uint8Array.of(1, 2)
        const high = Uint8Array.of(2, 1)

        expect(toHex(await computeMultiHashForTopology([high, low]))).toBe(
            '00000002' + '00000002' + '0102' + '00000002' + '0201'
        )
    })

    it.each([
        [
            'differ in a later byte',
            [
                [1, 2, 9],
                [1, 2, 3],
            ],
            [
                [1, 2, 3],
                [1, 2, 9],
            ],
        ],
        ['have a byte of 0x80 or more', [[0x80], [0x7f]], [[0x7f], [0x80]]],
        [
            'are prefixes of each other',
            [
                [1, 2, 3],
                [1, 2],
            ],
            [
                [1, 2],
                [1, 2, 3],
            ],
        ],
    ])('orders hashes that %s by bytes', async (_, input, sorted) => {
        const toArrays = (hashes: number[][]) =>
            hashes.map((hash) => Uint8Array.from(hash))

        expect(await computeMultiHashForTopology(toArrays(input))).toEqual(
            await computeMultiHashForTopology(toArrays(sorted))
        )
        expect(toHex(await computeMultiHashForTopology(toArrays(input)))).toBe(
            '00000002' +
                sorted
                    .map(
                        (hash) =>
                            hash.length.toString(16).padStart(8, '0') +
                            toHex(Uint8Array.from(hash))
                    )
                    .join('')
        )
    })

    it('does not change its input', async () => {
        const hashes = [Uint8Array.of(2), Uint8Array.of(1)]

        await computeMultiHashForTopology(hashes)

        expect(hashes).toEqual([Uint8Array.of(2), Uint8Array.of(1)])
    })
})

describe('computeTopologyMultiHash', () => {
    it.each([
        ['v30', v30],
        ['v31', v31],
    ])(
        'matches the multi-hash a participant computes for %s',
        async (_, { topologyTransactions, multiHash }) => {
            expect(await computeTopologyMultiHash(topologyTransactions)).toBe(
                multiHash
            )
        }
    )

    it.each([
        ['v30', decentralizedParty.v30],
        ['v31', decentralizedParty.v31],
    ])(
        'matches the multi-hash Canton accepts for the four transactions of a decentralized party in %s',
        async (_, { topologyTransactions, multiHash }) => {
            expect(await computeTopologyMultiHash(topologyTransactions)).toBe(
                multiHash
            )
        }
    )

    it('takes bytes like base64', async () => {
        expect(
            await computeTopologyMultiHash(
                v31.topologyTransactions.map(fromBase64)
            )
        ).toBe(v31.multiHash)
    })

    it('does not depend on the order of the transactions', async () => {
        const topologyTxs = [
            v30.topologyTransactions[0]!,
            v31.topologyTransactions[0]!,
        ]

        expect(await computeTopologyMultiHash(topologyTxs)).toBe(
            await computeTopologyMultiHash(topologyTxs.toReversed())
        )
    })

    it('hashes a set differently than a single transaction of it', async () => {
        expect(
            await computeTopologyMultiHash([
                v30.topologyTransactions[0]!,
                v31.topologyTransactions[0]!,
            ])
        ).not.toBe(v30.multiHash)
    })

    it('uses the topology hash purposes', () => {
        expect(HashPurpose).toEqual({
            TopologyTransactionSignature: 11,
            MultiTopologyTransaction: 55,
        })
    })

    it('refuses an empty set', async () => {
        await expect(computeTopologyMultiHash([])).rejects.toMatchObject({
            code: 'INVALID_VALUE',
        })
    })

    it('refuses a transaction that is not base64', async () => {
        await expect(computeTopologyMultiHash(['not base64!'])).rejects.toThrow(
            TxHashingError
        )
    })
})
