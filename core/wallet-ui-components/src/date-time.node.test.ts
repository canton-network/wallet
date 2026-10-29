// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatDateTime, formatUtcDateTime } from './date-time.js'

const SUMMER = '2025-06-01T12:34:56Z'
const WINTER = '2025-01-15T12:34:56Z'

// Node applies a changed TZ to dates created afterwards
const useTimeZone = (timeZone: string) => vi.stubEnv('TZ', timeZone)

afterEach(() => {
    vi.unstubAllEnvs()
})

describe('formatDateTime', () => {
    it.each([
        ['UTC', SUMMER, '2025-06-01 12:34 UTC'],
        ['Europe/Zurich', SUMMER, '2025-06-01 14:34 UTC+2'],
        ['Europe/Zurich', WINTER, '2025-01-15 13:34 UTC+1'],
        ['America/New_York', SUMMER, '2025-06-01 08:34 UTC-4'],
        ['America/New_York', WINTER, '2025-01-15 07:34 UTC-5'],
        ['Asia/Kolkata', SUMMER, '2025-06-01 18:04 UTC+5:30'],
        ['America/St_Johns', SUMMER, '2025-06-01 10:04 UTC-2:30'],
        // The local date can differ from the UTC date
        ['Pacific/Auckland', SUMMER, '2025-06-02 00:34 UTC+12'],
    ])('formats %s %s as %s', (timeZone, value, expected) => {
        useTimeZone(timeZone)
        expect(formatDateTime(value)).toBe(expected)
    })

    it('includes seconds when asked to', () => {
        useTimeZone('Europe/Zurich')
        expect(formatDateTime(SUMMER, { seconds: true })).toBe(
            '2025-06-01 14:34:56 UTC+2'
        )
    })

    it.each([
        ['a timestamp', Date.parse(SUMMER)],
        ['a Date', new Date(SUMMER)],
    ])('accepts %s', (_, value) => {
        useTimeZone('Europe/Zurich')
        expect(formatDateTime(value)).toBe('2025-06-01 14:34 UTC+2')
    })

    it.each([null, undefined, ''])('shows N/A for %j', (value) => {
        expect(formatDateTime(value)).toBe('N/A')
    })

    it('returns an unparsable value as is', () => {
        expect(formatDateTime('not a date')).toBe('not a date')
    })
})

describe('formatUtcDateTime', () => {
    it.each(['UTC', 'Europe/Zurich', 'America/St_Johns', 'Pacific/Auckland'])(
        'shows the same UTC time in %s',
        (timeZone) => {
            useTimeZone(timeZone)
            expect(formatUtcDateTime(SUMMER)).toBe('2025-06-01 12:34:56 UTC')
        }
    )

    it.each([null, undefined, ''])('returns undefined for %j', (value) => {
        expect(formatUtcDateTime(value)).toBeUndefined()
    })

    it('returns an unparsable value as is', () => {
        expect(formatUtcDateTime('not a date')).toBe('not a date')
    })
})
