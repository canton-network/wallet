// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    Create,
    DamlTransaction,
    DamlTransaction_Node,
    Exercise,
    Fetch,
    Metadata,
    Metadata_InputContract,
} from '@canton-network/core-ledger-proto'
import { concat, sha256 } from './bytes.js'
import { encodeRepeated, encodeString, encodeTime } from './encoding.js'
import { TxHashingError } from './errors.js'
import type { Forest } from './forest.js'

// Code shared by hashing schemes V2 and V3. Neither hashes
// metadata.globalKeyMapping (deprecated, left empty by the participant) or
// metadata.inputContracts[i].eventBlob, so a signature does not cover them.

// Hash purpose of a prepared transaction
const PURPOSE = Uint8Array.of(0x00, 0x00, 0x00, 0x30)

export type V1Node = Extract<
    DamlTransaction_Node['versionedNode'],
    { oneofKind: 'v1' }
>['v1']
export type QueryByKey = Extract<
    V1Node['nodeType'],
    { oneofKind: 'queryByKey' }
>['queryByKey']

/** How a scheme encodes the metadata, and each kind of node up to its children's hashes */
export interface Scheme {
    version: number
    checkLfVersion(lfVersion: string, path: string): void
    /** A create in the transaction has a seed, an input contract has none */
    encodeCreate(
        create: Create,
        path: string,
        seed: Uint8Array | undefined,
        maxValueDepth: number
    ): Uint8Array
    encodeExercise(
        exercise: Exercise,
        path: string,
        seed: Uint8Array,
        maxValueDepth: number
    ): Uint8Array
    encodeFetch(fetch: Fetch, path: string, maxValueDepth: number): Uint8Array
    rollbackHead: Uint8Array
    encodeQueryByKey(
        queryByKey: QueryByKey,
        path: string,
        maxValueDepth: number
    ): Uint8Array
    encodeMetadata(
        metadata: Metadata,
        maxValueDepth: number
    ): Promise<Uint8Array>
}

/** sha256(purpose || scheme || sha256(purpose || transaction) || sha256(purpose || metadata)) */
export async function hashPrepared(
    transaction: DamlTransaction,
    metadata: Metadata | undefined,
    forest: Forest,
    scheme: Scheme,
    maxValueDepth: number
): Promise<Uint8Array<ArrayBuffer>> {
    if (metadata === undefined) {
        throw new TxHashingError(
            'MISSING_FIELD',
            'prepared transaction has no metadata',
            'metadata'
        )
    }
    checkSeeds(transaction, forest)
    const transactionHash = await hashTransaction(
        transaction,
        forest,
        scheme,
        maxValueDepth
    )
    // After the nodes: the transaction's LF version is the highest of theirs,
    // so the node at fault is reported
    scheme.checkLfVersion(transaction.version, 'transaction.version')
    const metadataHash = await sha256(
        concat(PURPOSE, await scheme.encodeMetadata(metadata, maxValueDepth))
    )
    return sha256(
        concat(PURPOSE, scheme.version, transactionHash, metadataHash)
    )
}

export const kindOf = (node: DamlTransaction_Node) =>
    node.versionedNode.oneofKind === 'v1'
        ? node.versionedNode.v1.nodeType.oneofKind
        : undefined

// A seed is hashed raw, without its length, and only for a create or an
// exercise node, so it must have 32 bytes and other nodes may not have one
function checkSeeds(transaction: DamlTransaction, forest: Forest): void {
    for (let j = 0; j < transaction.nodeSeeds.length; j++) {
        const { nodeId, seed } = transaction.nodeSeeds[j]
        if (seed.length !== 32) {
            throw new TxHashingError(
                'INVALID_VALUE',
                `node seed has ${seed.length} bytes, not 32`,
                `transaction.nodeSeeds[${j}].seed`
            )
        }
        // The forest check guarantees that the seed's node exists
        const kind = kindOf(forest.nodes.get(String(nodeId))!)
        if (kind === 'fetch' || kind === 'rollback' || kind === 'queryByKey') {
            throw new TxHashingError(
                'FIELD_NOT_COVERED_BY_SCHEME',
                `${kind} node ${nodeId} has a seed, which the hash does not cover`,
                `transaction.nodeSeeds[${j}]`
            )
        }
    }
    for (let i = 0; i < transaction.nodes.length; i++) {
        const node = transaction.nodes[i]
        const kind = kindOf(node)
        if (
            (kind === 'create' || kind === 'exercise') &&
            !forest.seeds.has(node.nodeId)
        ) {
            throw new TxHashingError(
                'MISSING_NODE_SEED',
                `${kind} node ${node.nodeId} has no seed`,
                `transaction.nodes[${i}]`
            )
        }
    }
}

interface NodeHead {
    head: Uint8Array
    /** Absent for a node that cannot have children */
    children?: readonly string[]
}

function encodeNode(
    node: DamlTransaction_Node,
    path: string,
    seed: Uint8Array | undefined,
    scheme: Scheme,
    maxValueDepth: number
): NodeHead {
    if (node.versionedNode.oneofKind !== 'v1') {
        throw new TxHashingError(
            'UNSUPPORTED_NODE_VERSION',
            'node is not a v1 node',
            path
        )
    }
    const at = `${path}.v1`
    const type = node.versionedNode.v1.nodeType
    switch (type.oneofKind) {
        case 'create':
            return {
                head: scheme.encodeCreate(
                    type.create,
                    `${at}.create`,
                    seed,
                    maxValueDepth
                ),
            }
        case 'exercise':
            return {
                head: scheme.encodeExercise(
                    type.exercise,
                    `${at}.exercise`,
                    // checkSeeds has made sure that every exercise has one
                    seed!,
                    maxValueDepth
                ),
                children: type.exercise.children,
            }
        case 'fetch':
            return {
                head: scheme.encodeFetch(
                    type.fetch,
                    `${at}.fetch`,
                    maxValueDepth
                ),
            }
        case 'rollback':
            if (type.rollback.children.length === 0) {
                throw new TxHashingError(
                    'MISSING_FIELD',
                    'rollback node has no children',
                    `${at}.rollback.children`
                )
            }
            return {
                head: scheme.rollbackHead,
                children: type.rollback.children,
            }
        case 'queryByKey':
            return {
                head: scheme.encodeQueryByKey(
                    type.queryByKey,
                    `${at}.queryByKey`,
                    maxValueDepth
                ),
            }
        default:
            throw new TxHashingError(
                'MISSING_FIELD',
                'node has no node type',
                at
            )
    }
}

interface Frame {
    head: Uint8Array
    children: readonly string[]
    hashes: Uint8Array[]
}

// Hashes children before their parent, with an explicit stack: the forest can
// be as deep as it has nodes. The bottom frame is the transaction itself.
async function hashTransaction(
    transaction: DamlTransaction,
    forest: Forest,
    scheme: Scheme,
    maxValueDepth: number
): Promise<Uint8Array> {
    const position = new Map(
        transaction.nodes.map((node, i) => [node.nodeId, i])
    )
    const stack: Frame[] = [
        {
            head: concat(PURPOSE, encodeString(transaction.version)),
            children: forest.roots,
            hashes: [],
        },
    ]
    while (true) {
        const frame = stack[stack.length - 1]
        if (frame.hashes.length < frame.children.length) {
            const id = frame.children[frame.hashes.length]
            const node = encodeNode(
                // The forest check guarantees every id it walked is a node
                forest.nodes.get(id)!,
                `transaction.nodes[${position.get(id)}]`,
                forest.seeds.get(id),
                scheme,
                maxValueDepth
            )
            if (node.children === undefined) {
                frame.hashes.push(await sha256(node.head))
            } else {
                stack.push({
                    head: node.head,
                    children: node.children,
                    hashes: [],
                })
            }
            continue
        }
        stack.pop()
        const hash = await sha256(
            concat(
                frame.head,
                encodeRepeated(frame.hashes, (child) => child)
            )
        )
        const parent = stack.at(-1)
        if (parent === undefined) return hash
        parent.hashes.push(hash)
    }
}

export function submitterInfoOf(
    metadata: Metadata
): NonNullable<Metadata['submitterInfo']> {
    if (metadata.submitterInfo === undefined) {
        throw new TxHashingError(
            'MISSING_FIELD',
            'metadata has no submitter info',
            'metadata.submitterInfo'
        )
    }
    return metadata.submitterInfo
}

/** rep(i64(createdAt) || sha256(create)) over the input contracts, each encoded as a create without a seed */
export async function encodeInputContracts(
    contracts: readonly Metadata_InputContract[],
    encodeCreate: (create: Create, path: string) => Uint8Array
): Promise<Uint8Array> {
    const encoded: Uint8Array[] = []
    for (let i = 0; i < contracts.length; i++) {
        const { contract, createdAt } = contracts[i]
        const path = `metadata.inputContracts[${i}]`
        if (contract.oneofKind !== 'v1') {
            throw new TxHashingError(
                'MISSING_FIELD',
                'input contract has no v1 contract',
                path
            )
        }
        encoded.push(
            concat(
                encodeTime(createdAt, `${path}.createdAt`),
                await sha256(encodeCreate(contract.v1, `${path}.v1`))
            )
        )
    }
    return encodeRepeated(encoded, (contract) => contract)
}

export function encodeStrings(values: readonly string[]): Uint8Array {
    return encodeRepeated(values, encodeString)
}
