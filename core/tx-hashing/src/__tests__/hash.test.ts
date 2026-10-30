// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, onTestFinished, vi } from 'vitest'
import {
    Exercise,
    HashingSchemeVersion,
    PreparedTransaction,
    type DamlTransaction_Node,
} from '@canton-network/core-ledger-proto'
import { concat, fromBase64 } from '../bytes.js'
import { TxHashingError, type TxHashingErrorCode } from '../errors.js'
import {
    computePreparedTransactionHash,
    type HashingScheme,
    type HashOptions,
} from '../hash.js'
import type { TraversalLimits } from '../limits.js'
import {
    chain,
    create,
    createNode,
    exercise,
    exerciseNode,
    metadata,
    nestedLists,
    prepared,
    seed,
    single,
    text,
    tx,
} from './helpers/builders.js'
import { toHex } from './helpers/hex.js'
import { liveFixtures } from './helpers/live-fixtures.js'
import { V2, V3 } from './helpers/load-vectors.js'

/** The public function as JavaScript may call it, with any values at all */
const run = (input: unknown, scheme: unknown, options?: unknown) =>
    computePreparedTransactionHash(
        input as Uint8Array,
        scheme as HashingScheme,
        options as HashOptions
    )

const [V2_FIXTURE] = liveFixtures(V2)

// A transaction whose exercise node ends with field 99, a varint of 1 that the
// bindings do not know. Decoding keeps the field on the exercise object, and
// encoding writes it back inside the exercise.
const WITH_FIELD_99 = PreparedTransaction.toBinary(
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

const EXERCISE_WITH_CHILD = prepared(
    tx(['0'], [exerciseNode('0', ['1']), createNode('1')], [seed(0), seed(1)])
)

/** An input just beyond one default limit, and how it must be refused */
interface BeyondDefault {
    limit: keyof TraversalLimits
    input: PreparedTransaction
    code: TxHashingErrorCode
    path: string
    says: string
}

const VALUE_BEYOND_DEFAULT: BeyondDefault = {
    limit: 'maxValueDepth',
    input: single(createNode('0', { argument: nestedLists(102) })),
    code: 'DEPTH_LIMIT_EXCEEDED',
    path: `transaction.nodes[0].v1.create.argument${'.list.elements[0]'.repeat(101)}`,
    says: 'value is nested deeper than 101 levels',
}

const BEYOND_DEFAULTS: BeyondDefault[] = [
    {
        limit: 'maxNodes',
        input: prepared(
            tx(
                ['0'],
                Array.from({ length: 10_001 }, (_node, i) =>
                    createNode(String(i))
                )
            )
        ),
        code: 'NODE_LIMIT_EXCEEDED',
        path: 'transaction.nodes',
        says: 'transaction has 10001 nodes, the limit is 10000',
    },
    {
        limit: 'maxNodeDepth',
        input: chain(101),
        code: 'DEPTH_LIMIT_EXCEEDED',
        path: 'transaction.nodes[99].v1.exercise.children[0]',
        says: 'nodes are nested deeper than 100 levels',
    },
    VALUE_BEYOND_DEFAULT,
]

/**
 * A create node whose `member` throws `thrown` when read. Encoding reads the
 * create member; only the comparison reads the exercise member.
 */
function createThrowingOn(
    member: 'create' | 'exercise',
    thrown: unknown
): DamlTransaction_Node {
    const nodeType = { oneofKind: 'create' as const, create: create() }
    Object.defineProperty(nodeType, member, {
        get() {
            throw thrown
        },
    })
    return { nodeId: '0', versionedNode: { oneofKind: 'v1', v1: { nodeType } } }
}

/** Valid transaction bytes, in a view whose buffer has been transferred away */
function transferred(byteOffset: number): Uint8Array {
    const bytes = fromBase64(V2_FIXTURE.base64)
    const pool = new ArrayBuffer(bytes.length + byteOffset)
    const view = new Uint8Array(pool, byteOffset, bytes.length)
    view.set(bytes)
    structuredClone(pool, { transfer: [pool] })
    return view
}

const EMPTY = 'input is empty, or its buffer was detached or shrunk'

/** The Uint8Array of another realm: a vm context in Node, an iframe in the browser */
async function foreignUint8Array(): Promise<Uint8ArrayConstructor> {
    if (typeof document === 'undefined') {
        const { runInNewContext } = await import('node:vm')
        return runInNewContext('Uint8Array') as Uint8ArrayConstructor
    }
    const iframe = document.createElement('iframe')
    document.body.append(iframe)
    onTestFinished(() => iframe.remove())
    return (iframe.contentWindow as unknown as typeof globalThis).Uint8Array
}

/** A call that must be refused, and the error it must be refused with */
interface Refusal {
    title: string
    call: () => Promise<Uint8Array>
    code: TxHashingErrorCode
    path?: string
    /** Text the message must contain */
    says?: string
}

// Every refusal in this file. Each must be a TxHashingError with its code, path and message
const REFUSALS: Refusal[] = [
    ...[4, 0, 1, 'V3', 'HASHING_SCHEME_VERSION_V4'].map((scheme): Refusal => ({
        title: `rejects scheme ${JSON.stringify(scheme)}`,
        call: () => run(V2_FIXTURE.base64, scheme),
        code: 'UNSUPPORTED_SCHEME',
        says: `scheme ${JSON.stringify(scheme)} is not supported`,
    })),
    {
        title: 'rejects a missing scheme',
        call: () => run(V2_FIXTURE.base64, undefined),
        code: 'UNSUPPORTED_SCHEME',
        says: 'scheme of type undefined is not supported',
    },
    {
        title: 'shows only the first 40 characters of a long scheme',
        call: () => run(V2_FIXTURE.base64, V2_FIXTURE.base64),
        code: 'UNSUPPORTED_SCHEME',
        says: `scheme ${JSON.stringify(V2_FIXTURE.base64.slice(0, 40))}... is not supported`,
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
    ...['-_-_', 'not base64!', ''].map((input): Refusal => ({
        title: `rejects input ${JSON.stringify(input)}`,
        call: () => run(input, V2),
        code: 'DECODE_FAILED',
    })),
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
            [
                'an ArrayBuffer',
                (bytes: Uint8Array) => bytes.buffer,
                'ArrayBuffer',
            ],
            [
                'a DataView',
                (bytes: Uint8Array) => new DataView(bytes.buffer),
                'DataView',
            ],
            [
                'an Int8Array',
                (bytes: Uint8Array) => new Int8Array(bytes.buffer),
                'Int8Array',
            ],
            // A browser without cross-origin isolation has no SharedArrayBuffer
            ...(typeof SharedArrayBuffer === 'function'
                ? ([
                      [
                          'a SharedArrayBuffer',
                          (bytes: Uint8Array) => {
                              const shared = new SharedArrayBuffer(bytes.length)
                              new Uint8Array(shared).set(bytes)
                              return shared
                          },
                          'SharedArrayBuffer',
                      ],
                  ] as const)
                : []),
        ] as const
    ).map(([what, wrap, type]): Refusal => ({
        title: `rejects ${what} as input, though its bytes are a valid transaction`,
        call: () => run(wrap(fromBase64(V2_FIXTURE.base64)), V2),
        code: 'DECODE_FAILED',
        says: `must be a Uint8Array, not ${type}`,
    })),
    {
        title: 'rejects a Uint8Array whose buffer was transferred',
        call: () => run(transferred(0), V2),
        code: 'DECODE_FAILED',
        says: EMPTY,
    },
    {
        title: 'rejects a Uint8Array at a byteOffset whose buffer was transferred',
        call: () => run(transferred(8), V2),
        code: 'DECODE_FAILED',
        says: EMPTY,
    },
    // Resizable buffers are recent: ES2024
    ...('resize' in ArrayBuffer.prototype
        ? [
              {
                  title: 'rejects a Uint8Array over a resizable buffer shrunk past it',
                  call: () => {
                      const bytes = fromBase64(V2_FIXTURE.base64)
                      const buffer = new ArrayBuffer(bytes.length + 8, {
                          maxByteLength: bytes.length + 8,
                      })
                      const view = new Uint8Array(buffer, 8, bytes.length)
                      view.set(bytes)
                      buffer.resize(4)
                      return run(view, V2)
                  },
                  code: 'DECODE_FAILED' as const,
                  says: EMPTY,
              },
          ]
        : []),
    {
        title: 'takes an object that only claims to be a Uint8Array for a message',
        call: () => run({ [Symbol.toStringTag]: 'Uint8Array' }, V2),
        code: 'MISSING_FIELD',
        path: 'transaction',
    },
    {
        title: 'takes an object whose type tag throws for a message, without reading the tag',
        call: () =>
            run(
                {
                    get [Symbol.toStringTag]() {
                        throw new Error('the type tag was read')
                    },
                },
                V2
            ),
        code: 'MISSING_FIELD',
        path: 'transaction',
    },
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
        title: 'rejects an unknown field in a decoded message object',
        call: () => run(PreparedTransaction.fromBinary(WITH_FIELD_99), V2),
        code: 'UNKNOWN_FIELD',
        says: FIELD_99,
    },
    {
        title: 'rejects a message object with a lone surrogate, which protobuf would encode as U+FFFD',
        call: () =>
            run(single(createNode('0', { argument: text('\ud800') })), V2),
        code: 'INVALID_VALUE',
    },
    {
        title: 'rejects a message object with a value protobuf cannot encode',
        call: () =>
            run(single(createNode('0'), metadata({ mediatorGroup: -1 })), V2),
        code: 'INVALID_VALUE',
    },
    {
        title: 'rejects a message object that throws while it is compared with its encoding',
        call: () =>
            run(
                single(
                    createThrowingOn(
                        'exercise',
                        new TypeError('the exercise member cannot be read')
                    )
                ),
                V2
            ),
        code: 'INVALID_VALUE',
        says: 'cannot be compared with its encoding',
    },
    ...(
        [
            ['encoded', 'create', 'cannot be encoded as protobuf'],
            [
                'compared with its encoding',
                'exercise',
                'cannot be compared with its encoding',
            ],
        ] as const
    ).map(([step, member, says]): Refusal => ({
        title: `rejects a message object that, while it is ${step}, throws a value String() cannot convert`,
        call: () =>
            run(single(createThrowingOn(member, Object.create(null))), V2),
        code: 'INVALID_VALUE',
        says: `${says}: a value that has no text`,
    })),
    {
        title: 'rejects a prepared transaction without metadata',
        call: () =>
            run({ transaction: tx(['0'], [createNode('0')], [seed(0)]) }, V2),
        code: 'MISSING_FIELD',
        path: 'metadata',
    },
    {
        title: 'rejects a prepared transaction without transaction',
        call: () => run({ metadata: metadata() }, V2),
        code: 'MISSING_FIELD',
        path: 'transaction',
    },
    {
        title: 'rejects a transaction without roots',
        call: () => run(prepared(tx([], [])), V2),
        code: 'MISSING_FIELD',
        path: 'transaction.roots',
    },
    {
        title: 'rejects more nodes than options.limits.maxNodes',
        call: () => run(EXERCISE_WITH_CHILD, V2, { limits: { maxNodes: 1 } }),
        code: 'NODE_LIMIT_EXCEEDED',
        path: 'transaction.nodes',
    },
    {
        title: 'rejects nodes nested deeper than options.limits.maxNodeDepth',
        call: () =>
            run(EXERCISE_WITH_CHILD, V2, { limits: { maxNodeDepth: 1 } }),
        code: 'DEPTH_LIMIT_EXCEEDED',
        path: 'transaction.nodes[0].v1.exercise.children[0]',
    },
    {
        title: 'rejects a value nested deeper than options.limits.maxValueDepth',
        call: () =>
            run(single(createNode('0', { argument: nestedLists(2) })), V2, {
                limits: { maxValueDepth: 1 },
            }),
        code: 'DEPTH_LIMIT_EXCEEDED',
        path: 'transaction.nodes[0].v1.create.argument.list.elements[0]',
    },
    ...BEYOND_DEFAULTS.flatMap(({ limit, input, ...refused }): Refusal[] => [
        {
            title: `applies the default ${limit} when no options are given`,
            call: () => run(input, V2),
            ...refused,
        },
        {
            title: `applies the default ${limit} to a limit given as undefined`,
            call: () => run(input, V2, { limits: { [limit]: undefined } }),
            ...refused,
        },
    ]),
    {
        title: 'applies the default limits to limits given as undefined, which the options type allows',
        // Typed, without a cast: under exactOptionalPropertyTypes this compiles
        // only because HashOptions.limits allows undefined
        call: () =>
            computePreparedTransactionHash(VALUE_BEYOND_DEFAULT.input, V2, {
                limits: undefined,
            }),
        code: VALUE_BEYOND_DEFAULT.code,
        path: VALUE_BEYOND_DEFAULT.path,
        says: VALUE_BEYOND_DEFAULT.says,
    },
]

/** The error a call is refused with. Fails if the call is not refused. */
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
        it.each(liveFixtures(name))(
            'returns the participant hash of $scenario for base64, bytes and a decoded message',
            async ({ base64, tx: message, hashHex }) => {
                const hashes = await Promise.all([
                    computePreparedTransactionHash(base64, scheme),
                    computePreparedTransactionHash(fromBase64(base64), scheme),
                    computePreparedTransactionHash(message, scheme),
                ])
                expect(hashes.map(toHex)).toEqual([hashHex, hashHex, hashHex])
            }
        )
    })

    it('hashes a Buffer view with non-zero byteOffset like base64', async () => {
        const { base64, hashHex } = V2_FIXTURE
        const bytes = fromBase64(base64)
        // Buffer.from(base64, 'base64') returns such a view into a larger
        // pool. The browser has no Buffer, so there the view is a Uint8Array.
        const pool = new Uint8Array(bytes.length + 16).fill(0xff)
        pool.set(bytes, 8)
        const view =
            typeof Buffer === 'undefined'
                ? new Uint8Array(pool.buffer, 8, bytes.length)
                : Buffer.from(pool.buffer, 8, bytes.length)

        const hashes = await Promise.all([run(view, V2), run(base64, V2)])
        expect(hashes.map(toHex)).toEqual([hashHex, hashHex])
    })

    it('hashes a Uint8Array from another realm, which instanceof does not recognize', async () => {
        const Foreign = await foreignUint8Array()
        const bytes = Foreign.from(fromBase64(V2_FIXTURE.base64))
        expect(bytes).not.toBeInstanceOf(Uint8Array)

        expect(toHex(await run(bytes, V2))).toBe(V2_FIXTURE.hashHex)
    })

    it('reads a Uint8Array by its internal slots, not through accessors defined on it', async () => {
        const bytes = fromBase64(V2_FIXTURE.base64)
        for (const key of [
            'length',
            'byteLength',
            'byteOffset',
            'buffer',
            Symbol.toStringTag,
        ]) {
            Object.defineProperty(bytes, key, {
                get() {
                    throw new Error(`${String(key)} was read`)
                },
            })
        }

        expect(toHex(await run(bytes, V2))).toBe(V2_FIXTURE.hashHex)
    })

    it('hashes the input as it was at the call, though the caller changes it before the hash is done', async () => {
        // The metadata is hashed after the nodes, so after the changes below.
        // Here it has an input contract with a key, whose hash is bytes.
        const [{ base64, hashHex }] = liveFixtures(V3).filter(
            (fixture) => fixture.scenario === 'lookup-by-key-found'
        )
        const bytes = fromBase64(base64)
        const message = PreparedTransaction.fromBinary(fromBase64(base64))

        const hashes = Promise.all([run(bytes, V3), run(message, V3)])
        bytes.fill(0)
        message.metadata!.preparationTime += 1n

        expect((await hashes).map(toHex)).toEqual([hashHex, hashHex])
    })

    it('decodes and encodes no value of bytes before the call returns, so not on top of the stack that the caller has used', async () => {
        // Decoding and encoding a value recurse once per level, so they need
        // the most stack at the innermost of 256 levels, whose text goes
        // through TextDecoder.decode and TextEncoder.encode. The input is
        // bytes: a message object is encoded and decoded at the call.
        const innermost = 'innermost'
        const bytes = PreparedTransaction.toBinary(
            single(
                createNode('0', {
                    argument: nestedLists(256, text(innermost)),
                })
            )
        )
        const decode = vi.spyOn(TextDecoder.prototype, 'decode')
        const encode = vi.spyOn(TextEncoder.prototype, 'encode')
        onTestFinished(() => {
            decode.mockRestore()
            encode.mockRestore()
        })
        const decoded = () =>
            decode.mock.results.some(({ value }) => value === innermost)
        const encoded = () =>
            encode.mock.calls.some(([string]) => string === innermost)

        const hash = run(bytes, V2, { limits: { maxValueDepth: 256 } })
        expect(
            decoded(),
            'the innermost text was decoded during the call'
        ).toBe(false)
        expect(
            encoded(),
            'the innermost text was encoded during the call'
        ).toBe(false)

        expect(await hash).toHaveLength(32)
        expect(decoded(), 'the innermost text was never decoded').toBe(true)
        expect(encoded(), 'the innermost text was never encoded').toBe(true)
    })

    it('returns a new 32-byte array on each call, which the caller may change', async () => {
        const first = await run(V2_FIXTURE.base64, V2)
        first.fill(0)
        const second = await run(V2_FIXTURE.base64, V2)

        expect(toHex(second)).toBe(V2_FIXTURE.hashHex)
        expect(second.buffer.byteLength).toBe(32)
    })

    it('returns a hash typed for crypto.subtle.sign, which signs it without a copy', async () => {
        const { privateKey, publicKey } = await crypto.subtle.generateKey(
            'Ed25519',
            false,
            ['sign', 'verify']
        )
        const hash = await computePreparedTransactionHash(V2_FIXTURE.base64, V2)

        // Compiles only because the hash is typed as a view of an
        // ArrayBuffer, which is a BufferSource
        const signature = await crypto.subtle.sign('Ed25519', privateKey, hash)

        expect(
            await crypto.subtle.verify('Ed25519', publicKey, signature, hash)
        ).toBe(true)
    })

    it('hashes a value nested 256 levels deep, the most maxValueDepth allows', () =>
        expect(
            run(single(createNode('0', { argument: nestedLists(256) })), V2, {
                limits: { maxValueDepth: 256 },
            })
        ).resolves.toHaveLength(32))

    // A loop rather than it.each, whose $title would cut titles to 40 characters
    for (const { title, call, code, path, says = '' } of REFUSALS) {
        it(title, async () => {
            const error = await refusalOf(call)
            expect(error).toBeInstanceOf(TxHashingError)
            expect(error).toMatchObject({
                code,
                message: expect.stringContaining(says),
            })
            expect((error as TxHashingError).path).toBe(path)
        })
    }
})

it('exports only the public API', async () =>
    expect(Object.keys(await import('../index.js')).sort()).toEqual([
        'DEFAULT_LIMITS',
        'TxHashingError',
        'computePreparedTransactionHash',
    ]))
