// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import {
    PreparedTransaction,
    type Metadata,
} from '@canton-network/core-ledger-proto'
import { fromBase64, hexToBytes, sha256 } from '../bytes.js'
import { checkForest } from '../forest.js'
import { DEFAULT_LIMITS, type TraversalLimits } from '../limits.js'
import { hashPrepared } from '../scheme.js'
import { schemeV2 } from '../v2.js'
import {
    chain,
    contractKey,
    create,
    createNode,
    exerciseNode,
    fetchNode,
    filled,
    identifier,
    inputContract,
    int64,
    leaveOut,
    list,
    metadata,
    nestedLists,
    optional,
    party,
    prepared,
    queryByKeyNode,
    record,
    rollbackNode,
    seed,
    single,
    text,
    tx,
    unit,
    withInputContract,
} from './helpers/builders.js'
import { toHex } from './helpers/hex.js'
import { int64sBeyond2To53 } from './helpers/int64.js'
import { liveFixtures } from './helpers/live-fixtures.js'
import { hx, rejection } from './helpers/matchers.js'
import bigInt64V2 from './fixtures/big-int64-v2.json'
import txVisualizerV2 from './fixtures/tx-visualizer-v2.json'

// Expected values that do not come from a participant were produced by running
// daml_transaction_hashing_v2.py (canton v3.5.1, 08-interactive-submission) on
// the same inputs. Spaces only group the bytes.

async function v2(
    input: PreparedTransaction,
    limits: TraversalLimits = DEFAULT_LIMITS
): Promise<string> {
    const { transaction, metadata: meta } = input
    if (transaction === undefined) throw new Error('no transaction')
    const forest = checkForest(transaction, limits)
    return toHex(
        await hashPrepared(
            transaction,
            meta,
            forest,
            schemeV2,
            limits.maxValueDepth
        )
    )
}

const decoded = (base64: string) =>
    PreparedTransaction.fromBinary(fromBase64(base64))

// Parents are listed both before and after their children, and fields of one
// kind hold different values, so that swapping two of them changes the hash
const EVERY_FIELD = prepared(
    tx(
        ['0', '5'],
        [
            createNode('1', {
                contractId: '0011',
                packageName: 'pkg-1',
                templateId: identifier('tpl-1', 'Mod.Sub', 'Ent'),
                argument: record(
                    [
                        ['count', int64('-7')],
                        ['note', text('é')],
                    ],
                    identifier('tpl-1', 'Mod.Sub', 'Ent')
                ),
                signatories: ['alice'],
                stakeholders: ['alice', 'bob'],
            }),
            exerciseNode('0', ['1', '2', '3'], {
                contractId: '0022',
                packageName: 'pkg-0',
                templateId: identifier('tpl-0', 'Mod', 'Ent.Inner'),
                signatories: ['bob'],
                stakeholders: ['bob', 'carol'],
                actingParties: ['carol'],
                interfaceId: identifier('iface-0', 'Iface.Mod', 'Iface'),
                choiceId: 'Transfer',
                chosenValue: list([party('dave'), optional(unit())]),
                consuming: true,
                choiceObservers: ['erin', 'frank'],
            }),
            rollbackNode('3', ['4']),
            fetchNode('2', {
                contractId: '0033',
                packageName: 'pkg-2',
                templateId: identifier('tpl-2', 'Mod', 'Ent'),
                signatories: ['grace'],
                stakeholders: ['grace', 'heidi'],
                actingParties: ['ivan'],
                interfaceId: identifier('iface-2', 'I', 'J'),
            }),
            exerciseNode('4', [], {
                contractId: '0044',
                packageName: 'pkg-4',
                choiceId: 'Inner',
                exerciseResult: text('done'),
            }),
            createNode('5', { contractId: '0055', packageName: 'pkg-5' }),
        ],
        [
            seed(5, filled(0x55)),
            seed(0, filled(0x10)),
            seed(1, filled(0x11)),
            seed(4, filled(0x44)),
        ]
    ),
    metadata({
        submitterInfo: { actAs: ['alice', 'bob'], commandId: 'command-1' },
        synchronizerId: 'sync::1220',
        mediatorGroup: 7,
        transactionUuid: '00000000-0000-4000-8000-000000000001',
        preparationTime: 1_792_857_520_391_741n,
        minLedgerEffectiveTime: 1_792_857_500_000_000n,
        maxLedgerEffectiveTime: 1_792_857_600_000_000n,
        inputContracts: [
            inputContract(
                create({
                    contractId: '0066',
                    packageName: 'pkg-6',
                    argument: record([['owner', party('alice')]]),
                    signatories: ['alice'],
                    stakeholders: ['alice'],
                }),
                1_792_857_519_621_919n
            ),
            inputContract(
                create({ contractId: '0077', packageName: 'pkg-7' }),
                1n
            ),
        ],
    })
)

describe('hashing scheme V2', () => {
    describe('real transactions', () => {
        it('matches the participant hash of the wallet repo fixture', async () =>
            expect(await v2(decoded(txVisualizerV2.preparedTransaction))).toBe(
                '7fdec2bf504eed04bb8e6498d37a79e891ac3dfeb4571fc0057991b9bee28902'
            ))

        it.each(liveFixtures('HASHING_SCHEME_VERSION_V2'))(
            'matches the live participant for $scenario',
            async ({ tx: input, hashHex }) =>
                expect(await v2(input)).toBe(hashHex)
        )

        it('matches the participant hash of a transaction with int64 2^53 + 1, which parseInt would round to 2^53', async () => {
            const input = decoded(bigInt64V2.preparedTransaction)
            // Without the value in the fixture, parseInt would pass too
            expect(int64sBeyond2To53(input)).toContain('9007199254740993')

            expect(await v2(input)).toBe(
                toHex(fromBase64(bigInt64V2.preparedTransactionHash))
            )
        })
    })

    describe('encoding', () => {
        it('matches the Python example on a transaction that sets every field V2 hashes', async () =>
            expect(await v2(EVERY_FIELD)).toBe(
                '7ed07086629bd0096eadbf56966bb38fce96ab589c24179abca3ab74b7937afa'
            ))

        it('hashes input contracts as seedless creates', async () => {
            const contract = create({
                contractId: 'ab',
                signatories: ['alice'],
                stakeholders: ['alice'],
            })
            // Node encoding version 01, lf "2.1", create tag 00, no seed 00
            const seedlessCreate = hx(`01 00000003 322e31 00 00
                00000001 ab  00000003 706b67
                00000003 706b67 00000001 00000003 4d6f64 00000001 00000003 54706c
                00  00000001 00000005 616c696365  00000001 00000005 616c696365`)

            const encoded = await schemeV2.encodeMetadata(
                metadata({ inputContracts: [inputContract(contract, 5n)] }),
                DEFAULT_LIMITS.maxValueDepth
            )

            expect(toHex(encoded)).toBe(
                hx(`01  00000001 00000005 616c696365  00000003 636d64
                    00000004 75756964  00000000  00000004 73796e63  00 00
                    0000000000000001  00000001 0000000000000005`) +
                    toHex(await sha256(hexToBytes(seedlessCreate, 'create')))
            )
        })

        // The Python example recurses per node, so for this value it looked
        // each child's hash up from a cache filled deepest node first. The
        // timeout is for CI runners that run the tests in parallel with coverage
        it(
            'hashes a 10_000 node chain without stack overflow',
            async () =>
                expect(
                    await v2(chain(10_000), {
                        ...DEFAULT_LIMITS,
                        maxNodes: 10_000,
                        maxNodeDepth: 10_000,
                    })
                ).toBe(
                    'e67805e0ca23ec458163d2db1ea60f7edfaa73fcd89fdafda86f58fc71b194a9'
                ),
            30_000
        )
    })

    // The participant writes a time from a signed 64-bit number into a uint64
    // field, so a time before 1970 arrives as 2^64 minus its magnitude. Canton
    // 3.5.18's own decoder and hasher computed the expected hashes for the same
    // bytes; the Python example raises struct.error on those before 1970.
    describe('metadata times', () => {
        const FIRST_TIMESTAMP = -62_135_596_800_000_000n
        const LAST_TIMESTAMP = 253_402_300_799_999_999n

        /** The participant's transaction `scenario`, with `edit` applied to its metadata */
        function edited(
            scenario: string,
            edit: (meta: Metadata) => void
        ): PreparedTransaction {
            const [{ tx: input }] = liveFixtures(
                'HASHING_SCHEME_VERSION_V2'
            ).filter((fixture) => fixture.scenario === scenario)
            edit(input.metadata!)
            return input
        }

        it('hashes a ledger time bound before 1970 as the participant does', async () => {
            // 1960-01-01T00:00:00Z
            const input = edited('ledger-time-bounds', (meta) => {
                meta.minLedgerEffectiveTime = BigInt.asUintN(
                    64,
                    -315_619_200_000_000n
                )
            })

            expect(await v2(input)).toBe(
                'e06440f2e14d153a0178a3a138792ac74b344f4e36fb0528027005feaf23c0a8'
            )
        })

        const preparedAt = (micros: bigint) =>
            v2(
                edited('create-plain', (meta) => {
                    meta.preparationTime = BigInt.asUintN(64, micros)
                })
            )

        it('hashes a preparation time of 0001-01-01T00:00:00Z, the first Daml timestamp, as the participant does, and refuses a microsecond earlier', async () => {
            expect(await preparedAt(FIRST_TIMESTAMP)).toBe(
                '5264783d9664ec440dc2d57d5dd97b10e233a1dba420a5c081b6443530d2e6a9'
            )
            await expect(preparedAt(FIRST_TIMESTAMP - 1n)).rejects.toThrow(
                rejection('INVALID_VALUE', 'metadata.preparationTime')
            )
        })

        it('hashes a preparation time of 9999-12-31T23:59:59.999999Z, the last Daml timestamp, as the participant does, and refuses a microsecond later', async () => {
            expect(await preparedAt(LAST_TIMESTAMP)).toBe(
                'e8f690c321944a6273432f7673a35f2089542137a1927b21c9bfa1eb57745a8d'
            )
            await expect(preparedAt(LAST_TIMESTAMP + 1n)).rejects.toThrow(
                rejection('INVALID_VALUE', 'metadata.preparationTime')
            )
        })

        it.each([
            [
                'minLedgerEffectiveTime',
                metadata({ minLedgerEffectiveTime: LAST_TIMESTAMP + 1n }),
            ],
            [
                'maxLedgerEffectiveTime',
                metadata({ maxLedgerEffectiveTime: LAST_TIMESTAMP + 1n }),
            ],
            [
                'inputContracts[0].createdAt',
                metadata({
                    inputContracts: [
                        inputContract(create(), LAST_TIMESTAMP + 1n),
                    ],
                }),
            ],
        ])(
            'refuses metadata.%s a microsecond after the last Daml timestamp',
            (field, meta) =>
                expect(v2(single(createNode('0'), meta))).rejects.toThrow(
                    rejection('INVALID_VALUE', `metadata.${field}`)
                )
        )
    })

    describe('rejections', () => {
        it('rejects QueryByKey', () =>
            expect(v2(single(queryByKeyNode('0')))).rejects.toThrow(
                rejection(
                    'FIELD_NOT_COVERED_BY_SCHEME',
                    'transaction.nodes[0].v1.queryByKey'
                )
            ))

        it.each([
            [
                'a create with key',
                single(createNode('0', { key: contractKey() })),
                'transaction.nodes[0].v1.create.key',
            ],
            [
                'an exercise with key',
                single(exerciseNode('0', [], { key: contractKey() })),
                'transaction.nodes[0].v1.exercise.key',
            ],
            [
                'an exercise with byKey',
                single(exerciseNode('0', [], { byKey: true })),
                'transaction.nodes[0].v1.exercise.byKey',
            ],
            [
                'a fetch with key',
                single(fetchNode('0', { key: contractKey() })),
                'transaction.nodes[0].v1.fetch.key',
            ],
            [
                'a fetch with byKey',
                single(fetchNode('0', { byKey: true })),
                'transaction.nodes[0].v1.fetch.byKey',
            ],
            [
                'an input contract with key',
                withInputContract(create({ key: contractKey() })),
                'metadata.inputContracts[0].v1.key',
            ],
        ])('rejects %s', (_name, input, path) =>
            expect(v2(input)).rejects.toThrow(
                rejection('FIELD_NOT_COVERED_BY_SCHEME', path)
            )
        )

        it('rejects metadata with maxRecordTime', () =>
            expect(
                v2(single(createNode('0'), metadata({ maxRecordTime: 1n })))
            ).rejects.toThrow(
                rejection(
                    'FIELD_NOT_COVERED_BY_SCHEME',
                    'metadata.maxRecordTime'
                )
            ))

        it.each(['2', '2.2'])('rejects lf version %j', (lf) =>
            expect(
                v2(single(createNode('0', { lfVersion: lf })))
            ).rejects.toThrow(
                rejection(
                    'UNSUPPORTED_LF_VERSION',
                    'transaction.nodes[0].v1.create.lfVersion'
                )
            )
        )

        it.each([
            [
                'an exercise',
                single(exerciseNode('0', [], { lfVersion: '2' })),
                'transaction.nodes[0].v1.exercise.lfVersion',
            ],
            [
                'a fetch',
                single(fetchNode('0', { lfVersion: '2' })),
                'transaction.nodes[0].v1.fetch.lfVersion',
            ],
            [
                'an input contract',
                withInputContract(create({ lfVersion: '2' })),
                'metadata.inputContracts[0].v1.lfVersion',
            ],
        ])('rejects lf version "2" in %s', (_name, input, path) =>
            expect(v2(input)).rejects.toThrow(
                rejection('UNSUPPORTED_LF_VERSION', path)
            )
        )

        it('rejects a transaction of lf version "2"', () => {
            const input = single(createNode('0'))
            input.transaction!.version = '2'

            return expect(v2(input)).rejects.toThrow(
                rejection('UNSUPPORTED_LF_VERSION', 'transaction.version')
            )
        })

        it.each([
            ['an exercise', [createNode('0'), exerciseNode('1')]],
            ['a create', [exerciseNode('0'), createNode('1')]],
        ])('rejects %s without seed', (_name, nodes) =>
            expect(
                v2(prepared(tx(['0', '1'], nodes, [seed(0)])))
            ).rejects.toThrow(
                rejection('MISSING_NODE_SEED', 'transaction.nodes[1]')
            )
        )

        it.each([
            ['fetch', [createNode('0'), fetchNode('1')]],
            [
                'rollback',
                [createNode('0'), rollbackNode('1', ['2']), createNode('2')],
            ],
            ['queryByKey', [createNode('0'), queryByKeyNode('1')]],
        ])('rejects a seed on a %s node', (_name, nodes) =>
            expect(
                v2(
                    prepared(
                        tx(
                            ['0', '1'],
                            nodes,
                            nodes.map((node) => seed(Number(node.nodeId)))
                        )
                    )
                )
            ).rejects.toThrow(
                rejection(
                    'FIELD_NOT_COVERED_BY_SCHEME',
                    'transaction.nodeSeeds[1]'
                )
            )
        )

        it.each([0, 31, 33])('rejects a seed of %i bytes', (length) =>
            expect(
                v2(
                    prepared(
                        tx(
                            ['0'],
                            [createNode('0')],
                            [seed(0, new Uint8Array(length))]
                        )
                    )
                )
            ).rejects.toThrow(
                rejection('INVALID_VALUE', 'transaction.nodeSeeds[0].seed')
            )
        )

        it('rejects a node that is not a v1 node', () =>
            expect(
                v2(
                    prepared(
                        tx(
                            ['0'],
                            [
                                exerciseNode('0', ['1']),
                                {
                                    nodeId: '1',
                                    versionedNode: { oneofKind: undefined },
                                },
                            ],
                            [seed(0)]
                        )
                    )
                )
            ).rejects.toThrow(
                rejection('UNSUPPORTED_NODE_VERSION', 'transaction.nodes[1]')
            ))

        it('rejects a node without a node type', () =>
            expect(
                v2(
                    prepared(
                        tx(
                            ['0'],
                            [
                                exerciseNode('0', ['1']),
                                {
                                    nodeId: '1',
                                    versionedNode: {
                                        oneofKind: 'v1',
                                        v1: {
                                            nodeType: { oneofKind: undefined },
                                        },
                                    },
                                },
                            ],
                            [seed(0)]
                        )
                    )
                )
            ).rejects.toThrow(
                rejection('MISSING_FIELD', 'transaction.nodes[1].v1')
            ))

        it('rejects a rollback without children', () =>
            expect(
                v2(prepared(tx(['0'], [rollbackNode('0', [])])))
            ).rejects.toThrow(
                rejection(
                    'MISSING_FIELD',
                    'transaction.nodes[0].v1.rollback.children'
                )
            ))

        it.each([
            [
                'a create without templateId',
                () => single(leaveOut(createNode('0'), 'templateId')),
                'transaction.nodes[0].v1.create.templateId',
            ],
            [
                'a create without argument',
                () => single(leaveOut(createNode('0'), 'argument')),
                'transaction.nodes[0].v1.create.argument',
            ],
            [
                'an exercise without templateId',
                () => single(leaveOut(exerciseNode('0'), 'templateId')),
                'transaction.nodes[0].v1.exercise.templateId',
            ],
            [
                'an exercise without chosenValue',
                () => single(leaveOut(exerciseNode('0'), 'chosenValue')),
                'transaction.nodes[0].v1.exercise.chosenValue',
            ],
            [
                'a fetch without templateId',
                () => single(leaveOut(fetchNode('0'), 'templateId')),
                'transaction.nodes[0].v1.fetch.templateId',
            ],
            [
                'a prepared transaction without metadata',
                () => {
                    const input = single(createNode('0'))
                    delete input.metadata
                    return input
                },
                'metadata',
            ],
            [
                'metadata without submitterInfo',
                () => {
                    const meta = metadata()
                    delete meta.submitterInfo
                    return single(createNode('0'), meta)
                },
                'metadata.submitterInfo',
            ],
            [
                'an input contract without contract',
                () => {
                    const contract = inputContract(create())
                    contract.contract = { oneofKind: undefined }
                    return single(
                        createNode('0'),
                        metadata({ inputContracts: [contract] })
                    )
                },
                'metadata.inputContracts[0]',
            ],
            [
                'an input contract without argument',
                () => {
                    const contract = create()
                    delete contract.argument
                    return withInputContract(contract)
                },
                'metadata.inputContracts[0].v1.argument',
            ],
        ])('rejects %s', (_name, input, path) =>
            expect(v2(input())).rejects.toThrow(
                rejection('MISSING_FIELD', path)
            )
        )

        it('rejects a mediatorGroup of 2^31, beyond the int32 it is hashed as', () =>
            expect(
                v2(
                    single(
                        createNode('0'),
                        metadata({ mediatorGroup: 2 ** 31 })
                    )
                )
            ).rejects.toThrow(
                rejection('INVALID_VALUE', 'metadata.mediatorGroup')
            ))

        it('names the field path of a bad value inside a node', () =>
            expect(
                v2(
                    prepared(
                        tx(
                            ['0'],
                            [
                                createNode('1'),
                                fetchNode('2'),
                                exerciseNode('0', ['1', '2'], {
                                    chosenValue: record([
                                        ['amount', int64('1.5')],
                                    ]),
                                }),
                            ],
                            [seed(0), seed(1)]
                        )
                    )
                )
            ).rejects.toThrow(
                rejection(
                    'INVALID_VALUE',
                    'transaction.nodes[2].v1.exercise.chosenValue.record.fields[0].value.int64'
                )
            ))

        it.each([
            [
                'a create argument',
                single(createNode('0', { argument: nestedLists(3) })),
                'transaction.nodes[0].v1.create.argument',
            ],
            [
                'an exercise chosen value',
                single(exerciseNode('0', [], { chosenValue: nestedLists(3) })),
                'transaction.nodes[0].v1.exercise.chosenValue',
            ],
            [
                'an exercise result',
                single(
                    exerciseNode('0', [], { exerciseResult: nestedLists(3) })
                ),
                'transaction.nodes[0].v1.exercise.exerciseResult',
            ],
            [
                'an input contract argument',
                withInputContract(create({ argument: nestedLists(3) })),
                'metadata.inputContracts[0].v1.argument',
            ],
        ])('applies maxValueDepth to %s', (_name, input, path) =>
            expect(
                v2(input, { ...DEFAULT_LIMITS, maxValueDepth: 2 })
            ).rejects.toThrow(
                rejection(
                    'DEPTH_LIMIT_EXCEEDED',
                    `${path}.list.elements[0].list.elements[0]`
                )
            )
        )
    })
})
