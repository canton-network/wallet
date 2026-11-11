// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Refusal codes; the README describes each. */
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

/** Thrown when `computePreparedTransactionHash` refuses a transaction, a scheme or an option. */
export class TxHashingError extends Error {
    readonly code: TxHashingErrorCode
    /** Path of the field at fault, if known, such as `transaction.nodes[2].v1.exercise.children[0]` */
    readonly path?: string

    constructor(code: TxHashingErrorCode, message: string, path?: string) {
        super(message)
        this.name = 'TxHashingError'
        this.code = code
        if (path !== undefined) this.path = path
    }
}
