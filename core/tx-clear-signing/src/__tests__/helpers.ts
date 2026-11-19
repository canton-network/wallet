// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    HashingSchemeVersion,
    PreparedTransaction,
    type Create,
    type Exercise,
    type Fetch,
    type Identifier,
    type Rollback,
} from '@canton-network/core-ledger-proto'
import { computePreparedTransactionHash } from '@canton-network/core-tx-hashing'

import { toBase64 } from '../bytes.ts'
import {
    clearSign,
    type ClearSigningResult,
    type DescribedField,
    type OperationDescription,
} from '../clear-sign.ts'
import { type Descriptor, parseDescriptor } from '../descriptor.ts'
import { signWithReferenceKey } from '../testing/reference-key.ts'

/** Package of the templates in the core-tx-hashing vectors copied to fixtures/. */
export const VECTOR_PACKAGE =
    '7ac0650ef4d386a42bcbc7fe129f41806daa04063ff0970a5a3cdd6f4f829e68'
export const OWNER =
    'hash-vectors-owner::1220ed3b217454bb6df71539d8119d679210ef528ca8d36711779eb09d5d7337b095'
export const OTHER =
    'hash-vectors-other::122034539ff7a7f4d1754374fd16165642ea6eecb54acef3f7d32f67e188273f8916'

/** A descriptor for a template of the hash-vector fixtures. */
export function vectorDescriptor(
    entityName: string,
    display: unknown,
    enums?: Record<string, Record<string, string>>
): Descriptor {
    return parseDescriptor({
        $schema: 'https://example.org/canton-clear-signing/v1/schema.json',
        context: {
            template: {
                packageId: VECTOR_PACKAGE,
                moduleName: 'HashVectors',
                entityName,
            },
        },
        metadata: {
            version: '1.0.0',
            publisher: 'test',
            name: entityName,
            ...(enums && { enums }),
        },
        display,
    })
}

/** A prepared transaction as the base64 the parser takes. */
export function encode(tx: PreparedTransaction): string {
    return toBase64(PreparedTransaction.toBinary(tx))
}

// Named here because the ledger proto does not export `Node`, and its node-type union names
// `QueryByKey`, which is not exported either.
type V1NodeType =
    | { oneofKind: 'create'; create: Create }
    | { oneofKind: 'fetch'; fetch: Fetch }
    | { oneofKind: 'exercise'; exercise: Exercise }
    | { oneofKind: 'rollback'; rollback: Rollback }
    | { oneofKind: 'queryByKey'; queryByKey: { templateId?: Identifier } }
    | { oneofKind: undefined }

/** The v1 node type of a transaction's first root. */
export function rootNodeType(tx: PreparedTransaction): V1NodeType {
    const rootId = tx.transaction?.roots[0]
    const node = tx.transaction?.nodes.find((n) => n.nodeId === rootId)
    const versioned = node?.versionedNode
    if (versioned?.oneofKind !== 'v1') {
        throw new Error('root node has no v1 node')
    }
    return versioned.v1.nodeType
}

/** A hash of the transaction under the first scheme that can hash it, V3 then V2. */
export async function hashEither(tx: string): Promise<string> {
    let last: unknown
    const schemes = [HashingSchemeVersion.V3, HashingSchemeVersion.V2] as const
    for (const hashingScheme of schemes) {
        try {
            return toBase64(
                await computePreparedTransactionHash(tx, hashingScheme)
            )
        } catch (err) {
            last = err
        }
    }
    throw last
}

/**
 * Describes a transaction after hashing it, as the approve page does.
 * Each descriptor is signed with the reference key, so the tests exercise wording rather than the
 * trust check. A signature already on the descriptor is replaced.
 */
export async function described(
    tx: string,
    descriptors: readonly unknown[]
): Promise<ClearSigningResult> {
    const signed = await Promise.all(descriptors.map(attest))
    return clearSign(tx, signed, await hashEither(tx))
}

async function attest(json: unknown): Promise<unknown> {
    if (typeof json !== 'object' || json === null || Array.isArray(json)) {
        return json
    }
    const copy = { ...(json as Record<string, unknown>) }
    delete copy.signatures
    return signWithReferenceKey(copy)
}

/** The intent of an operation, for assertions on its wording. */
export function intentText(op: OperationDescription | undefined): string {
    return op?.intent ?? ''
}

/** A field's value, or its error when it has none. */
export function shown(field: DescribedField | undefined): string | undefined {
    return field && ('value' in field ? field.value : field.error)
}
