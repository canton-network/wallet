// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    HashingSchemeVersion,
    PreparedTransaction,
} from '@canton-network/core-ledger-proto'
import {
    computePreparedTransactionHash,
    type HashingScheme,
    type TraversalLimits,
    TxHashingError,
} from '@canton-network/core-tx-hashing'
import type { OfflineSDKContext } from '../../../sdk.js'
import { Converter } from './converter.js'
import {
    computeMultiHashForTopology,
    computeSha256CantonHash,
} from '@canton-network/core-tx-visualizer'

export class HashNamespace {
    constructor(private readonly ctx: OfflineSDKContext) {}

    /**
     * @deprecated use preparedTransaction
     */
    public async preparedTransacation(
        value: PreparedTransaction | string
    ): Promise<Converter> {
        return await this.preparedTransaction(value)
    }

    /**
     * Computes the hash of a prepared transaction with
     * `@canton-network/core-tx-hashing`, under hashing scheme V2 unless
     * `scheme` names V3.
     *
     * A message object is first encoded with this package's bindings:
     * protobuf-ts writes a lone surrogate as U+FFFD and throws its own error
     * for a value it cannot encode. A message decoded from bytes holds neither.
     *
     * @param value - The prepared transaction as a message, or as its protobuf
     *   bytes in canonical standard base64 (padded, without whitespace), as
     *   the JSON API returns it
     * @param scheme - The hashing scheme the participant used, as its prepare
     *   response names it or as a `HashingSchemeVersion`. V2 by default.
     * @param options - `limits` replaces core-tx-hashing's `DEFAULT_LIMITS`
     *   one by one
     * @returns The 32-byte hash, to read as hex or base64
     * @throws {SDKError} Of type `BadRequest` for every transaction, scheme or
     *   limit that core-tx-hashing refuses (its README lists them). Its
     *   message starts with `prepared transaction refused:` and the refusal's
     *   code and path, and its `context.originalError` is the
     *   `TxHashingError`. Any other error, such as one that protobuf-ts throws
     *   while encoding a message, is passed on unchanged.
     */
    public async preparedTransaction(
        value: PreparedTransaction | string,
        scheme: HashingScheme = HashingSchemeVersion.V2,
        options?: { limits?: Partial<TraversalLimits> | undefined }
    ): Promise<Converter> {
        try {
            // Bytes, so fields core-tx-hashing's own bindings lack are refused
            const input =
                typeof value === 'string'
                    ? value
                    : PreparedTransaction.toBinary(value)
            const hash = await computePreparedTransactionHash(input, scheme, {
                limits: options?.limits,
            })
            return new Converter(hash)
        } catch (error) {
            if (!(error instanceof TxHashingError)) throw error
            const at = error.path === undefined ? '' : ` at ${error.path}`
            this.ctx.error.throw({
                type: 'BadRequest',
                message: `prepared transaction refused: ${error.code}${at}: ${error.message}`,
                originalError: error,
            })
        }
    }

    /**
     *
     * @param preparedTransactions list of prepared topology transactions
     * @returns a multihash combining all of the topology txs
     */
    public async topologyTransaction(
        preparedTransactions: Uint8Array<ArrayBufferLike>[] | string[]
    ) {
        let normalized: Uint8Array<ArrayBufferLike>[]
        if (typeof preparedTransactions[0] === 'string') {
            normalized = (preparedTransactions as string[]).map((tx) =>
                Buffer.from(tx, 'base64')
            )
        } else {
            normalized = preparedTransactions as Uint8Array<ArrayBufferLike>[]
        }

        // Prepending the hash purpose for TopologyTransactionSignature and MultiTopologyTransaction
        // https://github.com/hyperledger-labs/splice/blob/53738545af6d0714bddff54c3309ecf2fe6d1881/canton/community/base/src/main/scala/com/digitalasset/canton/crypto/HashPurpose.scala#L47
        const rawHashes = await Promise.all(
            normalized.map((tx) => computeSha256CantonHash(11, tx))
        )
        const combinedHashes = await computeMultiHashForTopology(rawHashes)

        const computedHash = await computeSha256CantonHash(55, combinedHashes)

        return Buffer.from(computedHash).toString('base64')
    }
}
