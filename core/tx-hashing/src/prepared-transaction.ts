// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    HashingSchemeVersion,
    PreparedTransaction,
} from '@canton-network/core-ledger-proto'

import { fromBase64, toBase64, toHex } from './bytes.ts'
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
 * @param format - The format of the output hash (base64 or hex)
 * @param options - The hashing scheme, the limits and how to read unknown fields
 * @returns The computed hash in the specified format
 * @throws {@link TxHashingError} For every refusal of the hash; the README lists the codes
 */
export async function hashPreparedTransaction(
    preparedTransaction: string | PreparedTransaction,
    format: 'base64' | 'hex' = 'base64',
    options?: HashPreparedTransactionOptions
): Promise<string> {
    const preparedTx =
        typeof preparedTransaction === 'string'
            ? PreparedTransaction.fromBinary(
                  fromBase64(preparedTransaction),
                  options?.readUnknownField === undefined
                      ? undefined
                      : { readUnknownField: options.readUnknownField }
              )
            : preparedTransaction

    // Bytes, so fields that this package's own bindings lack are refused
    const hash = await computePreparedTransactionHash(
        PreparedTransaction.toBinary(preparedTx),
        options?.hashingScheme ?? HashingSchemeVersion.V2,
        { limits: options?.limits }
    )

    switch (format) {
        case 'base64':
            return toBase64(hash)
        case 'hex':
            return toHex(hash)
    }
}
