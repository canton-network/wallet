// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { HashingSchemeVersion } from '@canton-network/core-ledger-proto'
import { computePreparedTransactionHash } from '@canton-network/core-tx-hashing'
import { toBase64 } from './bytes.js'

// V3 first: a V2 hash of a V3 transaction is a different value, so the claimed hash selects the scheme.
const SCHEMES = [HashingSchemeVersion.V3, HashingSchemeVersion.V2] as const

/**
 * Whether `preparedTransaction` hashes to `expectedHash`. The hash is computed from the bytes, under
 * each supported scheme; `expectedHash` only selects the scheme. A transaction that cannot be hashed
 * throws.
 */
export async function hashesTo(
    preparedTransaction: string,
    expectedHash: string
): Promise<boolean> {
    for (const scheme of SCHEMES) {
        const digest = await computePreparedTransactionHash(
            preparedTransaction,
            scheme
        )
        if (toBase64(digest) === expectedHash) return true
    }
    return false
}
