// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import type { TxHashingErrorCode } from '../errors.js'
import {
    computePreparedTransactionHash,
    DEFAULT_LIMITS,
    type HashingScheme,
} from '../index.js'
import { toHex } from './helpers/hex.js'
import {
    loadVectors,
    V2,
    V3,
    vectorFiles,
    type Vector,
} from './helpers/load-vectors.js'

// Fails to compile when a code is added to or removed from the union
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

const KIND_OF_FOLDER: Record<string, Vector['kind']> = {
    v2: 'accepted',
    v3: 'accepted',
    'held-out': 'held-out',
    mutation: 'mutation',
    reject: 'reject',
}

const isCanonicalBase64 = (text: string) => {
    try {
        return btoa(atob(text)) === text
    } catch {
        return false
    }
}

it.each(loadVectors().map((v): [string, Vector] => [`${v.kind} ${v.id}`, v]))(
    '%s',
    async (_title, v) => {
        const hash = computePreparedTransactionHash(
            v.preparedTransaction,
            // A reject vector may name a scheme the package does not know
            v.scheme as HashingScheme,
            { limits: v.limits }
        )
        if ('error' in v.expected) {
            await expect(hash).rejects.toMatchObject({ code: v.expected.error })
        } else {
            expect(toHex(await hash)).toBe(v.expected.hash)
        }
    }
)

describe('the corpus', () => {
    it('has a reject vector for each error code, and held-out vectors', () => {
        const vectors = loadVectors()
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

    it('holds only well-formed vector files', () => {
        const files = vectorFiles()
        const ids = files.map(({ path }) =>
            path.slice(path.indexOf('/') + 1, -'.json'.length)
        )
        expect(new Set(ids).size).toBe(ids.length)

        files.forEach(({ path, json }, i) => {
            const v = json as Vector
            const folder = path.slice(0, path.indexOf('/'))
            expect(Object.keys(KIND_OF_FOLDER), path).toContain(folder)
            expect(v.kind, path).toBe(KIND_OF_FOLDER[folder])
            expect(v.id, path).toBe(ids[i])
            expect(v.scheme, path).toBeTypeOf('string')
            if (v.kind !== 'reject') expect([V2, V3], path).toContain(v.scheme)
            expect(isCanonicalBase64(v.preparedTransaction), path).toBe(true)
            if (v.kind === 'reject') {
                expect(Object.keys(v.expected), path).toEqual(['error'])
                expect(Object.keys(ERROR_CODES), path).toContain(
                    v.expected.error
                )
            } else {
                expect(v.expected, path).toEqual({
                    hash: expect.stringMatching(/^[0-9a-f]{64}$/),
                })
            }
            if (v.limits !== undefined) {
                expect(v.kind, path).toBe('reject')
                expect(Object.keys(DEFAULT_LIMITS), path).toEqual(
                    expect.arrayContaining(Object.keys(v.limits))
                )
            }
            if ('from' in v.source) {
                expect(v.source, path).toEqual({
                    from: expect.any(String),
                    mutation: expect.any(String),
                })
                expect(ids, path).toContain(v.source.from)
            } else {
                expect(v.source, path).toEqual({
                    canton: expect.any(String),
                    protocolVersion: expect.any(Number),
                    scenario: expect.any(String),
                })
            }
        })
    })
})
