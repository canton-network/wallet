// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Fixtures and simulations for splice-contracts.test.ts. Captured fixtures are prepared transactions
// from a local Canton. A simulated transaction is built here: one exercise root on a contract whose
// create node is taken from a captured fixture, so the input contract is real and only the choice
// argument is hand-built.

import {
    Exercise,
    type Identifier,
    PreparedTransaction,
    type Value,
} from '@canton-network/core-ledger-proto'
import { decode } from '../roots.js'
import { type Descriptor, parseDescriptor } from '../descriptor.js'
import externalPartyAmuletRules from '../../examples/descriptors/external-party-amulet-rules.json'
import { encode, rootNodeType } from './helpers.js'
import { allocationV2Multileg } from './fixtures/allocation-v2-multileg.js'

/** splice-amulet 0.1.25, the package the captured fixtures were prepared on. */
const LOCALNET_AMULET =
    'c5203dee918350373a993328e345872113bd5f8c8f0f51967014d813e583ae66'

interface Fixture {
    id: string
    preparedTransaction: string
    preparedTransactionHash: string
    hashingSchemeVersion: string
}

const fixtureFiles = import.meta.glob<Fixture>('./fixtures/splice/*.json', {
    eager: true,
    import: 'default',
})
const descriptorFiles = import.meta.glob('./schema-examples/splice/*.json', {
    eager: true,
    import: 'default',
})

export const capturedIds = Object.values(fixtureFiles).map((f) => f.id)

export function captured(id: string): Fixture {
    const fixture = fixtureFiles[`./fixtures/splice/${id}.json`]
    if (!fixture) throw new Error(`no captured fixture '${id}'`)
    return fixture
}

// The shipped amulet-rules descriptor, bound to the package the fixtures were prepared on.
const shippedAmulet = parseDescriptor(externalPartyAmuletRules)
export const spliceDescriptors: Descriptor[] = [
    ...Object.values(descriptorFiles).map((json) => parseDescriptor(json)),
    {
        ...shippedAmulet,
        context: {
            template: {
                ...shippedAmulet.context.template,
                packageId: LOCALNET_AMULET,
            },
        },
    },
]

// The parties the fixtures were prepared with.
const PARTICIPANT =
    '1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424'
export const DSO = `csdso::${PARTICIPANT}`
export const ALICE = `csalice::${PARTICIPANT}`
export const BOB = `csbob::${PARTICIPANT}`
export const PROVIDER = `csprovider::${PARTICIPANT}`
export const LOCK_MANAGER =
    'cip-127_lock-manager::1220000000000000000000000000000000000000000000000000000000000000abcd'
export const REASON_KEY = 'splice.lfdecentralizedtrust.org/reason'

// Value builders ------------------------------------------------------------------------------

export const text = (v: string): Value => ({
    sum: { oneofKind: 'text', text: v },
})
export const party = (v: string): Value => ({
    sum: { oneofKind: 'party', party: v },
})
/** Numeric, at the scale of Daml's `Decimal`, as the ledger encodes it. */
export const decimal = (v: string): Value => ({
    sum: { oneofKind: 'numeric', numeric: Number(v).toFixed(10) },
})
export const cid = (v: string): Value => ({
    sum: { oneofKind: 'contractId', contractId: v },
})
export const timestamp = (iso: string): Value => ({
    sum: {
        oneofKind: 'timestamp',
        timestamp: String(Date.parse(iso) * 1000),
    },
})
export const bool = (v: boolean): Value => ({
    sum: { oneofKind: 'bool', bool: v },
})
export const list = (...elements: Value[]): Value => ({
    sum: { oneofKind: 'list', list: { elements } },
})
export const some = (value: Value): Value => ({
    sum: { oneofKind: 'optional', optional: { value } },
})
export const none: Value = { sum: { oneofKind: 'optional', optional: {} } }
export const textMap = (entries: Record<string, Value>): Value => ({
    sum: {
        oneofKind: 'textMap',
        textMap: {
            entries: Object.entries(entries).map(([key, value]) => ({
                key,
                value,
            })),
        },
    },
})
export const variant = (constructor: string, value: Value): Value => ({
    sum: { oneofKind: 'variant', variant: { constructor, value } },
})

const isNone = (v: Value) =>
    v.sum.oneofKind === 'optional' && v.sum.optional.value === undefined

/**
 * A record with labelled fields. Trailing `None` fields are dropped, as the ledger does when it
 * encodes a prepared transaction (see the captured `originalSubstitutionCid`).
 */
export function record(fields: Record<string, Value>): Value {
    const entries = Object.entries(fields)
    while (entries.length > 0 && isNone(entries[entries.length - 1]![1])) {
        entries.pop()
    }
    return {
        sum: {
            oneofKind: 'record',
            record: {
                fields: entries.map(([label, value]) => ({ label, value })),
            },
        },
    }
}

export const metadata = (values: Record<string, string>): Value =>
    record({
        values: textMap(
            Object.fromEntries(
                Object.entries(values).map(([k, v]) => [k, text(v)])
            )
        ),
    })
export const extraArgs = (context: Record<string, Value> = {}): Value =>
    record({
        context: record({ values: textMap(context) }),
        meta: metadata({}),
    })

/** A V1 contract ID of the shape the ledger assigns, derived from `seed`. */
export const fakeCid = (seed: number): string =>
    `00${seed.toString(16).padStart(64, '0')}ca1212201220`

// Interfaces ----------------------------------------------------------------------------------

export const INTERFACES = {
    transferInstructionV1: {
        packageId:
            '55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281',
        moduleName: 'Splice.Api.Token.TransferInstructionV1',
        entityName: 'TransferInstruction',
    },
    transferInstructionV2: {
        packageId:
            '29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099',
        moduleName: 'Splice.Api.Token.TransferInstructionV2',
        entityName: 'TransferInstruction',
    },
    transferFactoryV1: {
        packageId:
            '55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281',
        moduleName: 'Splice.Api.Token.TransferInstructionV1',
        entityName: 'TransferFactory',
    },
    transferFactoryV2: {
        packageId:
            '29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099',
        moduleName: 'Splice.Api.Token.TransferInstructionV2',
        entityName: 'TransferFactory',
    },
    allocationFactoryV1: {
        packageId:
            '275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520',
        moduleName: 'Splice.Api.Token.AllocationInstructionV1',
        entityName: 'AllocationFactory',
    },
} satisfies Record<string, Identifier>

// Simulation ----------------------------------------------------------------------------------

function rootCreate(fixtureId: string) {
    const tx = decode(captured(fixtureId).preparedTransaction)
    const nodeType = rootNodeType(tx)
    if (nodeType.oneofKind !== 'create') {
        throw new Error(`fixture '${fixtureId}' has no create root`)
    }
    return nodeType.create
}

export interface Simulation {
    /** Captured fixture whose root create is the exercised contract. */
    contract: string
    choiceId: string
    chosenValue: Value
    actingParties: string[]
    interfaceId?: Identifier
}

/** A prepared transaction with one exercise root on the root contract of `contract`. */
export function simulate(s: Simulation): string {
    const source = decode(captured(s.contract).preparedTransaction)
    const create = rootCreate(s.contract)
    const { templateId } = create
    if (!templateId)
        throw new Error(`fixture '${s.contract}' has no template ID`)
    return encode(
        PreparedTransaction.create({
            transaction: {
                version: '2.1',
                roots: ['0'],
                nodeSeeds: [{ nodeId: 0, seed: new Uint8Array(32) }],
                nodes: [
                    {
                        nodeId: '0',
                        versionedNode: {
                            oneofKind: 'v1',
                            v1: {
                                nodeType: {
                                    oneofKind: 'exercise',
                                    exercise: Exercise.create({
                                        lfVersion: create.lfVersion,
                                        contractId: create.contractId,
                                        packageName: create.packageName,
                                        templateId,
                                        signatories: create.signatories,
                                        stakeholders: create.stakeholders,
                                        actingParties: s.actingParties,
                                        choiceId: s.choiceId,
                                        ...(s.interfaceId && {
                                            interfaceId: s.interfaceId,
                                        }),
                                        chosenValue: s.chosenValue,
                                        consuming: true,
                                    }),
                                },
                            },
                        },
                    },
                ],
            },
            metadata: {
                ...source.metadata,
                inputContracts: [
                    {
                        contract: { oneofKind: 'v1', v1: create },
                        createdAt: 0n,
                    },
                ],
            },
        })
    )
}

/** The choice argument of the root of the captured V2 multi-leg allocation (a real encoding). */
export function capturedAllocationV2(): {
    value: Value
    interfaceId: Identifier
} {
    const nodeType = rootNodeType(decode(allocationV2Multileg))
    if (
        nodeType?.oneofKind !== 'exercise' ||
        !nodeType.exercise.chosenValue ||
        !nodeType.exercise.interfaceId
    ) {
        throw new Error('allocation fixture has no exercise root')
    }
    return {
        value: nodeType.exercise.chosenValue,
        interfaceId: nodeType.exercise.interfaceId,
    }
}
