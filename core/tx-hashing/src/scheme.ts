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
    PreparedTransaction,
} from '@canton-network/core-ledger-proto'
import { concat, sha256 } from './bytes.js'
import { encodeRepeated, encodeString, encodeTime } from './encoding.js'
import { TxHashingError } from './errors.js'
import type { Forest } from './forest.js'

// What the hashing schemes share: encode_transaction and encode_node_id of
// daml_transaction_hashing_common.py; the encode_prepared_transaction,
// hash_transaction, hash_metadata and encode_input_contract functions that
// the Python example's V2 and V3 files define alike; encode_node and
// encode_node_v1, alike but for V3's QueryByKey node; the checks both schemes
// make; and field encoders both use.
//
// Neither scheme hashes metadata.globalKeyMapping, which is deprecated and
// left empty by the participant, or metadata.inputContracts[i].eventBlob, so
// a signature over the hash does not cover them. Both are accepted all the
// same, as in the Python example.

/** Hash purpose of a prepared transaction, an int32 */
const PURPOSE = Uint8Array.of(0x00, 0x00, 0x00, 0x30)

/** The bindings do not export this type by name. */
export type V1Node = Extract<
    DamlTransaction_Node['versionedNode'],
    { oneofKind: 'v1' }
>['v1']
/** The bindings do not export this type by name. */
export type QueryByKey = Extract<
    V1Node['nodeType'],
    { oneofKind: 'queryByKey' }
>['queryByKey']

/**
 * How a hashing scheme encodes each kind of node, and the metadata. A `path`
 * names the node body, such as `transaction.nodes[i].v1.create`.
 */
export interface Scheme {
    /** The scheme's byte in the final hash */
    version: number
    /**
     * Refuses an LF version the scheme does not hash, of a node or of the
     * transaction
     */
    checkLfVersion(lfVersion: string, path: string): void
    /** A create in the transaction has a seed, an input contract has none */
    encodeCreate(
        create: Create,
        path: string,
        seed: Uint8Array | undefined,
        maxValueDepth: number
    ): Uint8Array
    /** Without the children's hashes, which the walk appends */
    encodeExercise(
        exercise: Exercise,
        path: string,
        seed: Uint8Array,
        maxValueDepth: number
    ): Uint8Array
    encodeFetch(fetch: Fetch, path: string, maxValueDepth: number): Uint8Array
    /** A rollback node without the children's hashes, which the walk appends */
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

/**
 * sha256(P ‖ scheme ‖ sha256(P ‖ transaction) ‖ sha256(P ‖ metadata)), for
 * a transaction whose nodes `forest` has checked
 */
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
    // The participant gives a transaction the newest LF version of its nodes,
    // so a node with a version or a key the scheme does not hash explains the
    // transaction's, and is reported first
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

// The participant takes a transaction only if its create and exercise nodes,
// and no other nodes, have seeds, each of 32 bytes. A seed is hashed raw,
// without its length, and only in the hash of a create or an exercise.
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

/** A node encoded up to the hashes of its children, which come last. */
interface NodeHead {
    head: Uint8Array
    /** Ids of the children, absent for a node that cannot have any */
    children?: readonly string[]
}

/**
 * Checks what every scheme requires of a node and has the scheme encode the
 * node's fields. `path` is the node's place in the input,
 * `transaction.nodes[i]`.
 */
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

/** A node being hashed, or the transaction itself, whose children are the roots */
interface Frame {
    head: Uint8Array
    children: readonly string[]
    /** Hashes of the children done so far, in order */
    hashes: Uint8Array[]
}

/**
 * Hashes every node once, children before their parent, depth first from the
 * roots. The stack is explicit because the forest may be as deep as it has
 * nodes, which recursion would not survive. A node's own fields are encoded
 * when the walk reaches it, so an error in them is found before any in its
 * children, as in the Python example.
 */
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
            head: concat(
                PURPOSE,
                encodeString(transaction.version, 'transaction.version')
            ),
            children: forest.roots,
            hashes: [],
        },
    ]
    for (;;) {
        const frame = stack[stack.length - 1]
        // While a frame is on top, none of its children is half done, so the
        // next child to hash is the one at hashes.length
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

/** The transaction, which every scheme hashes and the participant requires */
export function transactionOf(prepared: PreparedTransaction): DamlTransaction {
    if (prepared.transaction === undefined) {
        throw new TxHashingError(
            'MISSING_FIELD',
            'prepared transaction has no transaction',
            'transaction'
        )
    }
    return prepared.transaction
}

/** The submitter info, which every scheme hashes and the participant requires */
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

/**
 * rep(i64(createdAt) ‖ sha256(create)) over the input contracts.
 * `encodeCreate` encodes the contract as the scheme's create node without a
 * seed; `path` is `metadata.inputContracts[i].v1`.
 */
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

/** rep(str) over parties or other strings, with the element's index in errors */
export function encodeStrings(
    values: readonly string[],
    path: string
): Uint8Array {
    return encodeRepeated(values, (value, i) =>
        encodeString(value, `${path}[${i}]`)
    )
}
