// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { HashingSchemeVersion } from '@canton-network/core-ledger-proto'
import { computePreparedTransactionHash } from '@canton-network/core-tx-hashing'

import { toBase64 } from './bytes.ts'
import { ClearSignError, causeMessage } from './errors.ts'

// V3 first: a V2 hash of a V3 transaction is a different value, so the claimed hash selects the scheme.
const SCHEMES = [HashingSchemeVersion.V3, HashingSchemeVersion.V2] as const

/**
 * Whether `preparedTransaction` hashes to `expectedHash`. The hash is computed from the bytes, under
 * each supported scheme; `expectedHash` only selects the scheme.
 *
 * @throws ClearSignError `HASH_UNVERIFIABLE` when a scheme refuses the transaction. The refusal ends
 * the check, so a later scheme is not tried.
 */
export async function hashesTo(
    preparedTransaction: string,
    expectedHash: string
): Promise<boolean> {
    for (const scheme of SCHEMES) {
        let digest: Uint8Array
        try {
            digest = await computePreparedTransactionHash(
                preparedTransaction,
                scheme
            )
        } catch (err) {
            throw new ClearSignError(
                'HASH_UNVERIFIABLE',
                `cannot hash the prepared transaction: ${causeMessage(err)}`,
                err
            )
        }
        if (toBase64(digest) === expectedHash) return true
    }
    return false
}
