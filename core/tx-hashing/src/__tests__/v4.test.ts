// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    Exercise,
    PreparedTransaction,
} from '@canton-network/core-ledger-proto'
import { describe, expect, it } from 'vitest'

import { concat, sha256, toHex } from '../bytes.ts'
import { encodeInt32, encodeString } from '../encoding.ts'
import { DEFAULT_LIMITS } from '../limits.ts'
import type { Scheme } from '../scheme.ts'
import { schemeV3 } from '../v3.ts'
import { schemeV4 } from '../v4.ts'
import {
    contractKey,
    create,
    createNode,
    exercise,
    exerciseNode,
    fetchNode,
    filled,
    hashWith,
    identifier,
    inputContract,
    metadata,
    prepared,
    queryByKeyNode,
    rollbackNode,
    seed,
    single,
    tx,
    unit,
    withInputContract,
} from './helpers/builders.ts'
import { rejection } from './helpers/matchers.ts'

// Expected bytes and hashes come from Canton 3.6.4's v4/NodeHashTest.scala

type ExternalCallResult = Exercise['externalCallResults'][number]

const v3 = (input: PreparedTransaction) => hashWith(schemeV3, input)
const v4 = (input: PreparedTransaction) => hashWith(schemeV4, input)

const { maxValueDepth } = DEFAULT_LIMITS

const RESULT_1: ExternalCallResult = {
    extensionId: 'extension',
    functionId: 'function',
    config: Uint8Array.of(0x00),
    input: Uint8Array.of(0x01),
    output: Uint8Array.of(0x02),
}
const RESULT_2: ExternalCallResult = {
    ...RESULT_1,
    output: Uint8Array.of(0x03),
}

// Canton's trace of [RESULT_1, RESULT_2], NodeHashTest.scala:87-120
const TRACE =
    '00000002' +
    '00000009657874656e73696f6e0000000866756e6374696f6e000000010000000001010000000102' +
    '00000009657874656e73696f6e0000000866756e6374696f6e000000010000000001010000000103'

// Daml-LF's hashPrivateKey: version 01, purpose 03, then the string
const hashPrivateKey = (s: string) =>
    sha256(concat(0x01, 0x03, encodeString(s)))

const HASH = /^[0-9a-f]{64}$/

describe('hashing scheme V4', () => {
    it('hashes a transaction without exercise nodes as V3, but for the scheme byte 04', async () => {
        const input = prepared(
            tx(
                ['0', '1', '2', '4'],
                [
                    createNode('0', { lfVersion: '2', key: contractKey() }),
                    fetchNode('1', {
                        lfVersion: '2',
                        byKey: true,
                        key: contractKey(),
                    }),
                    rollbackNode('2', ['3']),
                    createNode('3'),
                    queryByKeyNode('4', {
                        key: contractKey(),
                        result: ['00'],
                    }),
                ],
                [seed(0, filled(0x10)), seed(3, filled(0x13))]
            ),
            metadata({
                maxRecordTime: 2n,
                inputContracts: [
                    inputContract(
                        create({ lfVersion: '2', key: contractKey() })
                    ),
                ],
            })
        )

        expect(await v4(input)).toBe(
            await hashWith({ ...schemeV3, version: 0x04 }, input)
        )
    })

    describe('external call results', () => {
        it('encodes external call results as Canton does', () => {
            const encoded = (externalCallResults: ExternalCallResult[]) =>
                toHex(
                    schemeV4.encodeExercise(
                        exercise({ lfVersion: '3', externalCallResults }),
                        'exercise',
                        filled(0x01),
                        maxValueDepth
                    )
                )
            const without = encoded([])

            expect(encoded([RESULT_1, RESULT_2])).toBe(
                without.slice(0, -8) + TRACE
            )
        })

        // NodeHashTest.scala:68-76
        it("gives Canton's hash of an LF 3 exercise node with two results", async () => {
            const node = exercise({
                lfVersion: '3',
                contractId: `00${toHex(await hashPrivateKey('target'))}`,
                packageName: 'package-name-0',
                templateId: identifier('package', 'Module', 'Template'),
                signatories: ['alice'],
                stakeholders: ['alice'],
                actingParties: ['alice'],
                consuming: true,
                exerciseResult: unit(),
                externalCallResults: [RESULT_1, RESULT_2],
            })
            const head = schemeV4.encodeExercise(
                node,
                'exercise',
                await hashPrivateKey('v4-external-call-node-seed'),
                maxValueDepth
            )

            // The node has no children. Canton prints this hash after the multihash prefix 1220
            expect(toHex(await sha256(concat(head, encodeInt32(0))))).toBe(
                'bdf9077509dc8e3cbd2db839b557483ecdb3ba90cbb49b152d164c4d139fd88c'
            )
        })

        it('ends an exercise without external call results with a zero count', () => {
            const node = exercise({
                lfVersion: '2',
                byKey: true,
                key: contractKey(),
            })
            const encoded = (scheme: Scheme) =>
                toHex(
                    scheme.encodeExercise(
                        node,
                        'exercise',
                        filled(0x02),
                        maxValueDepth
                    )
                )

            expect(encoded(schemeV4)).toBe(`${encoded(schemeV3)}00000000`)
        })

        it.each(['2', '2.1'])(
            'rejects external call results below LF 3, in lf version %j',
            (lf) =>
                expect(
                    v4(
                        single(
                            exerciseNode('0', [], {
                                lfVersion: lf,
                                externalCallResults: [RESULT_1],
                            })
                        )
                    )
                ).rejects.toThrow(
                    rejection(
                        'UNSUPPORTED_LF_VERSION',
                        'transaction.nodes[0].v1.exercise.externalCallResults',
                        `external call results are not supported in nodes with LF serialization version ${lf}`
                    )
                )
        )
    })

    describe('lf versions', () => {
        it.each([
            [
                'a create',
                single(createNode('0', { lfVersion: '3' })),
                'transaction.nodes[0].v1.create.lfVersion',
            ],
            [
                'an exercise',
                single(exerciseNode('0', [], { lfVersion: '3' })),
                'transaction.nodes[0].v1.exercise.lfVersion',
            ],
            [
                'a fetch',
                single(fetchNode('0', { lfVersion: '3' })),
                'transaction.nodes[0].v1.fetch.lfVersion',
            ],
            [
                'a QueryByKey node',
                single(
                    queryByKeyNode('0', {
                        lfVersion: '3',
                        key: contractKey(),
                    })
                ),
                'transaction.nodes[0].v1.queryByKey.lfVersion',
            ],
            [
                'an input contract',
                withInputContract(create({ lfVersion: '3' })),
                'metadata.inputContracts[0].v1.lfVersion',
            ],
            [
                'transaction.version',
                prepared({
                    ...tx(['0'], [createNode('0')], [seed(0)]),
                    version: '3',
                }),
                'transaction.version',
            ],
        ])('hashes LF 3 in %s', async (_name, input, path) => {
            await expect(v4(input)).resolves.toMatch(HASH)
            // V3 refuses the same input
            await expect(v3(input)).rejects.toThrow(
                rejection('UNSUPPORTED_LF_VERSION', path)
            )
        })

        it.each(['dev', '4', '2.2', ''])('rejects lf version %j', (lf) =>
            expect(
                v4(single(createNode('0', { lfVersion: lf })))
            ).rejects.toThrow(
                rejection(
                    'UNSUPPORTED_LF_VERSION',
                    'transaction.nodes[0].v1.create.lfVersion',
                    'hashing scheme V4 hashes LF versions 2.1, 2 and 3 only'
                )
            )
        )
    })
})
