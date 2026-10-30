// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import type { PreparedTransaction } from '@canton-network/core-ledger-proto'
import { checkForest } from '../forest.js'
import { DEFAULT_LIMITS, type TraversalLimits } from '../limits.js'
import { hashPrepared } from '../scheme.js'
import { schemeV3 } from '../v3.js'
import {
    contractKey,
    create,
    createNode,
    exercise,
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
    queryByKey,
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
import { liveFixtures } from './helpers/live-fixtures.js'
import { hx, rejection } from './helpers/matchers.js'

// Expected values that do not come from a participant were produced by running
// daml_transaction_hashing_v3.py (canton v3.5.1, 08-interactive-submission) on
// the same inputs. Spaces only group the bytes.

const NO_KEYS =
    'keys are not supported in nodes with LF serialization version 2.1'

async function v3(
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
            schemeV3,
            limits.maxValueDepth
        )
    )
}

const { maxValueDepth } = DEFAULT_LIMITS

/** id(pkg:Mod:Tpl), the template of every builder */
const TEMPLATE =
    '00000003 706b67  00000001 00000003 4d6f64  00000001 00000003 54706c'

/**
 * A key from contractKey() whose hash is 32 times `byte`: package name,
 * template, the value Party alice, the hash raw, maintainers ["alice"].
 */
function keyBytes(byte: string): string {
    return `00000003 706b67  ${TEMPLATE}  06 00000005 616c696365
        ${byte.repeat(32)}  00000001 00000005 616c696365`
}

// Parents are listed both before and after their children, and fields of one
// kind hold different values, so that swapping two of them changes the hash
const EVERY_FIELD = prepared(
    {
        ...tx(
            ['0', '7'],
            [
                createNode('1', {
                    lfVersion: '2',
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
                    key: contractKey(
                        {
                            templateId: identifier('tpl-1', 'Mod.Sub', 'Ent'),
                            packageName: 'pkg-1',
                            key: party('alice'),
                            hash: filled(0xa1),
                        },
                        ['alice', 'bob']
                    ),
                }),
                exerciseNode('0', ['1', '2', '3', '5', '6'], {
                    lfVersion: '2',
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
                    exerciseResult: text('done'),
                    choiceObservers: ['erin', 'frank'],
                    byKey: true,
                    key: contractKey(
                        {
                            templateId: identifier('tpl-0', 'Mod', 'Ent.Inner'),
                            packageName: 'pkg-0',
                            key: record(
                                [
                                    ['_1', party('bob')],
                                    ['_2', text('zero')],
                                ],
                                identifier('tuple', 'DA.Types', 'Tuple2')
                            ),
                            hash: filled(0xa0),
                        },
                        ['bob']
                    ),
                }),
                rollbackNode('3', ['4']),
                fetchNode('2', {
                    lfVersion: '2',
                    contractId: '0033',
                    packageName: 'pkg-2',
                    templateId: identifier('tpl-2', 'Mod', 'Ent'),
                    signatories: ['grace'],
                    stakeholders: ['grace', 'heidi'],
                    actingParties: ['ivan'],
                    interfaceId: identifier('iface-2', 'I', 'J'),
                    byKey: true,
                    key: contractKey(
                        {
                            templateId: identifier('tpl-2', 'Mod', 'Ent'),
                            packageName: 'pkg-2',
                            key: text('two'),
                            hash: filled(0xa2),
                        },
                        ['grace']
                    ),
                }),
                exerciseNode('4', [], {
                    contractId: '0044',
                    packageName: 'pkg-4',
                    choiceId: 'Inner',
                    exerciseResult: text('inner'),
                }),
                queryByKeyNode('5', {
                    packageName: 'pkg-5',
                    templateId: identifier('tpl-5', 'Mod', 'Keyed'),
                    exhaustive: true,
                    key: contractKey(
                        {
                            templateId: identifier('tpl-5', 'Mod', 'Keyed'),
                            packageName: 'pkg-5',
                            key: int64('5'),
                            hash: filled(0xa5),
                        },
                        ['carol']
                    ),
                    result: ['0055', '0056'],
                }),
                queryByKeyNode('6', {
                    packageName: 'pkg-6',
                    templateId: identifier('tpl-6', 'Mod', 'Keyed'),
                    key: contractKey(
                        {
                            templateId: identifier('tpl-6', 'Mod', 'Keyed'),
                            packageName: 'pkg-6',
                            key: text('none'),
                            hash: filled(0xa6),
                        },
                        ['dave']
                    ),
                }),
                createNode('7', { contractId: '0077', packageName: 'pkg-7' }),
            ],
            [
                seed(7, filled(0x77)),
                seed(0, filled(0x10)),
                seed(1, filled(0x11)),
                seed(4, filled(0x44)),
            ]
        ),
        version: '2',
    },
    metadata({
        submitterInfo: { actAs: ['alice', 'bob'], commandId: 'command-1' },
        synchronizerId: 'sync::1220',
        mediatorGroup: 7,
        transactionUuid: '00000000-0000-4000-8000-000000000001',
        preparationTime: 1_792_857_520_391_741n,
        minLedgerEffectiveTime: 1_792_857_500_000_000n,
        maxLedgerEffectiveTime: 1_792_857_600_000_000n,
        maxRecordTime: 1_792_857_700_000_000n,
        inputContracts: [
            inputContract(
                create({
                    lfVersion: '2',
                    contractId: '0088',
                    packageName: 'pkg-8',
                    argument: record([['owner', party('alice')]]),
                    signatories: ['alice'],
                    stakeholders: ['alice'],
                    key: contractKey({
                        packageName: 'pkg-8',
                        key: party('erin'),
                        hash: filled(0xa8),
                    }),
                }),
                1_792_857_519_621_919n
            ),
            inputContract(
                create({ contractId: '0099', packageName: 'pkg-9' }),
                1n
            ),
        ],
    })
)

describe('hashing scheme V3', () => {
    describe('real transactions', () => {
        it.each(liveFixtures('HASHING_SCHEME_VERSION_V3'))(
            'matches the live participant for $scenario',
            async ({ tx: input, hashHex }) =>
                expect(await v3(input)).toBe(hashHex)
        )
    })

    describe('encoding', () => {
        it('matches the Python example on a transaction that sets every field V3 hashes', async () =>
            expect(await v3(EVERY_FIELD)).toBe(
                'a4ab3f60c0d6b794f60bd23734dd14b0fb3e06a9b2fe21213edad2e4942a9804'
            ))

        it('encodes a create node without the 01 prefix', () =>
            // A minimal create starts with its lf version "2.1", then the create tag
            expect(
                toHex(
                    schemeV3.encodeCreate(
                        create(),
                        'create',
                        filled(0x01),
                        maxValueDepth
                    )
                )
            ).toBe(
                hx(`00000003 322e31  00  01 ${'01'.repeat(32)}
                    00000001 00  00000003 706b67  ${TEMPLATE}
                    00  00000000  00000000  00`)
            ))

        it('appends byKey and key after choice observers', () =>
            expect(
                toHex(
                    schemeV3.encodeExercise(
                        exercise({
                            lfVersion: '2',
                            choiceObservers: ['bob'],
                            byKey: true,
                            key: contractKey({ hash: filled(0xab) }),
                        }),
                        'exercise',
                        filled(0x02),
                        maxValueDepth
                    )
                )
            ).toBe(
                // Choice observers ["bob"], byKey 01, key present 01, then the
                // key. The children's hashes come after it
                hx(`00000001 32  01  ${'02'.repeat(32)}
                    00000001 00  00000003 706b67  ${TEMPLATE}
                    00000000  00000000  00000000  00
                    00000006 43686f696365  00  00  00
                    00000001 00000003 626f62  01  01 ${keyBytes('ab')}`)
            ))

        it('encodes QueryByKey with exhaustive flag and results', () =>
            expect(
                toHex(
                    schemeV3.encodeQueryByKey(
                        queryByKey({
                            exhaustive: true,
                            key: contractKey({ hash: filled(0xcd) }),
                            result: ['0a', 'bc01'],
                        }),
                        'queryByKey',
                        maxValueDepth
                    )
                )
            ).toBe(
                // Lf version "2", tag 04, package, template, exhaustive 01, the
                // key without a presence byte, two contract ids
                hx(`00000001 32  04  00000003 706b67  ${TEMPLATE}  01
                    ${keyBytes('cd')}
                    00000002  00000001 0a  00000002 bc01`)
            ))

        it('encodes absent maxRecordTime as 00 and present as 01 + i64', async () => {
            // Nor does the metadata start with an encoding version
            const fields = hx(`00000001 00000005 616c696365  00000003 636d64
                00000004 75756964  00000000  00000004 73796e63  00 00
                0000000000000001  00000000`)

            expect(
                toHex(await schemeV3.encodeMetadata(metadata(), maxValueDepth))
            ).toBe(`${fields}00`)
            expect(
                toHex(
                    await schemeV3.encodeMetadata(
                        metadata({ maxRecordTime: 2n }),
                        maxValueDepth
                    )
                )
            ).toBe(`${fields}010000000000000002`)
        })
    })

    // The participant writes a time from a signed 64-bit number into a uint64
    // field, so a time before 1970 arrives as 2^64 minus its magnitude. Canton
    // 3.5.18's own decoder and hasher computed the expected hash for the same
    // bytes; the Python example raises struct.error on them.
    describe('metadata times', () => {
        it('hashes a ledger time bound before 1970 as the participant does', async () => {
            const [{ tx: input }] = liveFixtures(
                'HASHING_SCHEME_VERSION_V3'
            ).filter(({ scenario }) => scenario === 'ledger-time-bounds')
            // 1960-01-01T00:00:00Z
            input.metadata!.minLedgerEffectiveTime = BigInt.asUintN(
                64,
                -315_619_200_000_000n
            )

            expect(await v3(input)).toBe(
                '5eb8657776950fd592fa7c90f6c42af60f70aef91c57c786d38e08ef40187f64'
            )
        })

        const AFTER_LAST_TIMESTAMP = 253_402_300_800_000_000n
        it.each([
            [
                'preparationTime',
                metadata({ preparationTime: AFTER_LAST_TIMESTAMP }),
            ],
            [
                'minLedgerEffectiveTime',
                metadata({ minLedgerEffectiveTime: AFTER_LAST_TIMESTAMP }),
            ],
            [
                'maxLedgerEffectiveTime',
                metadata({ maxLedgerEffectiveTime: AFTER_LAST_TIMESTAMP }),
            ],
            [
                'maxRecordTime',
                metadata({ maxRecordTime: AFTER_LAST_TIMESTAMP }),
            ],
            [
                'inputContracts[0].createdAt',
                metadata({
                    inputContracts: [
                        inputContract(create(), AFTER_LAST_TIMESTAMP),
                    ],
                }),
            ],
        ])(
            'refuses metadata.%s a microsecond after the last Daml timestamp',
            (field, meta) =>
                expect(v3(single(createNode('0'), meta))).rejects.toThrow(
                    rejection('INVALID_VALUE', `metadata.${field}`)
                )
        )
    })

    describe('rejections', () => {
        it.each(['3', 'dev', '2.2', ''])('rejects lf version %j', (lf) =>
            expect(
                v3(single(createNode('0', { lfVersion: lf })))
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
                single(exerciseNode('0', [], { lfVersion: 'dev' })),
                'transaction.nodes[0].v1.exercise.lfVersion',
            ],
            [
                'a fetch',
                single(fetchNode('0', { lfVersion: 'dev' })),
                'transaction.nodes[0].v1.fetch.lfVersion',
            ],
            [
                'a QueryByKey',
                single(
                    queryByKeyNode('0', {
                        lfVersion: 'dev',
                        key: contractKey(),
                    })
                ),
                'transaction.nodes[0].v1.queryByKey.lfVersion',
            ],
            [
                'an input contract',
                withInputContract(create({ lfVersion: 'dev' })),
                'metadata.inputContracts[0].v1.lfVersion',
            ],
        ])('rejects lf version "dev" in %s', (_name, input, path) =>
            expect(v3(input)).rejects.toThrow(
                rejection('UNSUPPORTED_LF_VERSION', path)
            )
        )

        it('rejects a transaction of lf version "dev"', () => {
            const input = single(createNode('0'))
            input.transaction!.version = 'dev'

            return expect(v3(input)).rejects.toThrow(
                rejection('UNSUPPORTED_LF_VERSION', 'transaction.version')
            )
        })

        it.each([
            [
                'a create',
                single(createNode('0', { key: contractKey() })),
                'transaction.nodes[0].v1.create.key',
            ],
            [
                'an exercise',
                single(exerciseNode('0', [], { key: contractKey() })),
                'transaction.nodes[0].v1.exercise.key',
            ],
            [
                'a fetch',
                single(fetchNode('0', { key: contractKey() })),
                'transaction.nodes[0].v1.fetch.key',
            ],
            [
                'an input contract',
                withInputContract(create({ key: contractKey() })),
                'metadata.inputContracts[0].v1.key',
            ],
        ])('rejects a key in %s of lf version "2.1"', (_name, input, path) =>
            expect(v3(input)).rejects.toThrow(
                rejection('UNSUPPORTED_LF_VERSION', path, NO_KEYS)
            )
        )

        it.each([
            [
                'an exercise',
                single(exerciseNode('0', [], { byKey: true })),
                'transaction.nodes[0].v1.exercise.byKey',
            ],
            [
                'a fetch',
                single(fetchNode('0', { byKey: true })),
                'transaction.nodes[0].v1.fetch.byKey',
            ],
        ])(
            'rejects byKey = true in %s of lf version "2.1"',
            (_name, input, path) =>
                expect(v3(input)).rejects.toThrow(
                    rejection(
                        'UNSUPPORTED_LF_VERSION',
                        path,
                        'byKey is not supported in nodes with LF serialization version 2.1'
                    )
                )
        )

        it('rejects a QueryByKey of lf version "2.1"', () =>
            expect(
                v3(
                    single(
                        queryByKeyNode('0', {
                            lfVersion: '2.1',
                            key: contractKey(),
                        })
                    )
                )
            ).rejects.toThrow(
                rejection(
                    'UNSUPPORTED_LF_VERSION',
                    'transaction.nodes[0].v1.queryByKey',
                    NO_KEYS
                )
            ))

        it.each([
            [
                'a create whose key hash has 31 bytes',
                single(
                    createNode('0', {
                        key: contractKey({ hash: new Uint8Array(31) }),
                    })
                ),
                'transaction.nodes[0].v1.create.key',
            ],
            [
                'a QueryByKey without key',
                single(queryByKeyNode('0', { lfVersion: '2.1' })),
                'transaction.nodes[0].v1.queryByKey',
            ],
        ])(
            'reports the lf version "2.1" of %s before the problem with its key',
            (_name, input, path) =>
                expect(v3(input)).rejects.toThrow(
                    rejection('UNSUPPORTED_LF_VERSION', path, NO_KEYS)
                )
        )

        it('rejects QueryByKey without key', () =>
            expect(v3(single(queryByKeyNode('0')))).rejects.toThrow(
                rejection(
                    'MISSING_FIELD',
                    'transaction.nodes[0].v1.queryByKey.key'
                )
            ))

        it.each([0, 31, 33])('rejects a key hash of %i bytes', (length) =>
            expect(
                v3(
                    single(
                        createNode('0', {
                            lfVersion: '2',
                            key: contractKey({ hash: new Uint8Array(length) }),
                        })
                    )
                )
            ).rejects.toThrow(
                rejection(
                    'INVALID_VALUE',
                    'transaction.nodes[0].v1.create.key.key.hash'
                )
            )
        )

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
                'a QueryByKey without templateId',
                () =>
                    single(
                        leaveOut(
                            queryByKeyNode('0', { key: contractKey() }),
                            'templateId'
                        )
                    ),
                'transaction.nodes[0].v1.queryByKey.templateId',
            ],
            [
                'a key without its global key',
                () =>
                    single(
                        createNode('0', {
                            lfVersion: '2',
                            key: { maintainers: ['alice'] },
                        })
                    ),
                'transaction.nodes[0].v1.create.key.key',
            ],
            [
                'a global key without templateId',
                () =>
                    single(
                        createNode('0', {
                            lfVersion: '2',
                            key: {
                                key: {
                                    packageName: 'pkg',
                                    key: party('alice'),
                                    hash: new Uint8Array(32),
                                },
                                maintainers: ['alice'],
                            },
                        })
                    ),
                'transaction.nodes[0].v1.create.key.key.templateId',
            ],
            [
                'a global key without value',
                () =>
                    single(
                        createNode('0', {
                            lfVersion: '2',
                            key: {
                                key: {
                                    templateId: identifier('pkg', 'Mod', 'Tpl'),
                                    packageName: 'pkg',
                                    hash: new Uint8Array(32),
                                },
                                maintainers: ['alice'],
                            },
                        })
                    ),
                'transaction.nodes[0].v1.create.key.key.key',
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
        ])('rejects %s', (_name, input, path) =>
            expect(v3(input())).rejects.toThrow(
                rejection('MISSING_FIELD', path)
            )
        )

        it('rejects a mediatorGroup of 2^31, beyond the int32 it is hashed as', () =>
            expect(
                v3(
                    single(
                        createNode('0'),
                        metadata({ mediatorGroup: 2 ** 31 })
                    )
                )
            ).rejects.toThrow(
                rejection('INVALID_VALUE', 'metadata.mediatorGroup')
            ))

        it('rejects a key maintainer with an unpaired surrogate, at its path', () =>
            expect(
                v3(
                    single(
                        createNode('0', {
                            lfVersion: '2',
                            key: contractKey({}, ['\ud800']),
                        })
                    )
                )
            ).rejects.toThrow(
                rejection(
                    'INVALID_VALUE',
                    'transaction.nodes[0].v1.create.key.maintainers[0]'
                )
            ))

        it('names the field path of a bad value inside a key', () =>
            expect(
                v3(
                    prepared(
                        tx(
                            ['0'],
                            [
                                exerciseNode('0', ['1']),
                                queryByKeyNode('1', {
                                    key: contractKey({
                                        key: record([['amount', int64('1.5')]]),
                                    }),
                                }),
                            ],
                            [seed(0)]
                        )
                    )
                )
            ).rejects.toThrow(
                rejection(
                    'INVALID_VALUE',
                    'transaction.nodes[1].v1.queryByKey.key.key.key.record.fields[0].value.int64'
                )
            ))

        it.each([
            [
                'a create argument',
                single(createNode('0', { argument: nestedLists(3) })),
                'transaction.nodes[0].v1.create.argument',
            ],
            [
                'a create key',
                single(
                    createNode('0', {
                        lfVersion: '2',
                        key: contractKey({ key: nestedLists(3) }),
                    })
                ),
                'transaction.nodes[0].v1.create.key.key.key',
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
                'an exercise key',
                single(
                    exerciseNode('0', [], {
                        lfVersion: '2',
                        key: contractKey({ key: nestedLists(3) }),
                    })
                ),
                'transaction.nodes[0].v1.exercise.key.key.key',
            ],
            [
                'a fetch key',
                single(
                    fetchNode('0', {
                        lfVersion: '2',
                        key: contractKey({ key: nestedLists(3) }),
                    })
                ),
                'transaction.nodes[0].v1.fetch.key.key.key',
            ],
            [
                'a QueryByKey key',
                single(
                    queryByKeyNode('0', {
                        key: contractKey({ key: nestedLists(3) }),
                    })
                ),
                'transaction.nodes[0].v1.queryByKey.key.key.key',
            ],
            [
                'an input contract argument',
                withInputContract(create({ argument: nestedLists(3) })),
                'metadata.inputContracts[0].v1.argument',
            ],
        ])('applies maxValueDepth to %s', (_name, input, path) =>
            expect(
                v3(input, { ...DEFAULT_LIMITS, maxValueDepth: 2 })
            ).rejects.toThrow(
                rejection(
                    'DEPTH_LIMIT_EXCEEDED',
                    `${path}.list.elements[0].list.elements[0]`
                )
            )
        )
    })
})
