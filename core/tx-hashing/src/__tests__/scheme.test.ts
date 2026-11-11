// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { DEFAULT_LIMITS } from '../limits.js'
import { schemeV2 } from '../v2.js'
import { schemeV3 } from '../v3.js'
import {
    create,
    createNode,
    exerciseNode,
    fetchNode,
    hashWith,
    leaveOut,
    metadata,
    nestedLists,
    single,
    withInputContract,
} from './helpers/builders.js'
import { rejection } from './helpers/matchers.js'

describe.each([
    ['V2', schemeV2],
    ['V3', schemeV3],
] as const)('hashing scheme %s', (_name, scheme) => {
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
            'metadata without submitterInfo',
            () => {
                const meta = metadata()
                delete meta.submitterInfo
                return single(createNode('0'), meta)
            },
            'metadata.submitterInfo',
        ],
    ])('rejects %s', (_name, input, path) =>
        expect(hashWith(scheme, input())).rejects.toThrow(
            rejection('MISSING_FIELD', path)
        )
    )

    it('rejects a mediatorGroup of 2^31', () =>
        expect(
            hashWith(
                scheme,
                single(createNode('0'), metadata({ mediatorGroup: 2 ** 31 }))
            )
        ).rejects.toThrow(rejection('INVALID_VALUE', 'metadata.mediatorGroup')))

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
            single(exerciseNode('0', [], { exerciseResult: nestedLists(3) })),
            'transaction.nodes[0].v1.exercise.exerciseResult',
        ],
        [
            'an input contract argument',
            withInputContract(create({ argument: nestedLists(3) })),
            'metadata.inputContracts[0].v1.argument',
        ],
    ])('applies maxValueDepth to %s', (_name, input, path) =>
        expect(
            hashWith(scheme, input, { ...DEFAULT_LIMITS, maxValueDepth: 2 })
        ).rejects.toThrow(
            rejection(
                'DEPTH_LIMIT_EXCEEDED',
                `${path}.list.elements[0].list.elements[0]`
            )
        )
    )
})
