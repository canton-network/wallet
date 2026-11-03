// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Changes of one byte that keep a field valid

const RUNS = [
    '0123456789',
    'abcdef',
    'ghijklmnopqrstuvwxyz',
    'ABCDEF',
    'GHIJKLMNOPQRSTUVWXYZ',
]

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

export function changedBytes(bytes: Uint8Array): Uint8Array {
    if (bytes.length === 0) throw new Error('there is no byte to change')
    const copy = new Uint8Array(bytes)
    copy[0] ^= 1
    return copy
}

export const changedTime = (micros: bigint): bigint => micros ^ 1n
