// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** The identity of a Daml template or interface, which a descriptor binds to exactly. */
export interface TemplateRef {
    packageId: string
    moduleName: string
    entityName: string
}

/** A field as shown to the user: its formatted value, or why it cannot be shown. */
export type DescribedField =
    | { label: string; value: string }
    | { label: string; error: string }

/**
 * - `described`: `intent` is the descriptor's interpolated intent, or its stable intent when it
 *   has no interpolated one.
 * - `unfilled`: the descriptor has an interpolated intent and a placeholder's field could not be
 *   shown, so `intent` is a generic sentence saying the descriptor does not match the transaction.
 *   `reason` names the placeholder. The descriptor is trusted and valid; the wording does not fit.
 * - `undescribed`: no descriptor words the node, so `intent` is generic.
 * - `unverified`: the descriptor bound to the node is not trusted, so `intent` is generic and
 *   `reason` says why. The descriptor's wording is not shown.
 * - `invalid`: the descriptor bound to the node is not valid, or there is more than one, so
 *   `intent` is generic and `reason` says why.
 * - `undescribable`: the node cannot be read, so `intent` is generic and `reason` says why.
 */
export type OperationStatus =
    | 'described'
    | 'unfilled'
    | 'undescribed'
    | 'unverified'
    | 'invalid'
    | 'undescribable'

/**
 * How one root node of a prepared transaction is shown.
 *
 * `kind`, `template`, `choiceId` and `interface` are read from the transaction, so a descriptor
 * cannot change what the user is told is being done. `fields` and `descriptor` come from the
 * descriptor bound to `template`. `intent` does too, except when the status is not `described`:
 * then it is generic.
 */
export type OperationDescription = {
    status: OperationStatus
    /** The sentence the user reads. Text values from the transaction are JSON-quoted. */
    intent: string
    /** One row per field the bound descriptor lists, in order. Empty unless the status is `described` or `unfilled`. */
    fields: DescribedField[]
    /** Why the status is not `described`. Absent for `described` and `undescribed`. For display only. */
    reason?: string
    /**
     * The bound descriptor's claim about itself. Present only when a trusted, valid descriptor is
     * bound to the node.
     */
    descriptor?: {
        name: string
        version: string
        publisher: string
        url?: string
    }
} & (
    | { kind: 'create'; template: TemplateRef }
    | {
          kind: 'exercise'
          template: TemplateRef
          /** The exercised choice. */
          choiceId: string
          /** The interface the choice is exercised through, if any. */
          interface?: TemplateRef
      }
    | {
          /** A root that is neither a create nor an exercise. Absent when it carries no template. */
          kind: 'other'
          template?: TemplateRef
      }
)

/**
 * The description of a prepared transaction. A consumer treats it as complete when every operation
 * is `described` and no field of any operation has an `error`.
 */
export interface ClearSigningResult {
    /** One entry per root node, in root order. */
    operations: OperationDescription[]
}

/**
 * Why `clearSign` rejected.
 *
 * - `HASH_MISMATCH`: the transaction does not hash to `preparedTransactionHash`.
 * - `HASH_UNVERIFIABLE`: the transaction cannot be hashed, so the hash cannot be checked.
 * - `MALFORMED_TRANSACTION`: the transaction hashes correctly but cannot be read.
 *
 * With the first two, the description would not be bound to what is signed. A consumer must not
 * let the transaction be approved on the strength of a description. With the third, the hash is
 * confirmed and only the description is missing.
 */
export type ClearSigningErrorCode =
    | 'HASH_MISMATCH'
    | 'HASH_UNVERIFIABLE'
    | 'MALFORMED_TRANSACTION'

/** The error `clearSign` rejects with. */
export interface ClearSigningError extends Error {
    readonly code: ClearSigningErrorCode
}

export interface ClearSignRequest {
    /**
     * The prepared transaction, base64, as `/v2/interactive-submission/prepare` returns
     * `preparedTransaction`.
     */
    preparedTransaction: string
    /** The hash the user is asked to approve, base64 of the digest. */
    preparedTransactionHash: string
    /**
     * Clear-signing descriptors as JSON text; any number, valid or not. They are text, not parsed
     * documents, because a descriptor is signed as text and a duplicate member name is only visible
     * there.
     */
    descriptors: readonly string[]
}

/**
 * Describes a Canton prepared transaction in words, before it is signed.
 *
 * An implementation words each root node of the transaction with the clear-signing descriptor
 * bound to that node's template. A descriptor is a JSON document that conforms to the
 * meta-schema, `canton-clear-signing-v1.schema.json`. Whether a descriptor is trusted, for example
 * by checking its signatures against a set of keys, is up to the implementation.
 */
export interface ClearSigner {
    /**
     * Describes each root node of a prepared transaction.
     *
     * Child nodes are consequences of their root's choice, which the root's descriptor words. A
     * descriptor binds to a root by package ID, module and entity. Descriptors that bind to no root
     * are ignored. A descriptor that is not valid, not trusted, or ambiguous leaves only the roots
     * it binds to `invalid` or `unverified`; the other roots are still described.
     *
     * The description is only as trustworthy as its binding to what is signed, so the transaction
     * is described only when it hashes to `preparedTransactionHash`.
     *
     * @returns the description of every root node, in root order
     * @throws {ClearSigningError} when the transaction cannot be described as a whole. Its `code`
     * says whether the hash is the problem.
     */
    clearSign(request: ClearSignRequest): Promise<ClearSigningResult>
}
