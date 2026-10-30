// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    DamlTransaction,
    DamlTransaction_Node,
} from '@canton-network/core-ledger-proto'
import { TxHashingError, type TxHashingErrorCode } from './errors.js'
import type { TraversalLimits } from './limits.js'

/**
 * The nodes of a transaction, checked to form a forest: every node is listed
 * once under a canonical id, is referenced exactly once, from `roots` or from
 * one `children` list, and is reachable from `roots`. Hashing from the roots
 * therefore covers every listed node exactly once. The node objects and seed
 * bytes are the input's own, not copies.
 */
export interface Forest {
    roots: readonly string[]
    nodes: ReadonlyMap<string, DamlTransaction_Node>
    /**
     * Keyed by the decimal node id. Which nodes need a seed is for the hashing
     * scheme to check.
     */
    seeds: ReadonlyMap<string, Uint8Array>
}

const MAX_NODE_ID = 2_147_483_647
const NODE_ID = /^(0|[1-9][0-9]*)$/

const isNodeId = (id: string) => NODE_ID.test(id) && Number(id) <= MAX_NODE_ID

const invalidIdMessage = (id: string) =>
    `${id.length > 20 ? `${JSON.stringify(id.slice(0, 20))}...` : JSON.stringify(id)} is not a node id: expected decimal digits without leading zeros, at most ${MAX_NODE_ID}`

export function checkForest(
    tx: DamlTransaction,
    limits: TraversalLimits
): Forest {
    // Written as a negated <= so that a NaN or undefined limit fails closed
    if (!(tx.nodes.length <= limits.maxNodes)) {
        throw new TxHashingError(
            'NODE_LIMIT_EXCEEDED',
            `transaction has ${tx.nodes.length} nodes, the limit is ${limits.maxNodes}`,
            'transaction.nodes'
        )
    }
    const nodes = indexNodes(tx)
    checkReferences(tx, nodes, limits.maxNodeDepth)
    return { roots: [...tx.roots], nodes, seeds: indexSeeds(tx, nodes) }
}

function indexNodes(tx: DamlTransaction): Map<string, DamlTransaction_Node> {
    const nodes = new Map<string, DamlTransaction_Node>()
    for (let i = 0; i < tx.nodes.length; i++) {
        const node = tx.nodes[i]
        if (!isNodeId(node.nodeId)) {
            throw new TxHashingError(
                'INVALID_NODE_ID',
                invalidIdMessage(node.nodeId),
                `transaction.nodes[${i}].nodeId`
            )
        }
        if (nodes.has(node.nodeId)) {
            throw new TxHashingError(
                'DUPLICATE_NODE_ID',
                `node id ${node.nodeId} is used by more than one node`,
                `transaction.nodes[${i}].nodeId`
            )
        }
        nodes.set(node.nodeId, node)
    }
    return nodes
}

/** A list of ids being walked: the roots, or the children of one node. */
interface Frame {
    kind: 'roots' | 'exercise' | 'rollback'
    /** The node the ids are children of, empty for the roots */
    id: string
    ids: readonly string[]
    next: number
}

// Only exercise and rollback nodes have children. Any other node, also one
// this package cannot read, is a leaf here.
function childFrame(id: string, node: DamlTransaction_Node): Frame | undefined {
    if (node.versionedNode.oneofKind !== 'v1') return undefined
    const type = node.versionedNode.v1.nodeType
    switch (type.oneofKind) {
        case 'exercise':
            return {
                kind: 'exercise',
                id,
                ids: type.exercise.children,
                next: 0,
            }
        case 'rollback':
            return {
                kind: 'rollback',
                id,
                ids: type.rollback.children,
                next: 0,
            }
        default:
            return undefined
    }
}

// Looks the path up only when a reference is rejected, so that a valid
// transaction does not pay for it. It is a proto JSON field path, so the oneof
// groups versionedNode and nodeType are not in it.
function referenceError(
    tx: DamlTransaction,
    frame: Frame,
    index: number,
    code: TxHashingErrorCode,
    message: string
): TxHashingError {
    const path =
        frame.kind === 'roots'
            ? `transaction.roots[${index}]`
            : `transaction.nodes[${tx.nodes.findIndex((node) => node.nodeId === frame.id)}].v1.${frame.kind}.children[${index}]`
    return new TxHashingError(code, message, path)
}

/**
 * Walks the forest depth-first from the roots. Every reference must be a
 * canonical id of an existing node, close no cycle and be the only one to its
 * node, and the nesting must stay within `maxDepth`. The stack is explicit
 * because the forest may be as deep as `maxNodes`, which recursion would not
 * survive.
 */
function checkReferences(
    tx: DamlTransaction,
    nodes: ReadonlyMap<string, DamlTransaction_Node>,
    maxDepth: number
): void {
    const seen = new Set<string>()
    const onPath = new Set<string>()
    // The roots are walked like the children of a node above all of them, so
    // `stack.length` is the depth of the node being entered
    const stack: Frame[] = [{ kind: 'roots', id: '', ids: tx.roots, next: 0 }]
    while (stack.length > 0) {
        const frame = stack[stack.length - 1]
        if (frame.next >= frame.ids.length) {
            onPath.delete(frame.id)
            stack.pop()
            continue
        }
        const index = frame.next++
        const id = frame.ids[index]

        if (!isNodeId(id)) {
            throw referenceError(
                tx,
                frame,
                index,
                'INVALID_NODE_ID',
                invalidIdMessage(id)
            )
        }
        const node = nodes.get(id)
        if (node === undefined) {
            throw referenceError(
                tx,
                frame,
                index,
                'DANGLING_NODE_REFERENCE',
                `no node has the id ${id}`
            )
        }
        if (onPath.has(id)) {
            throw referenceError(
                tx,
                frame,
                index,
                'CYCLE',
                `node ${id} is its own ancestor`
            )
        }
        if (seen.has(id)) {
            throw referenceError(
                tx,
                frame,
                index,
                'SHARED_CHILD',
                `node ${id} is referenced more than once`
            )
        }
        if (!(stack.length <= maxDepth)) {
            throw referenceError(
                tx,
                frame,
                index,
                'DEPTH_LIMIT_EXCEEDED',
                `nodes are nested deeper than ${maxDepth} levels`
            )
        }
        seen.add(id)
        const children = childFrame(id, node)
        if (children !== undefined) {
            onPath.add(id)
            stack.push(children)
        }
    }
    if (nodes.size > seen.size) {
        const position = tx.nodes.findIndex((node) => !seen.has(node.nodeId))
        throw new TxHashingError(
            'ORPHAN_NODE',
            `node ${tx.nodes[position].nodeId} is not reachable from any root`,
            `transaction.nodes[${position}].nodeId`
        )
    }
}

function indexSeeds(
    tx: DamlTransaction,
    nodes: ReadonlyMap<string, DamlTransaction_Node>
): Map<string, Uint8Array> {
    const seeds = new Map<string, Uint8Array>()
    for (let i = 0; i < tx.nodeSeeds.length; i++) {
        const { nodeId, seed } = tx.nodeSeeds[i]
        const id = String(nodeId)
        if (!isNodeId(id)) {
            throw new TxHashingError(
                'INVALID_NODE_ID',
                invalidIdMessage(id),
                `transaction.nodeSeeds[${i}].nodeId`
            )
        }
        if (!nodes.has(id)) {
            throw new TxHashingError(
                'DANGLING_NODE_REFERENCE',
                `no node has the id ${id}`,
                `transaction.nodeSeeds[${i}].nodeId`
            )
        }
        if (seeds.has(id)) {
            throw new TxHashingError(
                'DUPLICATE_NODE_SEED',
                `node ${id} has more than one seed`,
                `transaction.nodeSeeds[${i}]`
            )
        }
        seeds.set(id, seed)
    }
    return seeds
}
