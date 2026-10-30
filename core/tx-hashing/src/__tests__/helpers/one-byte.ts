// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Changes of one byte that keep a field valid, shared by the mutation tests
// and the generator of the mutation vectors (see Provenance in vectors/README.md).

/** A character changes to the next one of its run, so that hex stays hex */
const RUNS = [
    '0123456789',
    'abcdef',
    'ghijklmnopqrstuvwxyz',
    'ABCDEF',
    'GHIJKLMNOPQRSTUVWXYZ',
]

/**
 * `text` with its last ASCII letter or digit replaced by the next one of its
 * run: one byte of the UTF-8 changes, and a contract id, a party, a numeric, a
 * UUID or a name stays valid.
 */
export function changedText(text: string): string {
    for (let i = text.length - 1; i >= 0; i--) {
        for (const run of RUNS) {
            const at = run.indexOf(text[i])
            if (at >= 0) {
                const next = run[(at + 1) % run.length]
                return `${text.slice(0, i)}${next}${text.slice(i + 1)}`
            }
        }
    }
    throw new Error(`${JSON.stringify(text)} has no ASCII letter or digit`)
}

/** A copy of `bytes` with the lowest bit of the first byte flipped */
export function changedBytes(bytes: Uint8Array): Uint8Array {
    if (bytes.length === 0) throw new Error('there is no byte to change')
    const copy = new Uint8Array(bytes)
    copy[0] ^= 1
    return copy
}

/**
 * `micros` with its lowest bit flipped, one microsecond off. Of its varint
 * only the first byte changes, and of its int64 only the last.
 */
export const changedTime = (micros: bigint): bigint => micros ^ 1n
