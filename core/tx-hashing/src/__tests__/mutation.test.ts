// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, it } from 'vitest'
import { PreparedTransaction } from '@canton-network/core-ledger-proto'
import { fromBase64 } from '../bytes.js'
import { TxHashingError, type TxHashingErrorCode } from '../errors.js'
import { computePreparedTransactionHash } from '../index.js'
import { toHex } from './helpers/hex.js'
import { liveFixtures } from './helpers/live-fixtures.js'
import { loadVectors, V2, V3 } from './helpers/load-vectors.js'
import { changedBytes, changedText, changedTime } from './helpers/one-byte.js'

interface Leaf {
    path: string
    name: string
    value: unknown
    set(value: unknown): void
}

const UNHASHED = new Set(['eventBlob', 'globalKeyMapping'])

const isMessage = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !ArrayBuffer.isView(value)

const join = (path: string, name: string) =>
    path === '' ? name : `${path}.${name}`

function* leavesOf(message: object, path = ''): Generator<Leaf> {
    const fields = message as Record<string, unknown>
    for (const [key, value] of Object.entries(fields)) {
        if (UNHASHED.has(key)) continue
        if (isMessage(value) && 'oneofKind' in value) {
            const member = value.oneofKind
            if (typeof member === 'string') {
                yield* leavesIn(value, member, join(path, member))
            }
        } else {
            yield* leavesIn(fields, key, join(path, key))
        }
    }
}

function* leavesIn(
    owner: object,
    key: string | number,
    path: string
): Generator<Leaf> {
    const fields = owner as Record<string | number, unknown>
    const value = fields[key]
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            yield* leavesIn(value, i, `${path}[${i}]`)
        }
    } else if (isMessage(value)) {
        yield* leavesOf(value, path)
    } else {
        const name = /(\w+)(\[\d+\])?$/.exec(path)![1]
        yield {
            path,
            name,
            value,
            set: (changed) => {
                fields[key] = changed
            },
        }
    }
}

function changed(value: unknown): unknown {
    if (typeof value === 'string') {
        return /[0-9A-Za-z]/.test(value) ? changedText(value) : undefined
    }
    if (typeof value === 'bigint') return changedTime(value)
    if (typeof value === 'number')
        return value % 2 === 0 ? value + 1 : value - 1
    if (typeof value === 'boolean') return !value
    if (value instanceof Uint8Array) {
        return value.length === 0 ? undefined : changedBytes(value)
    }
    throw new Error(`no one-byte change is defined for a ${typeof value}`)
}

const ACCEPTED = ([V2, V3] as const).flatMap((scheme) =>
    liveFixtures(scheme).map((fixture) => ({ scheme, ...fixture }))
)

const FIELD_NAMES = [
    ...new Set(
        ACCEPTED.flatMap(({ tx }) => [...leavesOf(tx)].map(({ name }) => name))
    ),
].sort()

// A byte off "2.1" or "2" is no LF version that a scheme hashes
const REFUSED_AS = new Map<string, TxHashingErrorCode>([
    ['lfVersion', 'UNSUPPORTED_LF_VERSION'],
    ['version', 'UNSUPPORTED_LF_VERSION'],
])

// A changed node id can name another node or none, byKey can become true
// without a key, and a timestamp or a date can leave its range
const MAY_BE_REFUSED = new Set([
    'byKey',
    'children',
    'date',
    'nodeId',
    'roots',
    'timestamp',
])

const titleOf = (name: string) => {
    const refusal = REFUSED_AS.get(name)
    if (refusal !== undefined) {
        return `a one-byte change in any ${name} gives ${refusal}`
    }
    return MAY_BE_REFUSED.has(name)
        ? `a one-byte change in any ${name} gives another hash or a refusal`
        : `a one-byte change in any ${name} gives another hash`
}

// No bytes hold a changed value beyond its type, such as an int64 above 2^63 - 1
function encodedWith(
    message: PreparedTransaction,
    leaf: Leaf,
    value: unknown
): Uint8Array | undefined {
    leaf.set(value)
    try {
        return PreparedTransaction.toBinary(message)
    } catch {
        return undefined
    } finally {
        leaf.set(leaf.value)
    }
}

async function outcomeOf(
    bytes: Uint8Array,
    scheme: typeof V2 | typeof V3
): Promise<{ hash: string } | { error: TxHashingErrorCode }> {
    try {
        return {
            hash: toHex(await computePreparedTransactionHash(bytes, scheme)),
        }
    } catch (error) {
        if (error instanceof TxHashingError) return { error: error.code }
        throw error
    }
}

const unchangedHashes = new Map<PreparedTransaction, string>()

it.each(FIELD_NAMES.map((name): [string, string] => [titleOf(name), name]))(
    '%s',
    async (_title, name) => {
        const refusal = REFUSED_AS.get(name)
        const problems: string[] = []
        let count = 0
        for (const { scheme, scenario, tx } of ACCEPTED) {
            // Not the participant's hash: a hasher that skips the field would
            // differ from it with or without the change
            let unchanged = unchangedHashes.get(tx)
            if (unchanged === undefined) {
                const outcome = await outcomeOf(
                    PreparedTransaction.toBinary(tx),
                    scheme
                )
                if (!('hash' in outcome))
                    throw new Error(`${scenario} is refused`)
                unchanged = outcome.hash
                unchangedHashes.set(tx, unchanged)
            }
            for (const leaf of leavesOf(tx)) {
                if (leaf.name !== name) continue
                const value = changed(leaf.value)
                if (value === undefined) continue
                const bytes = encodedWith(tx, leaf, value)
                if (bytes === undefined) continue
                count++
                const outcome = await outcomeOf(bytes, scheme)
                const expected =
                    refusal !== undefined
                        ? 'error' in outcome && outcome.error === refusal
                        : 'hash' in outcome
                          ? outcome.hash !== unchanged
                          : MAY_BE_REFUSED.has(name)
                if (!expected) {
                    problems.push(
                        `${scheme} ${scenario} ${leaf.path}: ${JSON.stringify(outcome)}`
                    )
                }
            }
        }
        expect(count).toBeGreaterThan(0)
        expect(problems).toEqual([])
    }
)

it('each mutation vector is its source with one byte changed', () => {
    const vectors = loadVectors()
    const accepted = new Map(
        vectors.flatMap((v) =>
            v.kind === 'accepted' ? [[v.id, v] as const] : []
        )
    )
    const mutations = vectors.flatMap((v) => (v.kind === 'mutation' ? [v] : []))
    const problems = mutations.flatMap((mutation) => {
        const source = accepted.get(mutation.source.from)
        if (source === undefined) {
            return [`${mutation.id}: ${mutation.source.from} is not accepted`]
        }
        const found: string[] = []
        const before = fromBase64(source.preparedTransaction)
        const after = fromBase64(mutation.preparedTransaction)
        const differing = before.filter((byte, i) => byte !== after[i]).length
        if (after.length !== before.length) {
            found.push(
                `${mutation.id}: ${after.length} bytes, not ${before.length}`
            )
        } else if (differing !== 1) {
            found.push(`${mutation.id}: ${differing} bytes changed, not 1`)
        }
        if (mutation.scheme !== source.scheme) {
            found.push(
                `${mutation.id}: scheme ${mutation.scheme}, not ${source.scheme}`
            )
        }
        if (mutation.expected.hash === source.expected.hash) {
            found.push(`${mutation.id}: expects the hash of ${source.id}`)
        }
        return found
    })

    expect(mutations.length).toBeGreaterThan(0)
    expect(problems).toEqual([])
})
