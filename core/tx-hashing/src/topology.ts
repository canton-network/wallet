// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { concat, concatAll, fromBase64, sha256 } from './bytes.ts'
import { encodeInt32 } from './encoding.ts'
import { TxHashingError } from './errors.ts'

/**
 * Canton's hash purposes, as defined in
 * https://github.com/digital-asset/canton/blob/main/community/base/src/main/scala/com/digitalasset/canton/crypto/HashPurpose.scala
 */
export const HashPurpose = {
    TopologyTransactionSignature: 11,
    MultiTopologyTransaction: 55,
} as const

export type HashPurpose = (typeof HashPurpose)[keyof typeof HashPurpose]

function compare(a: Uint8Array, b: Uint8Array): number {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] !== b[i]) return a[i]! - b[i]!
    }
    return a.length - b.length
}

/**
 * Hashes bytes the way Canton does: SHA-256 over the hash purpose and the bytes,
 * prefixed with the multihash header for SHA-256.
 */
export async function computeSha256CantonHash(
    purpose: HashPurpose,
    bytes: Uint8Array
): Promise<Uint8Array> {
    return concat(0x12, 0x20, await sha256(concat(encodeInt32(purpose), bytes)))
}

/**
 * Combines the hashes of a set of topology transactions, in an order that does not depend on theirs.
 * A hash given more than once counts once, as Canton signs a set of hashes.
 */
export async function computeMultiHashForTopology(
    hashes: Uint8Array[]
): Promise<Uint8Array> {
    const sorted = hashes.toSorted(compare)
    const unique = sorted.filter(
        (hash, i) => i === 0 || compare(sorted[i - 1]!, hash) !== 0
    )
    return concatAll([
        encodeInt32(unique.length),
        ...unique.flatMap((hash) => [encodeInt32(hash.length), hash]),
    ])
}

/**
 * Computes the multi-hash a signature over a set of topology transactions is made on.
 *
 * @param topologyTxs - The topology transactions, in base64 format as the Ledger API returns them or as bytes:
 *   each is hashed over the bytes of its `UntypedVersionedMessage` wrapper, not the inner message
 * @returns The multi-hash in base64 format
 */
export async function computeTopologyMultiHash(
    topologyTxs: string[] | Uint8Array[]
): Promise<string> {
    if (topologyTxs.length === 0) {
        throw new TxHashingError(
            'INVALID_VALUE',
            'No topology transactions to hash'
        )
    }
    const hashes = await Promise.all(
        topologyTxs.map((topologyTx) =>
            computeSha256CantonHash(
                HashPurpose.TopologyTransactionSignature,
                typeof topologyTx === 'string'
                    ? fromBase64(topologyTx)
                    : topologyTx
            )
        )
    )
    const multiHash = await computeSha256CantonHash(
        HashPurpose.MultiTopologyTransaction,
        await computeMultiHashForTopology(hashes)
    )
    return btoa(String.fromCharCode(...multiHash))
}
