// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { PreparedTransaction } from '@canton-network/core-ledger-proto'
import { fromBase64 } from '../bytes.js'
import type { TxHashingErrorCode } from '../errors.js'
import { MAX_VALUE_DEPTH } from '../hash.js'
import { computePreparedTransactionHash, type HashingScheme } from '../index.js'
import { createNode, int64, record, single } from './helpers/builders.js'
import { toHex } from './helpers/hex.js'
import { int64sBeyond2To53 } from './helpers/int64.js'
import {
    loadVectors,
    V2,
    V3,
    vectorFiles,
    type Vector,
    type VectorFile,
} from './helpers/load-vectors.js'

function required<T>(value: T | undefined, what: string): T {
    if (value === undefined) throw new Error(`${what} is missing`)
    return value
}

/** The package must give the hash the vector expects, or refuse with its error code. */
async function runVector(v: Vector): Promise<void> {
    // Called only once a branch is chosen, so that a rejection always has a handler
    const compute = () =>
        computePreparedTransactionHash(
            v.preparedTransaction,
            // A reject vector may name a scheme the package does not know
            v.scheme as HashingScheme,
            { limits: v.limits }
        )
    if ('error' in v.expected) {
        await expect(compute()).rejects.toMatchObject({
            code: v.expected.error,
        })
    } else {
        expect(toHex(await compute())).toBe(v.expected.hash)
    }
}

// A loop rather than describe.each, whose $id would cut long ids to 40 characters.
// The title copes with a malformed file, so that the file still runs and the
// check for well formed files below can say what is wrong with it.
for (const v of loadVectors()) {
    const expected: unknown = v.expected
    describe(`${v.kind} ${v.id}`, () => {
        it(
            isObject(expected) && 'error' in expected
                ? `is refused with ${String(expected.error)}`
                : 'hashes to the expected hash',
            () => runVector(v)
        )
    })
}

describe('the corpus', () => {
    const vectors = loadVectors()

    it('has at least 20 accepted V2, 20 accepted V3 and 20 mutation or reject vectors', () => {
        const count = (kind: Vector['kind'], scheme?: string) =>
            vectors.filter(
                (v) =>
                    v.kind === kind &&
                    (scheme === undefined || v.scheme === scheme)
            ).length

        expect(count('accepted', V2)).toBeGreaterThanOrEqual(20)
        expect(count('accepted', V3)).toBeGreaterThanOrEqual(20)
        expect(count('mutation') + count('reject')).toBeGreaterThanOrEqual(20)
    })

    it('has a reject vector for each error code, and held-out vectors', () => {
        const refused = new Set<string>(
            vectors.flatMap((v) =>
                v.kind === 'reject' ? [v.expected.error] : []
            )
        )

        expect(
            Object.keys(ERROR_CODES).filter((code) => !refused.has(code))
        ).toEqual([])
        expect(vectors.filter((v) => v.kind === 'held-out')).not.toEqual([])
    })
})

describe('running a vector', () => {
    // The default limits hash v3-rollback, which has four nodes; maxNodes 3 refuses it
    const rollback = required(
        loadVectors().flatMap((v) =>
            v.kind === 'accepted' && v.id === 'v3-rollback' ? [v] : []
        )[0],
        'v3-rollback'
    )
    const tooManyNodes: Vector = {
        ...rollback,
        id: 'reject-too-many-nodes',
        kind: 'reject',
        expected: { error: 'NODE_LIMIT_EXCEEDED' },
        limits: { maxNodes: 3 },
        source: { from: rollback.id, mutation: 'maxNodes 3' },
    }

    it('passes the limits of a reject vector to the package', () =>
        runVector(tooManyNodes))

    it('fails a reject vector whose transaction the package hashes', async () => {
        const { limits: _limits, ...withoutLimits } = tooManyNodes
        await expect(runVector(withoutLimits)).rejects.toThrow()
    })

    it('fails a reject vector whose error code is not the one raised', async () => {
        await expect(
            runVector({ ...tooManyNodes, expected: { error: 'CYCLE' } })
        ).rejects.toThrow()
    })

    it('fails a vector whose expected hash is not the hash', async () => {
        await expect(
            runVector({ ...rollback, expected: { hash: '00'.repeat(32) } })
        ).rejects.toThrow()
    })
})

/** What each folder of vectors/ holds: the kind and the schemes, any if none are named */
const FOLDERS = new Map<string, { kind: Vector['kind']; schemes?: string[] }>([
    ['v2', { kind: 'accepted', schemes: [V2] }],
    ['v3', { kind: 'accepted', schemes: [V3] }],
    ['mutation', { kind: 'mutation', schemes: [V2, V3] }],
    ['reject', { kind: 'reject' }],
    ['held-out', { kind: 'held-out', schemes: [V3] }],
])

// A record over the union, so that a code added to or removed from it fails to compile here
const ERROR_CODES: Record<TxHashingErrorCode, true> = {
    DECODE_FAILED: true,
    UNKNOWN_FIELD: true,
    UNSUPPORTED_SCHEME: true,
    UNSUPPORTED_NODE_VERSION: true,
    UNSUPPORTED_LF_VERSION: true,
    FIELD_NOT_COVERED_BY_SCHEME: true,
    MISSING_FIELD: true,
    MISSING_NODE_SEED: true,
    DUPLICATE_NODE_SEED: true,
    INVALID_NODE_ID: true,
    DUPLICATE_NODE_ID: true,
    DANGLING_NODE_REFERENCE: true,
    SHARED_CHILD: true,
    CYCLE: true,
    ORPHAN_NODE: true,
    NODE_LIMIT_EXCEEDED: true,
    DEPTH_LIMIT_EXCEEDED: true,
    INVALID_HEX: true,
    INVALID_VALUE: true,
}

/** The only errors a vector may carry limits for, and the limits that can cause each */
const LIMITS_OF = new Map<string, string[]>([
    ['NODE_LIMIT_EXCEEDED', ['maxNodes']],
    ['DEPTH_LIMIT_EXCEEDED', ['maxNodeDepth', 'maxValueDepth']],
])

const REQUIRED = [
    'id',
    'kind',
    'scheme',
    'preparedTransaction',
    'expected',
    'source',
]
const CAPTURED = '{ canton, protocolVersion, scenario }'
const EDITED = '{ from, mutation }'

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const hasOnly = (object: Record<string, unknown>, keys: string[]) =>
    Object.keys(object).sort().join() === [...keys].sort().join()

const isText = (value: unknown) => typeof value === 'string' && value !== ''

// Canonical is what btoa writes: padded, no whitespace, unused trailing bits
// zero. atob also reads other spellings of the same bytes, and so may the
// decoder of another language.
function base64Problem(value: string): string | undefined {
    try {
        return btoa(atob(value)) === value
            ? undefined
            : 'is not in canonical form (padded, unused bits zero)'
    } catch {
        return 'is not base64'
    }
}

/**
 * V2 vectors are also run against hashers that read an int64 with parseInt,
 * which rounds beyond 2^53, so no V2 vector may hold such a value.
 */
function int64Problems(base64: string): string[] {
    let message: PreparedTransaction
    try {
        message = PreparedTransaction.fromBinary(fromBase64(base64))
    } catch {
        return ['preparedTransaction is not a prepared transaction']
    }
    return [...new Set(int64sBeyond2To53(message))].map(
        (value) => `holds the int64 ${value}, beyond 2^53`
    )
}

const nameOf = (path: string) =>
    path.slice(path.lastIndexOf('/') + 1, -'.json'.length)

/** What is wrong with `file`, given all the files, which ids and `source.from` refer to */
function problemsOf(file: VectorFile, files: readonly VectorFile[]): string[] {
    const found: string[] = []
    const problem = (text: string) => found.push(`${file.path}: ${text}`)
    const parts = /^([^/]+)\/([^/]+)\.json$/.exec(file.path)
    const folder = FOLDERS.get(parts?.[1] ?? '')
    if (parts === null || folder === undefined) {
        problem('is not <folder>/<id>.json in a folder the README lists')
        return found
    }
    const [, folderName, name] = parts
    const v = file.json
    if (!isObject(v)) {
        problem('is not a JSON object')
        return found
    }

    for (const key of Object.keys(v)) {
        if (![...REQUIRED, 'limits'].includes(key)) {
            problem(`has the unknown field ${key}`)
        }
    }
    for (const key of REQUIRED) {
        if (!(key in v)) problem(`lacks the field ${key}`)
    }
    if (v.id !== name) {
        problem(`has the id ${JSON.stringify(v.id)}, not the file name ${name}`)
    }
    if (files.some((f) => f !== file && nameOf(f.path) === name)) {
        problem('shares its id with another file')
    }
    if (v.kind !== folder.kind) {
        problem(
            `has the kind ${JSON.stringify(v.kind)}, but ${folderName}/ holds ${folder.kind}`
        )
    }
    if (typeof v.scheme !== 'string' || v.scheme === '') {
        problem('scheme is not a name')
    } else if (!(folder.schemes ?? [v.scheme]).includes(v.scheme)) {
        problem(`scheme ${v.scheme} does not belong in ${folderName}/`)
    }
    if (typeof v.preparedTransaction !== 'string') {
        problem('preparedTransaction is not a string')
    } else {
        const base64 = base64Problem(v.preparedTransaction)
        if (base64 !== undefined) {
            problem(`preparedTransaction ${base64}`)
        } else if (folderName === 'v2') {
            for (const text of int64Problems(v.preparedTransaction)) {
                problem(text)
            }
        }
    }

    const expected = v.expected
    const field = folder.kind === 'reject' ? 'error' : 'hash'
    if (!isObject(expected) || !hasOnly(expected, [field])) {
        problem(`expected is not { ${field} }`)
    } else if (field === 'error') {
        if (
            typeof expected.error !== 'string' ||
            !Object.hasOwn(ERROR_CODES, expected.error)
        ) {
            problem('expected.error is not an error code')
        }
    } else if (
        typeof expected.hash !== 'string' ||
        !/^[0-9a-f]{64}$/.test(expected.hash)
    ) {
        problem('expected.hash is not 64 lowercase hex digits')
    }

    if ('limits' in v) {
        const code = isObject(expected) ? expected.error : undefined
        const causes =
            typeof code === 'string' ? LIMITS_OF.get(code) : undefined
        if (causes === undefined) {
            problem('has limits, which only a reject vector for a limit has')
        } else if (!isObject(v.limits) || Object.keys(v.limits).length === 0) {
            problem('limits is not an object with a limit in it')
        } else {
            for (const [limit, value] of Object.entries(v.limits)) {
                if (!causes.includes(limit)) {
                    problem(`limits.${limit} cannot cause ${String(code)}`)
                } else if (
                    typeof value !== 'number' ||
                    !Number.isInteger(value) ||
                    value < 1
                ) {
                    problem(`limits.${limit} is not an integer of at least 1`)
                } else if (
                    limit === 'maxValueDepth' &&
                    value > MAX_VALUE_DEPTH
                ) {
                    problem(`limits.maxValueDepth is above ${MAX_VALUE_DEPTH}`)
                }
            }
        }
    }

    const source = v.source
    const captured =
        isObject(source) &&
        hasOnly(source, ['canton', 'protocolVersion', 'scenario']) &&
        isText(source.canton) &&
        Number.isInteger(source.protocolVersion) &&
        isText(source.scenario)
    const edited =
        isObject(source) &&
        hasOnly(source, ['from', 'mutation']) &&
        isText(source.from) &&
        isText(source.mutation)
    if (folder.kind === 'mutation') {
        if (!edited) problem(`source is not ${EDITED}`)
    } else if (folder.kind === 'reject') {
        if (!(captured || edited)) {
            problem(`source is not ${CAPTURED} or ${EDITED}`)
        }
    } else if (!captured) {
        problem(`source is not ${CAPTURED}`)
    }
    if (edited) {
        const from = String(source.from)
        if (from === name || !files.some((f) => nameOf(f.path) === from)) {
            problem(`source.from ${from} is not another vector`)
        }
    }
    return found
}

describe('vector files', () => {
    const files = vectorFiles()

    it('every vector file is well formed', () => {
        expect(files.flatMap((file) => problemsOf(file, files))).toEqual([])
    })

    describe('the check of a file', () => {
        const sample = required(
            files.find(({ path }) => path === 'v3/v3-create-plain.json'),
            'v3/v3-create-plain.json'
        )

        /** The sample at `path`, with `change` applied and the fields in `omit` removed */
        function derived(
            path: string,
            change: Record<string, unknown> = {},
            omit: string[] = []
        ): VectorFile {
            const json: Record<string, unknown> = {
                ...(sample.json as Record<string, unknown>),
                id: nameOf(path),
                ...change,
            }
            for (const key of omit) delete json[key]
            return { path, json }
        }

        const edit = { from: 'v3-create-plain', mutation: 'one byte' }
        const base64 = (message: PreparedTransaction) =>
            btoa(String.fromCharCode(...PreparedTransaction.toBinary(message)))
        const holding = (...values: string[]) =>
            record(values.map((value, i) => [`n${i}`, int64(value)]))
        const hash = { hash: '00'.repeat(32) }
        const nodeLimit = {
            kind: 'reject',
            expected: { error: 'NODE_LIMIT_EXCEEDED' },
            source: edit,
        }

        it.each([
            [
                'an id that is not the file name',
                derived('v3/v3-other.json', { id: 'v3-create-plain' }),
                'not the file name v3-other',
            ],
            [
                'an id that another file has',
                derived('v2/v3-create-plain.json', { scheme: V2 }),
                'shares its id with another file',
            ],
            [
                'a file outside the folders of the README',
                derived('extra/v3-extra.json'),
                'in a folder the README lists',
            ],
            [
                'a file that holds a JSON array, not an object',
                { path: 'v3/v3-array.json', json: [] },
                'is not a JSON object',
            ],
            [
                'a kind that its folder does not hold',
                derived('reject/reject-kind.json'),
                'but reject/ holds reject',
            ],
            [
                'a scheme that is not a name',
                derived('v3/v3-no-scheme.json', { scheme: '' }),
                'scheme is not a name',
            ],
            [
                'a scheme that its folder does not hold',
                derived('held-out/held-out-v2.json', {
                    kind: 'held-out',
                    scheme: V2,
                }),
                'scheme HASHING_SCHEME_VERSION_V2 does not belong in held-out/',
            ],
            [
                'a field the format does not have',
                derived('v3/v3-extra-field.json', { note: 'x' }),
                'the unknown field note',
            ],
            [
                'a missing field',
                derived('v3/v3-no-source.json', {}, ['source']),
                'lacks the field source',
            ],
            [
                'bytes that are not a string',
                derived('v3/v3-number.json', { preparedTransaction: 42 }),
                'preparedTransaction is not a string',
            ],
            [
                'bytes that are not base64',
                derived('v3/v3-bad-bytes.json', {
                    preparedTransaction: 'not base64!',
                }),
                'preparedTransaction is not base64',
            ],
            [
                'bytes in base64 that is not canonical',
                derived('v3/v3-loose-bytes.json', {
                    preparedTransaction: 'AB==',
                }),
                'preparedTransaction is not in canonical form',
            ],
            [
                'an accepted vector that expects an error as well as a hash',
                derived('v3/v3-both.json', {
                    expected: { ...hash, error: 'CYCLE' },
                }),
                'expected is not { hash }',
            ],
            [
                'a hash in upper case',
                derived('v3/v3-upper.json', {
                    expected: { hash: 'AB'.repeat(32) },
                }),
                'expected.hash is not 64 lowercase hex digits',
            ],
            [
                'an expected error that is not a code',
                derived('reject/reject-code.json', {
                    ...nodeLimit,
                    expected: { error: 'TOO_MANY' },
                }),
                'expected.error is not an error code',
            ],
            [
                'limits in an accepted vector',
                derived('v3/v3-limits.json', { limits: { maxNodes: 2 } }),
                'only a reject vector for a limit has',
            ],
            [
                'limits without a limit in them',
                derived('reject/reject-no-limit.json', {
                    ...nodeLimit,
                    limits: {},
                }),
                'limits is not an object with a limit in it',
            ],
            [
                'a limit that cannot cause the error',
                derived('reject/reject-limit.json', {
                    ...nodeLimit,
                    limits: { maxNodeDepth: 2 },
                }),
                'limits.maxNodeDepth cannot cause NODE_LIMIT_EXCEEDED',
            ],
            [
                'a limit that is not a positive integer',
                derived('reject/reject-zero.json', {
                    ...nodeLimit,
                    limits: { maxNodes: 0 },
                }),
                'limits.maxNodes is not an integer of at least 1',
            ],
            [
                'a maxValueDepth that the package refuses',
                derived('reject/reject-deep.json', {
                    ...nodeLimit,
                    expected: { error: 'DEPTH_LIMIT_EXCEEDED' },
                    limits: { maxValueDepth: MAX_VALUE_DEPTH + 1 },
                }),
                `limits.maxValueDepth is above ${MAX_VALUE_DEPTH}`,
            ],
            [
                'a mutation of a vector that does not exist',
                derived('mutation/mutation-from.json', {
                    kind: 'mutation',
                    expected: hash,
                    source: { from: 'v3-nothing', mutation: 'one byte' },
                }),
                'source.from v3-nothing is not another vector',
            ],
            [
                'a mutation of itself',
                derived('mutation/mutation-self.json', {
                    kind: 'mutation',
                    expected: hash,
                    source: { from: 'mutation-self', mutation: 'one byte' },
                }),
                'source.from mutation-self is not another vector',
            ],
            [
                'a reject vector whose source is neither a capture nor an edit',
                derived('reject/reject-source.json', {
                    ...nodeLimit,
                    source: { from: 'v3-create-plain' },
                }),
                `source is not ${CAPTURED} or ${EDITED}`,
            ],
            [
                'a mutation vector with the source of a capture',
                derived('mutation/mutation-source.json', { kind: 'mutation' }),
                'source is not { from, mutation }',
            ],
            [
                'an accepted vector with the source of a mutation',
                derived('v3/v3-edited.json', { source: edit }),
                'source is not { canton, protocolVersion, scenario }',
            ],
            [
                'bytes in a V2 vector that are not a prepared transaction',
                derived('v2/v2-garbage.json', {
                    scheme: V2,
                    preparedTransaction: 'AAAA',
                }),
                'preparedTransaction is not a prepared transaction',
            ],
        ])('reports %s', (_what, file, problem) =>
            expect(problemsOf(file, [...files, file]).join('\n')).toContain(
                problem
            )
        )

        it('reports int64 values beyond 2^53 and -2^53 in a V2 vector, and takes 2^53 and -2^53', () => {
            const holdingInV2 = (path: string, ...values: string[]) =>
                derived(path, {
                    scheme: V2,
                    preparedTransaction: base64(
                        single(
                            createNode('0', { argument: holding(...values) })
                        )
                    ),
                })
            const beyond = holdingInV2(
                'v2/v2-beyond.json',
                '9007199254740993',
                '-9007199254740993'
            )
            const edge = holdingInV2(
                'v2/v2-edge.json',
                '9007199254740992',
                '-9007199254740992'
            )

            expect(problemsOf(beyond, [...files, beyond])).toEqual([
                'v2/v2-beyond.json: holds the int64 9007199254740993, beyond 2^53',
                'v2/v2-beyond.json: holds the int64 -9007199254740993, beyond 2^53',
            ])
            expect(problemsOf(edge, [...files, edge])).toEqual([])
        })
    })
})
