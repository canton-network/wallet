// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    Create,
    DamlTransaction,
    DamlTransaction_Node,
    DamlTransaction_NodeSeed,
    Exercise,
    Fetch,
    Identifier,
    Metadata,
    Metadata_InputContract,
    PreparedTransaction,
    Value,
} from '@canton-network/core-ledger-proto'
import { kindOf, type QueryByKey, type V1Node } from '../../scheme.js'

export const identifier = (
    packageId: string,
    moduleName: string,
    entityName: string
): Identifier => ({ packageId, moduleName, entityName })

export const unit = (): Value => ({ sum: { oneofKind: 'unit', unit: {} } })

export const bool = (value: boolean): Value => ({
    sum: { oneofKind: 'bool', bool: value },
})

export const int64 = (value: string): Value => ({
    sum: { oneofKind: 'int64', int64: value },
})

export const numeric = (value: string): Value => ({
    sum: { oneofKind: 'numeric', numeric: value },
})

export const timestamp = (value: string): Value => ({
    sum: { oneofKind: 'timestamp', timestamp: value },
})

export const date = (value: number): Value => ({
    sum: { oneofKind: 'date', date: value },
})

export const party = (value: string): Value => ({
    sum: { oneofKind: 'party', party: value },
})

export const text = (value: string): Value => ({
    sum: { oneofKind: 'text', text: value },
})

export const contractId = (value: string): Value => ({
    sum: { oneofKind: 'contractId', contractId: value },
})

/** `optional()` is None, `optional(v)` is Some(v). */
export const optional = (value?: Value): Value => ({
    sum: { oneofKind: 'optional', optional: value ? { value } : {} },
})

export const list = (elements: Value[] = []): Value => ({
    sum: { oneofKind: 'list', list: { elements } },
})

export const textMap = (entries: [key: string, value: Value][]): Value => ({
    sum: {
        oneofKind: 'textMap',
        textMap: { entries: entries.map(([key, value]) => ({ key, value })) },
    },
})

export const genMap = (entries: [key: Value, value: Value][]): Value => ({
    sum: {
        oneofKind: 'genMap',
        genMap: { entries: entries.map(([key, value]) => ({ key, value })) },
    },
})

export const record = (
    fields: [label: string, value: Value][],
    recordId?: Identifier
): Value => ({
    sum: {
        oneofKind: 'record',
        record: {
            ...(recordId && { recordId }),
            fields: fields.map(([label, value]) => ({ label, value })),
        },
    },
})

export const variant = (
    constructor: string,
    value: Value,
    variantId?: Identifier
): Value => ({
    sum: {
        oneofKind: 'variant',
        variant: { ...(variantId && { variantId }), constructor, value },
    },
})

export const enumValue = (constructor: string, enumId?: Identifier): Value => ({
    sum: {
        oneofKind: 'enum',
        enum: { ...(enumId && { enumId }), constructor },
    },
})

/** A value with exactly `depth` levels: `depth - 1` lists around `innermost`, an empty list by default. */
export function nestedLists(depth: number, innermost: Value = list()): Value {
    let value = innermost
    for (let level = 1; level < depth; level++) value = list([value])
    return value
}

type ContractKey = NonNullable<Create['key']>
type GlobalKey = NonNullable<ContractKey['key']>

// A function, so that no two nodes share one object: tests change nodes in
// place
const defaultTemplateId = (): Identifier => identifier('pkg', 'Mod', 'Tpl')

/** A key of the default template, maintained by alice, with an all-zero hash. */
export const contractKey = (
    fields: Partial<GlobalKey> = {},
    maintainers: string[] = ['alice']
): ContractKey => ({
    key: {
        templateId: defaultTemplateId(),
        packageName: 'pkg',
        key: party('alice'),
        hash: new Uint8Array(32),
        ...fields,
    },
    maintainers,
})

const v1Node = (
    nodeId: string,
    nodeType: V1Node['nodeType']
): DamlTransaction_Node => ({
    nodeId,
    versionedNode: { oneofKind: 'v1', v1: { nodeType } },
})

/** The body of a create node, also the body of an input contract. */
export const create = (fields: Partial<Create> = {}): Create => ({
    lfVersion: '2.1',
    contractId: '00',
    packageName: 'pkg',
    templateId: defaultTemplateId(),
    argument: unit(),
    signatories: [],
    stakeholders: [],
    ...fields,
})

export const createNode = (
    nodeId: string,
    fields: Partial<Create> = {}
): DamlTransaction_Node =>
    v1Node(nodeId, { oneofKind: 'create', create: create(fields) })

/** The body of an exercise node. */
export const exercise = (fields: Partial<Exercise> = {}): Exercise => ({
    lfVersion: '2.1',
    contractId: '00',
    packageName: 'pkg',
    templateId: defaultTemplateId(),
    signatories: [],
    stakeholders: [],
    actingParties: [],
    choiceId: 'Choice',
    chosenValue: unit(),
    consuming: false,
    children: [],
    choiceObservers: [],
    byKey: false,
    ...fields,
})

export const exerciseNode = (
    nodeId: string,
    children: string[] = [],
    fields: Omit<Partial<Exercise>, 'children'> = {}
): DamlTransaction_Node =>
    v1Node(nodeId, {
        oneofKind: 'exercise',
        exercise: exercise({ ...fields, children }),
    })

export const fetchNode = (
    nodeId: string,
    fields: Partial<Fetch> = {}
): DamlTransaction_Node =>
    v1Node(nodeId, {
        oneofKind: 'fetch',
        fetch: {
            lfVersion: '2.1',
            contractId: '00',
            packageName: 'pkg',
            templateId: defaultTemplateId(),
            signatories: [],
            stakeholders: [],
            actingParties: [],
            byKey: false,
            ...fields,
        },
    })

export const rollbackNode = (
    nodeId: string,
    children: string[]
): DamlTransaction_Node =>
    v1Node(nodeId, { oneofKind: 'rollback', rollback: { children } })

/** The body of a QueryByKey node, without the key it requires. */
export const queryByKey = (fields: Partial<QueryByKey> = {}): QueryByKey => ({
    lfVersion: '2',
    packageName: 'pkg',
    templateId: defaultTemplateId(),
    exhaustive: false,
    result: [],
    ...fields,
})

export const queryByKeyNode = (
    nodeId: string,
    fields: Partial<QueryByKey> = {}
): DamlTransaction_Node =>
    v1Node(nodeId, { oneofKind: 'queryByKey', queryByKey: queryByKey(fields) })

export const seed = (
    nodeId: number,
    bytes: Uint8Array = new Uint8Array(32)
): DamlTransaction_NodeSeed => ({ nodeId, seed: bytes })

export const tx = (
    roots: string[],
    nodes: DamlTransaction_Node[],
    nodeSeeds: DamlTransaction_NodeSeed[] = []
): DamlTransaction => ({ version: '2.1', roots, nodes, nodeSeeds })

export const inputContract = (
    contract: Create,
    createdAt = 0n
): Metadata_InputContract => ({
    contract: { oneofKind: 'v1', v1: contract },
    createdAt,
    eventBlob: new Uint8Array(),
})

export const metadata = (fields: Partial<Metadata> = {}): Metadata => ({
    submitterInfo: { actAs: ['alice'], commandId: 'cmd' },
    synchronizerId: 'sync',
    mediatorGroup: 0,
    transactionUuid: 'uuid',
    preparationTime: 1n,
    inputContracts: [],
    globalKeyMapping: [],
    ...fields,
})

export const prepared = (
    transaction: DamlTransaction,
    meta: Metadata = metadata()
): PreparedTransaction => ({ transaction, metadata: meta })

/** A transaction whose only node is `node`, with a seed if it is a create or an exercise. */
export function single(
    node: DamlTransaction_Node,
    meta?: Metadata
): PreparedTransaction {
    const kind = kindOf(node)
    const seeds =
        kind === 'create' || kind === 'exercise'
            ? [seed(Number(node.nodeId))]
            : []
    return prepared(tx([node.nodeId], [node], seeds), meta)
}

/** A transaction with one create node and `contract` as its only input contract. */
export const withInputContract = (contract: Create): PreparedTransaction =>
    single(
        createNode('0'),
        metadata({ inputContracts: [inputContract(contract)] })
    )

/** The body of a node made by the builders, to leave a field out of it. */
function bodyOf(node: DamlTransaction_Node): object {
    if (node.versionedNode.oneofKind !== 'v1') throw new Error('not v1')
    const { nodeType } = node.versionedNode.v1
    switch (nodeType.oneofKind) {
        case 'create':
            return nodeType.create
        case 'exercise':
            return nodeType.exercise
        case 'fetch':
            return nodeType.fetch
        case 'queryByKey':
            return nodeType.queryByKey
        default:
            throw new Error(`no body to change in a ${nodeType.oneofKind} node`)
    }
}

/** `node` without `field`, which exactOptionalPropertyTypes does not let a builder set to undefined. */
export function leaveOut(
    node: DamlTransaction_Node,
    field: string
): DamlTransaction_Node {
    Reflect.deleteProperty(bodyOf(node), field)
    return node
}

/** 32 bytes of `byte`, the size of a node seed and of a key hash */
export const filled = (byte: number): Uint8Array =>
    new Uint8Array(32).fill(byte)

/** Node "0" is the root, each following node is the only child of the one before, and every node has a seed. */
export function chain(length: number): PreparedTransaction {
    const nodes: DamlTransaction_Node[] = []
    for (let i = 0; i < length - 1; i++) {
        nodes.push(exerciseNode(String(i), [String(i + 1)]))
    }
    nodes.push(createNode(String(length - 1)))
    return prepared(
        tx(
            ['0'],
            nodes,
            nodes.map((_node, i) => seed(i))
        )
    )
}
