// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import { alice, amulet } from './__tests__/fixtures.ts'
import type { TokenClient } from './client.ts'
import { exerciseTransfer } from './useExerciseTransfer.ts'

/** Like the extension's messaging proxy: any property path is a method. */
function recordingClient(calls: string[][]): TokenClient {
    const at = (path: string[]): unknown =>
        new Proxy(() => {}, {
            get: (_, name) => at([...path, String(name)]),
            apply: async () => {
                calls.push(path)
            },
        })
    return at([]) as TokenClient
}

describe('exerciseTransfer', () => {
    it('calls the withdraw method itself, as a messaging proxy needs', async () => {
        const calls: string[][] = []

        await exerciseTransfer(recordingClient(calls), {
            party: alice,
            contractId: 'instruction-1',
            instrumentId: amulet,
            instructionChoice: 'Withdraw',
            version: 'v1',
        })

        expect(calls).toEqual([['token', 'transfer', 'withdraw']])
    })
})
