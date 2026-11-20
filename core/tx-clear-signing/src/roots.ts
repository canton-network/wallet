// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    PreparedTransaction,
    type Create,
    type Exercise,
    type Identifier,
    type Value,
} from '@canton-network/core-ledger-proto'

import { fromBase64 } from './bytes.ts'

/** The identity of a Daml template, which a descriptor binds to exactly. */
export interface TemplateRef {
    packageId: string
    moduleName: string
    entityName: string
}

export type RootNode =
    | { nodeId: string; kind: 'create'; create: Create }
    | { nodeId: string; kind: 'exercise'; exercise: Exercise }
    | {
          nodeId: string
          kind: 'other'
          /**
           * `fetch`, `rollback`, `queryByKey`, `missing` when the root has no node, or `empty`
           * when the node type is unset.
           */
          nodeType: string
          template?: TemplateRef
      }

/** The contracts a transaction's exercises can act on. */
export interface ContractSet {
    byId: Map<string, Create>
    /** Contract IDs that occur more than once. Their argument is not used. */
    duplicateIds: ReadonlySet<string>
}

class TransactionShapeError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'TransactionShapeError'
    }
}

// Unknown fields could carry content the user is never shown, so decoding refuses them.
export function decode(tx: string): PreparedTransaction {
    return PreparedTransaction.fromBinary(fromBase64(tx), {
        readUnknownField: 'throw',
    })
}

/**
 * The root nodes of the transaction, in order. A root that is not a create or an exercise is
 * returned as `other`, so one such root does not stop the others being described.
 *
 * @throws TransactionShapeError when the transaction has no tree
 */
export function rootNodes(tx: PreparedTransaction): RootNode[] {
    const transaction = tx.transaction
    if (!transaction) {
        throw new TransactionShapeError(
            'prepared transaction has no transaction'
        )
    }
    return transaction.roots.map((nodeId): RootNode => {
        const versioned = transaction.nodes.find(
            (n) => n.nodeId === nodeId
        )?.versionedNode
        if (versioned?.oneofKind !== 'v1') {
            return { nodeId, kind: 'other', nodeType: 'missing' }
        }
        const nodeType = versioned.v1.nodeType
        switch (nodeType.oneofKind) {
            case 'create':
                return { nodeId, kind: 'create', create: nodeType.create }
            case 'exercise':
                return { nodeId, kind: 'exercise', exercise: nodeType.exercise }
            case 'fetch':
                return {
                    nodeId,
                    kind: 'other',
                    nodeType: 'fetch',
                    template: templateRef(nodeType.fetch.templateId, nodeId),
                }
            // queryByKey carries a template too; rollback does not.
            case 'queryByKey':
                return {
                    nodeId,
                    kind: 'other',
                    nodeType: 'queryByKey',
                    template: templateRef(
                        nodeType.queryByKey.templateId,
                        nodeId
                    ),
                }
            default:
                return {
                    nodeId,
                    kind: 'other',
                    nodeType: nodeType.oneofKind ?? 'empty',
                }
        }
    })
}

export function templateRef(
    id: Identifier | undefined,
    nodeId: string
): TemplateRef {
    if (!id) {
        throw new TransactionShapeError(`node '${nodeId}' has no template ID`)
    }
    return {
        packageId: id.packageId,
        moduleName: id.moduleName,
        entityName: id.entityName,
    }
}

/** `packageId:moduleName:entityName`, the key `clearSign` uses to bind a descriptor to a template. */
export function templateKey(t: TemplateRef): string {
    return `${t.packageId}:${t.moduleName}:${t.entityName}`
}

/**
 * The contracts the transaction's exercises can act on, by contract ID: its input contracts, and the
 * contracts its create nodes create. A root exercise acts on one of these; for example, a
 * create-and-exercise command creates a contract in one root and exercises it in the next. A contract
 * ID that occurs more than once is recorded in `duplicateIds` and left out of `byId`.
 */
export function contractsOf(tx: PreparedTransaction): ContractSet {
    const inputs = (tx.metadata?.inputContracts ?? []).flatMap(({ contract }) =>
        contract.oneofKind === 'v1' ? [contract.v1] : []
    )
    const created = (tx.transaction?.nodes ?? []).flatMap(({ versionedNode }) =>
        versionedNode.oneofKind === 'v1' &&
        versionedNode.v1.nodeType.oneofKind === 'create'
            ? [versionedNode.v1.nodeType.create]
            : []
    )
    const byId = new Map<string, Create>()
    const duplicateIds = new Set<string>()
    for (const create of [...inputs, ...created]) {
        if (
            byId.has(create.contractId) ||
            duplicateIds.has(create.contractId)
        ) {
            byId.delete(create.contractId)
            duplicateIds.add(create.contractId)
            continue
        }
        byId.set(create.contractId, create)
    }
    return { byId, duplicateIds }
}

/** The create argument of an exercised contract, or why that contract cannot be read. */
export type ContractArgument =
    | { argument: Value | undefined }
    | { reason: string }

/**
 * The create argument of the contract an exercise acts on. The contract must be of the exercised
 * template's package name, module and entity. Its package ID may differ, because an upgrade keeps the
 * package name and changes the package ID. A missing, repeated or differently named contract is
 * reported in `reason`, so one exercise does not stop the other roots being described.
 */
export function contractArgument(
    contracts: ContractSet,
    exercise: Exercise
): ContractArgument {
    if (contracts.duplicateIds.has(exercise.contractId)) {
        return {
            reason: `contract '${exercise.contractId}' occurs more than once`,
        }
    }
    const create = contracts.byId.get(exercise.contractId)
    if (!create) {
        return {
            reason: `contract '${exercise.contractId}' is neither an input contract nor created by the transaction`,
        }
    }
    const actual = qualifiedName(create.packageName, create.templateId)
    const expected = qualifiedName(exercise.packageName, exercise.templateId)
    if (actual !== expected) {
        return {
            reason: `contract '${exercise.contractId}' is '${actual}', not '${expected}'`,
        }
    }
    return { argument: create.argument }
}

function qualifiedName(
    packageName: string,
    id: Identifier | undefined
): string {
    return `${packageName}:${id?.moduleName}:${id?.entityName}`
}
