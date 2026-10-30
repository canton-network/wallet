// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Why a prepared transaction was refused, for programs to act on; the package
 * README describes each code. The message is for people.
 */
export type TxHashingErrorCode =
    | 'DECODE_FAILED'
    | 'UNKNOWN_FIELD'
    | 'UNSUPPORTED_SCHEME'
    | 'UNSUPPORTED_NODE_VERSION'
    | 'UNSUPPORTED_LF_VERSION'
    | 'FIELD_NOT_COVERED_BY_SCHEME'
    | 'MISSING_FIELD'
    | 'MISSING_NODE_SEED'
    | 'DUPLICATE_NODE_SEED'
    | 'INVALID_NODE_ID'
    | 'DUPLICATE_NODE_ID'
    | 'DANGLING_NODE_REFERENCE'
    | 'SHARED_CHILD'
    | 'CYCLE'
    | 'ORPHAN_NODE'
    | 'NODE_LIMIT_EXCEEDED'
    | 'DEPTH_LIMIT_EXCEEDED'
    | 'INVALID_HEX'
    | 'INVALID_VALUE'

/**
 * The error that `computePreparedTransactionHash` rejects with when it refuses
 * a prepared transaction, its scheme or its options. It is the only one, given
 * WebCrypto (`globalThis.crypto.subtle`), input of the documented types, plain
 * options and room on the caller's stack.
 */
export class TxHashingError extends Error {
    readonly code: TxHashingErrorCode
    /**
     * Where the problem is, when known: a proto JSON field path into the
     * prepared transaction, with lowerCamelCase names, no oneof group names
     * and indices in brackets, such as
     * `transaction.nodes[2].v1.exercise.children[0]`, also for a limit that
     * the transaction exceeds; or `options.limits.<name>` for a limit option
     * that is not valid.
     */
    readonly path?: string

    constructor(code: TxHashingErrorCode, message: string, path?: string) {
        super(message)
        this.name = 'TxHashingError'
        this.code = code
        if (path !== undefined) this.path = path
    }
}
