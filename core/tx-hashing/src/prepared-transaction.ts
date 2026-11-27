// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    HashingSchemeVersion,
    PreparedTransaction,
} from '@canton-network/core-ledger-proto'

import { fromBase64 } from './bytes.ts'
import { Converter } from './converter.ts'
import {
    computePreparedTransactionHash,
    type HashingScheme,
    type HashOptions,
} from './hash.ts'

export interface HashPreparedTransactionOptions extends HashOptions {
    /** The hashing scheme the participant used, V2 by default */
    hashingScheme?: HashingScheme | undefined
    /**
     * What to do with an unknown field of a base64 `preparedTransaction` while decoding it:
     * keep it, so that hashing refuses it (`true`, the default), drop it (`false`) or throw (`'throw'`)
     */
    readUnknownField?: boolean | 'throw' | undefined
}

/**
 * Computes the hash of a prepared transaction.
 * With `readUnknownField: false`, unknown fields are dropped before hashing instead of refused.
 *
 * @param preparedTransaction - The prepared transaction to hash, decoded or in base64
 * @param options - The hashing scheme, the limits and how to read unknown fields
 * @returns The hash, to read in base64 or hex
 * @throws {@link TxHashingError} For every refusal of the hash; the README lists the codes
 */
export async function hashPreparedTransaction(
    preparedTransaction: string | PreparedTransaction,
    options?: HashPreparedTransactionOptions
): Promise<Converter> {
    // Bytes, so fields that this package's own bindings lack are refused
    const input =
        typeof preparedTransaction !== 'string'
            ? PreparedTransaction.toBinary(preparedTransaction)
            : options?.readUnknownField === undefined
              ? preparedTransaction
              : PreparedTransaction.toBinary(
                    PreparedTransaction.fromBinary(
                        fromBase64(preparedTransaction),
                        { readUnknownField: options.readUnknownField }
                    )
                )
    const hash = await computePreparedTransactionHash(
        input,
        options?.hashingScheme ?? HashingSchemeVersion.V2,
        { limits: options?.limits }
    )
    return new Converter(hash)
}
