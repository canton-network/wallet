// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest'

import { checkLock } from './lock.ts'

type Lock = Parameters<typeof checkLock>[0]

describe('checkLock', () => {
    // Used for relative time
    const createdAt = '2026-09-01T10:00:00.000Z'

    const past = '2026-09-01T10:59:59.999Z'
    const pastRel = { microseconds: '3599999000' }

    const now = '2026-09-01T11:00:00.000Z'
    const nowRel = { microseconds: '3600000000' }

    const future = '2026-09-01T11:00:00.001Z'
    const futureRel = { microseconds: '3600001000' }

    it.each([
        [null, false],
        [{}, true],
        [{ expiresAt: null }, true],
        [{ expiresAt: past }, false],
        [{ expiresAt: now }, false],
        [{ expiresAt: future }, true],
        [{ expiresAfter: pastRel }, false],
        [{ expiresAfter: nowRel }, false],
        [{ expiresAfter: futureRel }, true],
        [{ expiresAt: future, expiresAfter: futureRel }, true],
        [{ expiresAt: now, expiresAfter: futureRel }, false],
        [{ expiresAt: future, expiresAfter: nowRel }, false],
    ])('lock %o returns %s', (lock, expected) => {
        expect(checkLock(lock as Lock, createdAt, new Date(now))).toBe(expected)
    })
})
