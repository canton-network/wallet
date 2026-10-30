// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TxHashingErrorCode } from '../../errors.js'
import type { TraversalLimits } from '../../limits.js'

/** The schemes this package hashes, as the JSON API and the vectors name them */
export const V2 = 'HASHING_SCHEME_VERSION_V2'
export const V3 = 'HASHING_SCHEME_VERSION_V3'

/** Bytes that a Canton participant returned */
export interface Captured {
    canton: string
    protocolVersion: number
    scenario: string
}

/** Bytes made by changing another vector */
export interface Edited {
    from: string
    mutation: string
}

interface Common {
    id: string
    /** As the JSON API names it. A reject vector may name a scheme the package refuses. */
    scheme: string
    /** The bytes of the prepared transaction, in canonical standard base64 */
    preparedTransaction: string
    limits?: Partial<TraversalLimits>
}

/** The content of one file in vectors/, which vectors/README.md describes */
export type Vector =
    | (Common & {
          kind: 'accepted' | 'held-out'
          expected: { hash: string }
          source: Captured
      })
    | (Common & {
          kind: 'mutation'
          expected: { hash: string }
          source: Edited
      })
    | (Common & {
          kind: 'reject'
          expected: { error: TxHashingErrorCode }
          source: Captured | Edited
      })

/** A file in vectors/, its content not yet checked */
export interface VectorFile {
    /** Below vectors/, such as `v3/v3-create-with-key.json` */
    path: string
    json: unknown
}

// Vite bundles the files into the test, so the browser project reads them too.
// No type argument: vitest keeps a transformed file in its module cache unless
// the source contains `import.meta.glob(` literally, and a cached copy would
// miss vector files added later. The cast takes its place.
const found = import.meta.glob('../../../vectors/**/*.json', {
    eager: true,
    import: 'default',
}) as Record<string, unknown>

const ROOT = '../../../vectors/'

/** Every file in vectors/, in path order */
export function vectorFiles(): VectorFile[] {
    const files = Object.keys(found)
        .sort()
        .map((key) => ({ path: key.slice(ROOT.length), json: found[key] }))
    // Without this, a broken glob would leave the tests with nothing to run
    if (files.length === 0) throw new Error('no vector file found')
    return files
}

/** The content of every file in vectors/, taken to be well formed */
export function loadVectors(): Vector[] {
    return vectorFiles().map(({ json }) => json as Vector)
}
