// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import {
    PreparedTransaction,
    type Metadata,
} from '@canton-network/core-ledger-proto'
import { fromBase64, hexToBytes, sha256 } from '../bytes.js'
import { DEFAULT_LIMITS, type TraversalLimits } from '../limits.js'
import { schemeV2 } from '../v2.js'
import {
    chain,
    contractId,
    contractKey,
    create,
    createNode,
    exerciseNode,
    fetchNode,
    filled,
    hashWith,
    identifier,
    inputContract,
    int64,
    list,
    metadata,
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

// Expected values that do not come from a participant were produced by running
// daml_transaction_hashing_v2.py (canton v3.5.1, 08-interactive-submission) on
// the same inputs. Spaces only group the bytes.

const v2 = (input: PreparedTransaction, limits?: TraversalLimits) =>
    hashWith(schemeV2, input, limits)

const decoded = (base64: string) =>
    PreparedTransaction.fromBinary(fromBase64(base64))

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
        it('matches the participant hash with an int64 of 2^53 + 1', async () => {
            const input = decoded(bigInt64V2.preparedTransaction)
            expect(int64sBeyond2To53(input)).toContain('9007199254740993')

            expect(await v2(input)).toBe(
                toHex(fromBase64(bigInt64V2.preparedTransactionHash))
            )
        })
    })

    describe('encoding', () => {
        it('hashes a transaction that sets every field V2 hashes', async () =>
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

        // The Python example recurses per node, so its expected hash came from
        // a run that looked child hashes up in a cache. The timeout allows for
        // CI runs with coverage
        it(
            'hashes a 10,000 node chain',
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

    // The expected hashes come from Canton 3.5.18's own decoder and hasher
    // (canton-open-source), run offline on these bytes
    describe('metadata times', () => {
        const FIRST_TIMESTAMP = -62_135_596_800_000_000n
        const LAST_TIMESTAMP = 253_402_300_799_999_999n

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

        it('hashes a ledger time bound before 1970', async () => {
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

        it('hashes preparationTime at the first Daml timestamp and refuses earlier', async () => {
            expect(await preparedAt(FIRST_TIMESTAMP)).toBe(
                '5264783d9664ec440dc2d57d5dd97b10e233a1dba420a5c081b6443530d2e6a9'
            )
            await expect(preparedAt(FIRST_TIMESTAMP - 1n)).rejects.toThrow(
                rejection('INVALID_VALUE', 'metadata.preparationTime')
            )
        })

        it('hashes preparationTime at the last Daml timestamp and refuses later', async () => {
            expect(await preparedAt(LAST_TIMESTAMP)).toBe(
                'e8f690c321944a6273432f7673a35f2089542137a1927b21c9bfa1eb57745a8d'
            )
            await expect(preparedAt(LAST_TIMESTAMP + 1n)).rejects.toThrow(
                rejection('INVALID_VALUE', 'metadata.preparationTime')
            )
        })
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
                'a prepared transaction without metadata',
                () => {
                    const input = single(createNode('0'))
                    delete input.metadata
                    return input
                },
                'metadata',
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
                                        ['cid', contractId('abc')],
                                    ]),
                                }),
                            ],
                            [seed(0), seed(1)]
                        )
                    )
                )
            ).rejects.toThrow(
                rejection(
                    'INVALID_HEX',
                    'transaction.nodes[2].v1.exercise.chosenValue.record.fields[0].value.contractId'
                )
            ))
    })
})
