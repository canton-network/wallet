// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    HashingSchemeVersion,
    type PreparedTransaction,
} from '@canton-network/core-ledger-proto'
import { readPreparedTransaction } from './decode.js'
import { TxHashingError } from './errors.js'
import { checkForest } from './forest.js'
import { DEFAULT_LIMITS, type TraversalLimits } from './limits.js'
import { hashPrepared, transactionOf, type Scheme } from './scheme.js'
import { schemeV2 } from './v2.js'
import { schemeV3 } from './v3.js'

/**
 * A hashing scheme this package computes, as a `HashingSchemeVersion` value
 * or by the name the JSON API gives it.
 */
export type HashingScheme =
    | HashingSchemeVersion.V2
    | HashingSchemeVersion.V3
    | 'HASHING_SCHEME_VERSION_V2'
    | 'HASHING_SCHEME_VERSION_V3'

/** Options of {@link computePreparedTransactionHash}. */
export interface HashOptions {
    /**
     * Limits that replace `DEFAULT_LIMITS` one by one; a limit left out or
     * undefined keeps its default. Each is an integer of at least 1, and
     * `maxValueDepth` is at most 256.
     */
    limits?: Partial<TraversalLimits> | undefined
}

const SCHEMES = new Map<HashingScheme, Scheme>([
    [HashingSchemeVersion.V2, schemeV2],
    ['HASHING_SCHEME_VERSION_V2', schemeV2],
    [HashingSchemeVersion.V3, schemeV3],
    ['HASHING_SCHEME_VERSION_V3', schemeV3],
])

/**
 * The most that options may set maxValueDepth to. Values are encoded
 * recursively, starting from a fresh stack, so the cap stays far below the
 * depth that exhausts a stack, and above the 101 levels Daml allows.
 */
export const MAX_VALUE_DEPTH = 256

/**
 * Recomputes the hash that the participant computes for a prepared
 * transaction, so that a signer can check the participant's hash rather than
 * trust it. Compare the result with the participant's raw 32-byte hash and,
 * if they are equal, sign this locally computed hash.
 *
 * Needs WebCrypto: `globalThis.crypto.subtle` exists in Node and, in
 * browsers, in secure contexts only (https, localhost). Elsewhere, polyfill
 * it.
 *
 * @param input - The prepared transaction as protobuf bytes, as those bytes
 *   in canonical standard base64 (padded, no whitespace), as the JSON API
 *   returns them, or as a protobuf-ts `PreparedTransaction` message. Pass a
 *   message only if it comes from the `@canton-network/core-ledger-proto`
 *   version this package depends on, and its bytes otherwise: a field only
 *   another version knows would be dropped, not refused.
 * @param scheme - The hashing scheme the participant used
 * @param options - Limits on the nodes and nesting of the transaction
 * @returns A new 32-byte SHA-256 hash
 * @throws {@link TxHashingError} as a rejection, for every refusal. The
 *   package README lists the codes.
 */
export async function computePreparedTransactionHash(
    input: Uint8Array | string | PreparedTransaction,
    scheme: HashingScheme,
    options?: HashOptions
): Promise<Uint8Array<ArrayBuffer>> {
    const hashingScheme = SCHEMES.get(scheme)
    if (hashingScheme === undefined) {
        throw new TxHashingError(
            'UNSUPPORTED_SCHEME',
            `hashing scheme ${shown(scheme)} is not supported: expected HashingSchemeVersion.V2 or V3, or HASHING_SCHEME_VERSION_V2 or HASHING_SCHEME_VERSION_V3`
        )
    }
    const limits = limitsOf(options)
    const decode = readPreparedTransaction(input)
    // Decoding bytes and encoding values recurse once per nesting level, so
    // they run after this await, on the fresh stack of a microtask. The input
    // is read before it, on the caller's stack, as it is at the call: bytes
    // are copied, and a message object is encoded and compared with its
    // decoding, which recurses as well
    await Promise.resolve()
    const prepared = decode()
    const transaction = transactionOf(prepared)
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
        if (name === 'maxValueDepth' && !(value <= MAX_VALUE_DEPTH)) {
            throw invalidLimit(
                name,
                `must be at most ${MAX_VALUE_DEPTH}, as values are encoded recursively`
            )
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

/** The scheme as an error message shows it, whatever a JavaScript caller passed */
function shown(scheme: unknown): string {
    if (typeof scheme === 'number') return String(scheme)
    if (typeof scheme !== 'string') return `of type ${typeof scheme}`
    return scheme.length > 40
        ? `${JSON.stringify(scheme.slice(0, 40))}...`
        : JSON.stringify(scheme)
}
