// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TxHashingErrorCode } from '../../errors.js'
import type { TraversalLimits } from '../../limits.js'

export const V2 = 'HASHING_SCHEME_VERSION_V2'
export const V3 = 'HASHING_SCHEME_VERSION_V3'

export interface Captured {
    canton: string
    protocolVersion: number
    scenario: string
}

export interface Edited {
    from: string
    mutation: string
}

interface Common {
    id: string
    scheme: string
    preparedTransaction: string
    limits?: Partial<TraversalLimits>
}

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

export interface VectorFile {
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

export function vectorFiles(): VectorFile[] {
    const files = Object.keys(found)
        .sort()
        .map((key) => ({ path: key.slice(ROOT.length), json: found[key] }))
    if (files.length === 0) throw new Error('no vector file found')
    return files
}

export function loadVectors(): Vector[] {
    return vectorFiles().map(({ json }) => json as Vector)
}
