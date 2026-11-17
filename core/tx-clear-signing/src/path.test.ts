// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import type { Value } from '@canton-network/core-ledger-proto'
import { parsePath, PathError, resolvePath } from './path.js'

describe('parsePath', () => {
    it('splits a path into steps', () => {
        expect(parsePath('settlement.executors.length')).toEqual([
            { kind: 'name', name: 'settlement' },
            { kind: 'name', name: 'executors' },
            { kind: 'name', name: 'length' },
        ])
    })

    it('reads quoted map keys, including escapes and separators', () => {
        expect(
            parsePath('meta.values["a \\"quoted\\" key with } and ]"]')
        ).toEqual([
            { kind: 'name', name: 'meta' },
            { kind: 'name', name: 'values' },
            { kind: 'key', key: 'a "quoted" key with } and ]' },
        ])
    })

    it.each([
        '',
        '.amount',
        'amount.',
        'a..b',
        'values["open',
        '1amount',
        '@.contract.id',
        'executors.[]',
        'values["\\q"]',
    ])('rejects %j', (path) => {
        expect(() => parsePath(path)).toThrow(PathError)
    })
})

describe('resolvePath', () => {
    const none: Value = { sum: { oneofKind: 'optional', optional: {} } }
    const some = (value: Value): Value => ({
        sum: { oneofKind: 'optional', optional: { value } },
    })
    const int = (n: number): Value => ({
        sum: { oneofKind: 'int64', int64: String(n) },
    })
    const record = (label: string, value: Value): Value => ({
        sum: { oneofKind: 'record', record: { fields: [{ label, value }] } },
    })

    it('makes the value None when a step is None', () => {
        expect(resolvePath(record('x', some(none)), parsePath('x.y'))).toEqual({
            value: none,
        })
    })

    it('unwraps a Some at any step', () => {
        expect(
            resolvePath(
                record('x', some(record('y', int(1)))),
                parsePath('x.y')
            )
        ).toEqual({ value: int(1) })
        expect(
            resolvePath(record('x', record('y', int(1))), parsePath('x.y'))
        ).toEqual({ value: int(1) })
    })

    it('returns a None that the path names, and unwraps Some', () => {
        expect(
            resolvePath(record('x', some(none)), parsePath('x')).value
        ).toEqual(none)
        expect(
            resolvePath(record('x', some(int(1))), parsePath('x')).value
        ).toEqual(int(1))
    })

    it('returns a list as a whole', () => {
        const list: Value = {
            sum: { oneofKind: 'list', list: { elements: [int(1)] } },
        }
        expect(resolvePath(record('xs', list), parsePath('xs')).value).toEqual(
            list
        )
    })

    it('does not count a GenMap', () => {
        const genMap: Value = {
            sum: { oneofKind: 'genMap', genMap: { entries: [] } },
        }
        expect(() =>
            resolvePath(record('m', genMap), parsePath('m.length'))
        ).toThrow("'length' applied to genMap")
    })

    it('selects a record field named length', () => {
        expect(
            resolvePath(record('length', int(7)), parsePath('length')).value
        ).toEqual(int(7))
    })

    it('takes a field missing from a record to be None, and says so', () => {
        expect(resolvePath(record('x', int(1)), parsePath('y'))).toEqual({
            value: none,
            absentField: 'y',
        })
        expect(resolvePath(record('x', int(1)), parsePath('y.z'))).toEqual({
            value: none,
            absentField: 'y',
        })
        expect(resolvePath(record('x', int(1)), parsePath('x'))).toEqual({
            value: int(1),
        })
    })

    it('only counts on the last step', () => {
        const list: Value = {
            sum: { oneofKind: 'list', list: { elements: [] } },
        }
        expect(() =>
            resolvePath(record('xs', list), parsePath('xs.length.foo'))
        ).toThrow("'length' applied to list")
    })
})
