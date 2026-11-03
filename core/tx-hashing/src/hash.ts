// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { HashingSchemeVersion } from '@canton-network/core-ledger-proto'
import { readPreparedTransaction } from './decode.js'
import { TxHashingError } from './errors.js'
import { checkForest } from './forest.js'
import { DEFAULT_LIMITS, type TraversalLimits } from './limits.js'
import { hashPrepared, type Scheme } from './scheme.js'
import { schemeV2 } from './v2.js'
import { schemeV3 } from './v3.js'

/** A `HashingSchemeVersion` or its JSON API name */
export type HashingScheme =
    | HashingSchemeVersion.V2
    | HashingSchemeVersion.V3
    | 'HASHING_SCHEME_VERSION_V2'
    | 'HASHING_SCHEME_VERSION_V3'

export interface HashOptions {
    /** Overrides for `DEFAULT_LIMITS`: integers of at least 1, `maxValueDepth` at most 256 */
    limits?: Partial<TraversalLimits> | undefined
}

const SCHEMES = new Map<HashingScheme, Scheme>([
    [HashingSchemeVersion.V2, schemeV2],
    ['HASHING_SCHEME_VERSION_V2', schemeV2],
    [HashingSchemeVersion.V3, schemeV3],
    ['HASHING_SCHEME_VERSION_V3', schemeV3],
])

// Upper bound for `maxValueDepth`, as values are encoded recursively
const MAX_VALUE_DEPTH = 256

/**
 * Recomputes the participant's hash of a prepared transaction, so that a
 * signer can check it rather than trust it. Needs WebCrypto.
 *
 * @param input - Protobuf bytes, or the same bytes in base64 as the JSON API returns them
 * @param scheme - The hashing scheme the participant used
 * @param options - Overrides for `DEFAULT_LIMITS`
 * @returns The 32-byte SHA-256 hash
 * @throws {@link TxHashingError} For every refusal; the README lists the codes
 */
export async function computePreparedTransactionHash(
    input: Uint8Array | string,
    scheme: HashingScheme,
    options?: HashOptions
): Promise<Uint8Array<ArrayBuffer>> {
    const hashingScheme = SCHEMES.get(scheme)
    if (hashingScheme === undefined) {
        const shown =
            typeof scheme === 'string'
                ? JSON.stringify(scheme)
                : typeof scheme === 'number'
                  ? String(scheme)
                  : typeof scheme
        throw new TxHashingError(
            'UNSUPPORTED_SCHEME',
            `hashing scheme ${shown} is not supported: expected HashingSchemeVersion.V2 or V3, or HASHING_SCHEME_VERSION_V2 or HASHING_SCHEME_VERSION_V3`
        )
    }
    const limits = limitsOf(options)
    const prepared = readPreparedTransaction(input)
    const transaction = prepared.transaction
    if (transaction === undefined) {
        throw new TxHashingError(
            'MISSING_FIELD',
            'prepared transaction has no transaction',
            'transaction'
        )
    }
    if (transaction.roots.length === 0) {
        throw new TxHashingError(
            'MISSING_FIELD',
            'transaction has no roots',
            'transaction.roots'
        )
    }
    const forest = checkForest(transaction, limits)
    return hashPrepared(
        transaction,
        prepared.metadata,
        forest,
        hashingScheme,
        limits.maxValueDepth
    )
}

function limitsOf(options: HashOptions | undefined): TraversalLimits {
    const limits = { ...DEFAULT_LIMITS }
    for (const name of Object.keys(limits) as (keyof TraversalLimits)[]) {
        const value = options?.limits?.[name]
        if (value === undefined) continue
        if (!(Number.isInteger(value) && value >= 1)) {
            throw invalidLimit(name, 'must be an integer of at least 1')
        }
        if (name === 'maxValueDepth' && value > MAX_VALUE_DEPTH) {
            throw invalidLimit(name, `must be at most ${MAX_VALUE_DEPTH}`)
        }
        limits[name] = value
    }
    return limits
}

const invalidLimit = (name: keyof TraversalLimits, problem: string) =>
    new TxHashingError(
        'INVALID_VALUE',
        `options.limits.${name} ${problem}`,
        `options.limits.${name}`
    )
