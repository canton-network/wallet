// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import {
    PreparedTransaction,
    type DamlTransaction,
    type DamlTransaction_Node,
} from '@canton-network/core-ledger-proto'
import { fromBase64 } from '../bytes.js'
import { checkForest } from '../forest.js'
import { DEFAULT_LIMITS } from '../limits.js'
import {
    chain,
    createNode,
    exerciseNode,
    fetchNode,
    queryByKeyNode,
    rollbackNode,
    seed,
    tx,
} from './helpers/builders.js'
import { rejection } from './helpers/matchers.js'
import createAndExerciseV3 from '../../vectors/v3/v3-create-and-exercise.json'
import createPlainV2 from '../../vectors/v2/v2-create-plain.json'
import createPlainV3 from '../../vectors/v3/v3-create-plain.json'
import createWithKeyV3 from '../../vectors/v3/v3-create-with-key.json'
import lookupByKeyFoundV3 from '../../vectors/v3/v3-lookup-by-key-found.json'
import rollbackV3 from '../../vectors/v3/v3-rollback.json'

const check = (input: DamlTransaction) => checkForest(input, DEFAULT_LIMITS)

describe('checkForest', () => {
    describe('accepted forests', () => {
        it('accepts a nested tree with a rollback subtree', () => {
            // As most participant output does, this lists children before
            // their parents. Node 3 has no seed: whether a node needs one is
            // for the hashing scheme to decide. Node 4 is an exercise without
            // children.
            const input = tx(
                ['0', '11'],
                [
                    exerciseNode('4'),
                    exerciseNode('3', ['4']),
                    fetchNode('2'),
                    rollbackNode('1', ['2', '3']),
                    createNode('10'),
                    exerciseNode('0', ['1', '10']),
                    queryByKeyNode('11'),
                ],
                [
                    seed(0, Uint8Array.of(0)),
                    seed(4, Uint8Array.of(4)),
                    seed(10, Uint8Array.of(10)),
                ]
            )

            const forest = check(input)

            expect(forest.roots).toEqual(['0', '11'])
            expect(forest.nodes).toEqual(
                new Map(input.nodes.map((node) => [node.nodeId, node]))
            )
            expect(forest.seeds).toEqual(
                new Map([
                    ['0', Uint8Array.of(0)],
                    ['4', Uint8Array.of(4)],
                    ['10', Uint8Array.of(10)],
                ])
            )
        })

        it('accepts 2147483647 as a node id and as a seed node id', () => {
            const forest = check(
                tx(
                    ['2147483647'],
                    [createNode('2147483647')],
                    [seed(2147483647)]
                )
            )

            expect([...forest.nodes.keys()]).toEqual(['2147483647'])
            expect([...forest.seeds.keys()]).toEqual(['2147483647'])
        })

        it('treats a node without a v1 body or without a node type as a leaf', () => {
            const noBody: DamlTransaction_Node = {
                nodeId: '1',
                versionedNode: { oneofKind: undefined },
            }
            const noType: DamlTransaction_Node = {
                nodeId: '2',
                versionedNode: {
                    oneofKind: 'v1',
                    v1: { nodeType: { oneofKind: undefined } },
                },
            }

            const forest = check(
                tx(['0'], [exerciseNode('0', ['1', '2']), noBody, noType])
            )

            expect(new Set(forest.nodes.keys())).toEqual(
                new Set(['0', '1', '2'])
            )
        })

        // v3-create-and-exercise has two roots. In v3-rollback the participant
        // nests a Rollback holding a Fetch and an Exercise in an Exercise.
        it.each([
            ['v2-create-plain', createPlainV2],
            ['v3-create-plain', createPlainV3],
            ['v3-create-and-exercise', createAndExerciseV3],
            ['v3-create-with-key', createWithKeyV3],
            ['v3-lookup-by-key-found', lookupByKeyFoundV3],
            ['v3-rollback', rollbackV3],
        ])('accepts the live participant transaction %s', (_name, fixture) => {
            const { transaction } = PreparedTransaction.fromBinary(
                fromBase64(fixture.preparedTransaction)
            )
            if (transaction === undefined) throw new Error('no transaction')

            const forest = check(transaction)

            expect(forest.roots).toEqual(transaction.roots)
            expect(forest.nodes).toEqual(
                new Map(transaction.nodes.map((node) => [node.nodeId, node]))
            )
            expect(forest.seeds.size).toBe(transaction.nodeSeeds.length)
        })
    })

    describe('node ids', () => {
        it.each(['01', '-1', ' 1', '1e3', '2147483648', ''])(
            'rejects node id %j',
            (nodeId) =>
                expect(() => check(tx([nodeId], [createNode(nodeId)]))).toThrow(
                    rejection('INVALID_NODE_ID', 'transaction.nodes[0].nodeId')
                )
        )

        it.each([
            ['roots', tx(['01'], [createNode('1')]), 'transaction.roots[0]'],
            [
                'an exercise child',
                tx(['0'], [exerciseNode('0', ['01']), createNode('1')]),
                'transaction.nodes[0].v1.exercise.children[0]',
            ],
        ])(
            'rejects the id "01" in %s although node "1" exists',
            (_where, input, path) =>
                expect(() => check(input)).toThrow(
                    rejection('INVALID_NODE_ID', path)
                )
        )

        it('shows the first 20 characters of a long invalid id in the error message', () => {
            const nodeId = '9'.repeat(10_000)

            expect(() => check(tx([nodeId], [createNode(nodeId)]))).toThrow(
                expect.objectContaining({
                    code: 'INVALID_NODE_ID',
                    message: `"${'9'.repeat(20)}"... is not a node id: expected decimal digits without leading zeros, at most 2147483647`,
                })
            )
        })

        it('rejects duplicate node ids', () =>
            expect(() =>
                check(tx(['0'], [createNode('0'), fetchNode('0')]))
            ).toThrow(
                rejection('DUPLICATE_NODE_ID', 'transaction.nodes[1].nodeId')
            ))
    })

    describe('references', () => {
        it('rejects a child id that does not exist', () =>
            expect(() =>
                check(
                    tx(['0'], [exerciseNode('0', ['1', '2']), createNode('1')])
                )
            ).toThrow(
                rejection(
                    'DANGLING_NODE_REFERENCE',
                    'transaction.nodes[0].v1.exercise.children[1]'
                )
            ))

        it.each([
            ['a root', tx(['1'], [createNode('0')]), 'transaction.roots[0]'],
            [
                'a rollback child',
                tx(['0'], [rollbackNode('0', ['1'])]),
                'transaction.nodes[0].v1.rollback.children[0]',
            ],
        ])('rejects an id that does not exist in %s', (_where, input, path) =>
            expect(() => check(input)).toThrow(
                rejection('DANGLING_NODE_REFERENCE', path)
            )
        )

        it('rejects a node referenced by two parents', () =>
            expect(() =>
                check(
                    tx(
                        ['0'],
                        [
                            exerciseNode('0', ['1', '2']),
                            exerciseNode('1', ['3']),
                            exerciseNode('2', ['3']),
                            exerciseNode('3', ['4']),
                            createNode('4'),
                        ]
                    )
                )
            ).toThrow(
                rejection(
                    'SHARED_CHILD',
                    'transaction.nodes[2].v1.exercise.children[0]'
                )
            ))

        it('rejects the same id twice in roots', () =>
            expect(() =>
                check(
                    tx(['0', '0'], [exerciseNode('0', ['1']), createNode('1')])
                )
            ).toThrow(rejection('SHARED_CHILD', 'transaction.roots[1]')))

        it.each([
            [['0', '1'], 'transaction.roots[1]'],
            [['1', '0'], 'transaction.nodes[0].v1.exercise.children[0]'],
        ])(
            'rejects a node that is both a root and a child (roots %j)',
            (roots, path) =>
                expect(() =>
                    check(
                        tx(roots, [exerciseNode('0', ['1']), createNode('1')])
                    )
                ).toThrow(rejection('SHARED_CHILD', path))
        )

        it('rejects a node that is its own child', () =>
            expect(() => check(tx(['0'], [exerciseNode('0', ['0'])]))).toThrow(
                rejection(
                    'CYCLE',
                    'transaction.nodes[0].v1.exercise.children[0]'
                )
            ))

        it('rejects a two-node cycle', () =>
            expect(() =>
                check(
                    tx(
                        ['0'],
                        [exerciseNode('0', ['1']), exerciseNode('1', ['0'])]
                    )
                )
            ).toThrow(
                rejection(
                    'CYCLE',
                    'transaction.nodes[1].v1.exercise.children[0]'
                )
            ))

        it('rejects a node unreachable from roots', () =>
            expect(() =>
                check(tx(['0'], [createNode('0'), createNode('1')]))
            ).toThrow(rejection('ORPHAN_NODE', 'transaction.nodes[1].nodeId')))
    })

    describe('limits', () => {
        const threeNodes = { ...DEFAULT_LIMITS, maxNodes: 3 }
        const depth100 = { ...DEFAULT_LIMITS, maxNodeDepth: 100 }

        it('rejects more nodes than maxNodes', () =>
            expect(() =>
                checkForest(
                    tx(
                        ['0'],
                        [
                            exerciseNode('0', ['1', '2', '3']),
                            createNode('1'),
                            createNode('2'),
                            createNode('3'),
                        ]
                    ),
                    threeNodes
                )
            ).toThrow(rejection('NODE_LIMIT_EXCEEDED', 'transaction.nodes')))

        it('accepts exactly maxNodes nodes', () =>
            expect(
                checkForest(
                    tx(
                        ['0'],
                        [
                            exerciseNode('0', ['1', '2']),
                            createNode('1'),
                            createNode('2'),
                        ]
                    ),
                    threeNodes
                ).nodes.size
            ).toBe(3))

        it('counts the nodes before it looks at any of them', () =>
            expect(() =>
                checkForest(
                    tx(
                        [],
                        ['x', 'x', 'x', 'x'].map((nodeId) => createNode(nodeId))
                    ),
                    threeNodes
                )
            ).toThrow(rejection('NODE_LIMIT_EXCEEDED', 'transaction.nodes')))

        it('accepts nesting of exactly maxNodeDepth levels', () =>
            expect(
                checkForest(chain(100).transaction!, depth100).nodes.size
            ).toBe(100))

        it('rejects nesting deeper than maxNodeDepth', () =>
            expect(() =>
                checkForest(chain(101).transaction!, depth100)
            ).toThrow(
                rejection(
                    'DEPTH_LIMIT_EXCEEDED',
                    'transaction.nodes[99].v1.exercise.children[0]'
                )
            ))

        it('does not count siblings as depth', () => {
            const ids = Array.from({ length: 150 }, (_, i) => String(i + 1))
            const input = tx(
                ['0'],
                [exerciseNode('0', ids), ...ids.map((id) => createNode(id))]
            )

            const forest = checkForest(input, {
                ...DEFAULT_LIMITS,
                maxNodeDepth: 2,
            })

            expect(forest.nodes.size).toBe(151)
        })

        it('walks a 10_000 node chain without stack overflow', () => {
            const forest = checkForest(chain(10_000).transaction!, {
                ...DEFAULT_LIMITS,
                maxNodes: 10_000,
                maxNodeDepth: 10_000,
            })

            expect(forest.nodes.size).toBe(10_000)
        })

        it.each([
            ['maxNodes', 'NODE_LIMIT_EXCEEDED', 'transaction.nodes'],
            ['maxNodeDepth', 'DEPTH_LIMIT_EXCEEDED', 'transaction.roots[0]'],
        ] as const)(
            'rejects instead of passing when %s is NaN',
            (limit, code, path) =>
                expect(() =>
                    checkForest(tx(['0'], [createNode('0')]), {
                        ...DEFAULT_LIMITS,
                        [limit]: NaN,
                    })
                ).toThrow(rejection(code, path))
        )
    })

    describe('seeds', () => {
        it('rejects two seeds for one node', () =>
            expect(() =>
                check(
                    tx(
                        ['0'],
                        [createNode('0')],
                        [seed(0, Uint8Array.of(1)), seed(0, Uint8Array.of(2))]
                    )
                )
            ).toThrow(
                rejection('DUPLICATE_NODE_SEED', 'transaction.nodeSeeds[1]')
            ))

        it('rejects a seed for a node that does not exist', () =>
            expect(() =>
                check(tx(['0'], [createNode('0')], [seed(0), seed(1)]))
            ).toThrow(
                rejection(
                    'DANGLING_NODE_REFERENCE',
                    'transaction.nodeSeeds[1].nodeId'
                )
            ))

        it.each([-1, 1.5, NaN, 2147483648])(
            'rejects the seed node id %s',
            (nodeId) =>
                expect(() =>
                    check(tx(['0'], [createNode('0')], [seed(nodeId)]))
                ).toThrow(
                    rejection(
                        'INVALID_NODE_ID',
                        'transaction.nodeSeeds[0].nodeId'
                    )
                )
        )
    })

    describe('the returned forest', () => {
        it('keeps its roots, nodes and seeds when the lists of the input are changed afterwards', () => {
            const input = tx(
                ['0'],
                [exerciseNode('0', ['1']), createNode('1')],
                [seed(0)]
            )
            const forest = check(input)

            input.roots.push('1')
            input.nodes.pop()
            input.nodeSeeds.pop()

            expect(forest.roots).toEqual(['0'])
            expect(forest.nodes.size).toBe(2)
            expect([...forest.seeds.keys()]).toEqual(['0'])
        })
    })
})
