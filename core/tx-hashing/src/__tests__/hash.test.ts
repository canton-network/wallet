// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import {
    Exercise,
    HashingSchemeVersion,
    PreparedTransaction,
} from '@canton-network/core-ledger-proto'
import { concat, fromBase64 } from '../bytes.js'
import { TxHashingError, type TxHashingErrorCode } from '../errors.js'
import {
    computePreparedTransactionHash,
    type HashingScheme,
    type HashOptions,
} from '../hash.js'
import {
    createNode,
    exercise,
    metadata,
    nestedLists,
    prepared,
    seed,
    single,
    tx,
} from './helpers/builders.js'
import { toHex } from './helpers/hex.js'
import { liveFixtures } from './helpers/live-fixtures.js'
import { V2, V3 } from './helpers/load-vectors.js'

const run = (input: unknown, scheme: unknown, options?: unknown) =>
    computePreparedTransactionHash(
        input as Uint8Array,
        scheme as HashingScheme,
        options as HashOptions
    )

const bytesOf = (message: PreparedTransaction) =>
    PreparedTransaction.toBinary(message)

const [V2_FIXTURE] = liveFixtures(V2)

// An exercise node that ends with field 99, a varint of 1 the bindings do not know
const WITH_FIELD_99 = bytesOf(
    single({
        nodeId: '0',
        versionedNode: {
            oneofKind: 'v1',
            v1: {
                nodeType: {
                    oneofKind: 'exercise',
                    exercise: Exercise.fromBinary(
                        concat(Exercise.toBinary(exercise()), 0x98, 0x06, 0x01)
                    ),
                },
            },
        },
    })
)
const FIELD_99 =
    'field 99 in com.daml.ledger.api.v2.interactive.transaction.v1.Exercise'

interface Refusal {
    title: string
    call: () => Promise<Uint8Array>
    code: TxHashingErrorCode
    path?: string
    says?: string
}

const REFUSALS: Refusal[] = [
    {
        title: 'rejects scheme 4',
        call: () => run(V2_FIXTURE.base64, 4),
        code: 'UNSUPPORTED_SCHEME',
        says: 'scheme 4 is not supported',
    },
    {
        title: 'rejects a missing scheme',
        call: () => run(V2_FIXTURE.base64, undefined),
        code: 'UNSUPPORTED_SCHEME',
        says: 'scheme undefined is not supported',
    },
    ...(
        [
            ['maxNodes', 0],
            ['maxNodeDepth', 1.5],
            ['maxValueDepth', 257],
            ['maxNodes', Number.NaN],
            ['maxNodeDepth', Infinity],
            ['maxValueDepth', '10'],
        ] as const
    ).map(([name, value]): Refusal => ({
        title: `rejects options.limits.${name} = ${typeof value === 'string' ? JSON.stringify(value) : value}`,
        call: () => run(V2_FIXTURE.base64, V2, { limits: { [name]: value } }),
        code: 'INVALID_VALUE',
        path: `options.limits.${name}`,
    })),
    {
        title: 'checks the scheme before decoding the input',
        call: () => run('not base64!', 4),
        code: 'UNSUPPORTED_SCHEME',
    },
    {
        title: 'checks the options before decoding the input',
        call: () => run('not base64!', V2, { limits: { maxNodes: 0 } }),
        code: 'INVALID_VALUE',
        path: 'options.limits.maxNodes',
    },
    {
        title: 'rejects input that is not base64',
        call: () => run('not base64!', V2),
        code: 'DECODE_FAILED',
    },
    ...(
        [
            ['empty bytes', new Uint8Array()],
            ['undefined', undefined],
            ['null', null],
        ] as const
    ).map(([what, input]): Refusal => ({
        title: `rejects ${what} as input`,
        call: () => run(input, V2),
        code: 'DECODE_FAILED',
    })),
    ...(
        [
            ['an ArrayBuffer', (bytes: Uint8Array) => bytes.buffer],
            ['a DataView', (bytes: Uint8Array) => new DataView(bytes.buffer)],
            [
                'an Int8Array',
                (bytes: Uint8Array) => new Int8Array(bytes.buffer),
            ],
            [
                'a decoded message',
                (bytes: Uint8Array) => PreparedTransaction.fromBinary(bytes),
            ],
        ] as const
    ).map(([what, wrap]): Refusal => ({
        title: `rejects ${what} as input`,
        call: () => run(wrap(fromBase64(V2_FIXTURE.base64)), V2),
        code: 'DECODE_FAILED',
        says: 'input must be a Uint8Array or a base64 string',
    })),
    {
        title: 'rejects truncated protobuf',
        call: () => run(fromBase64(V2_FIXTURE.base64).subarray(0, -1), V2),
        code: 'DECODE_FAILED',
    },
    {
        title: 'rejects a string that is not UTF-8',
        // transaction { version: the byte ff }
        call: () => run(Uint8Array.of(0x0a, 0x03, 0x0a, 0x01, 0xff), V2),
        code: 'DECODE_FAILED',
    },
    {
        title: 'rejects an unknown field inside an exercise node',
        call: () => run(WITH_FIELD_99, V2),
        code: 'UNKNOWN_FIELD',
        says: FIELD_99,
    },
    {
        title: 'rejects a prepared transaction without metadata',
        call: () =>
            run(
                bytesOf({
                    transaction: tx(['0'], [createNode('0')], [seed(0)]),
                }),
                V2
            ),
        code: 'MISSING_FIELD',
        path: 'metadata',
    },
    {
        title: 'rejects a prepared transaction without transaction',
        call: () => run(bytesOf({ metadata: metadata() }), V2),
        code: 'MISSING_FIELD',
        path: 'transaction',
    },
    {
        title: 'rejects a transaction without roots',
        call: () => run(bytesOf(prepared(tx([], []))), V2),
        code: 'MISSING_FIELD',
        path: 'transaction.roots',
    },
    {
        title: 'applies the default maxNodes when no options are given',
        call: () =>
            run(
                bytesOf(
                    prepared(
                        tx(
                            ['0'],
                            Array.from({ length: 10_001 }, (_node, i) =>
                                createNode(String(i))
                            )
                        )
                    )
                ),
                V2
            ),
        code: 'NODE_LIMIT_EXCEEDED',
        path: 'transaction.nodes',
        says: 'transaction has 10001 nodes, the limit is 10000',
    },
    {
        title: 'applies the default maxValueDepth when no options are given',
        call: () =>
            run(
                bytesOf(
                    single(createNode('0', { argument: nestedLists(102) }))
                ),
                V2
            ),
        code: 'DEPTH_LIMIT_EXCEEDED',
        path: `transaction.nodes[0].v1.create.argument${'.list.elements[0]'.repeat(101)}`,
        says: 'value is nested deeper than 101 levels',
    },
]

async function refusalOf(call: () => Promise<unknown>): Promise<unknown> {
    try {
        await call()
    } catch (error) {
        return error
    }
    throw new Error('the call was not refused')
}

describe('computePreparedTransactionHash', () => {
    describe.each([
        ['V2', HashingSchemeVersion.V2, 'HASHING_SCHEME_VERSION_V2'],
        ['V3', HashingSchemeVersion.V3, 'HASHING_SCHEME_VERSION_V3'],
    ] as const)('under HashingSchemeVersion.%s', (_label, scheme, name) => {
        it('returns the participant hash for base64 and bytes', async () => {
            const [{ base64, hashHex }] = liveFixtures(name)
            const hashes = await Promise.all([
                computePreparedTransactionHash(base64, scheme),
                computePreparedTransactionHash(fromBase64(base64), scheme),
            ])
            expect(hashes.map(toHex)).toEqual([hashHex, hashHex])
        })
    })

    it('hashes a Buffer view at a non-zero byteOffset', async () => {
        const { base64, hashHex } = V2_FIXTURE
        const bytes = fromBase64(base64)
        // The browser has no Buffer
        const pool = new Uint8Array(bytes.length + 16).fill(0xff)
        pool.set(bytes, 8)
        const view =
            typeof Buffer === 'undefined'
                ? new Uint8Array(pool.buffer, 8, bytes.length)
                : Buffer.from(pool.buffer, 8, bytes.length)

        const hashes = await Promise.all([run(view, V2), run(base64, V2)])
        expect(hashes.map(toHex)).toEqual([hashHex, hashHex])
    })

    it('hashes the input as it was at the call', async () => {
        // The metadata, hashed last, holds a key hash: bytes of the input
        const [{ base64, hashHex }] = liveFixtures(V3).filter(
            (fixture) => fixture.scenario === 'lookup-by-key-found'
        )
        const bytes = fromBase64(base64)

        const hash = run(bytes, V3)
        bytes.fill(0)

        expect(toHex(await hash)).toBe(hashHex)
    })

    it('hashes a value nested 256 levels deep with maxValueDepth 256', () =>
        expect(
            run(
                bytesOf(
                    single(createNode('0', { argument: nestedLists(256) }))
                ),
                V2,
                { limits: { maxValueDepth: 256 } }
            )
        ).resolves.toHaveLength(32))

    it.each(
        REFUSALS.map((refusal): [string, Refusal] => [refusal.title, refusal])
    )('%s', async (_title, { call, code, path, says = '' }) => {
        const error = await refusalOf(call)
        expect(error).toBeInstanceOf(TxHashingError)
        expect(error).toMatchObject({
            code,
            message: expect.stringContaining(says),
        })
        expect((error as TxHashingError).path).toBe(path)
    })
})

it('exports only the public API', async () =>
    expect(Object.keys(await import('../index.js')).sort()).toEqual([
        'DEFAULT_LIMITS',
        'TxHashingError',
        'computePreparedTransactionHash',
    ]))
