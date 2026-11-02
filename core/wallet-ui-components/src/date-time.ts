// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

type DateTimeValue = string | number | Date | null | undefined

const pad = (value: number) => String(value).padStart(2, '0')

/** The viewer's offset at that date: "UTC", "UTC+2", "UTC-4" or "UTC+5:30" */
function formatUtcOffset(date: Date): string {
    const offset = -date.getTimezoneOffset()
    if (offset === 0) {
        return 'UTC'
    }

    const sign = offset > 0 ? '+' : '-'
    const hours = Math.floor(Math.abs(offset) / 60)
    const minutes = Math.abs(offset) % 60
    return `UTC${sign}${hours}${minutes ? `:${pad(minutes)}` : ''}`
}

/**
 * Formats a timestamp in the viewer's time zone and locale with two-digit
 * fields and its UTC offset, e.g. "06/01/2025, 02:34 PM UTC+2" in en-US or
 * "01.06.2025, 14:34 UTC+2" in de-CH. Returns "N/A" for a missing value and
 * an unparsable string as is.
 */
export function formatDateTime(
    value: DateTimeValue,
    { seconds = false }: { seconds?: boolean } = {}
): string {
    if (value === null || value === undefined || value === '') {
        return 'N/A'
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return String(value)
    }

    const local = new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        ...(seconds && { second: '2-digit' }),
    }).format(date)
    return `${local} ${formatUtcOffset(date)}`
}

/** The exact time in UTC with seconds, e.g. "2025-06-01 12:34:56 UTC", for tooltips */
export function formatUtcDateTime(value: DateTimeValue): string | undefined {
    if (value === null || value === undefined || value === '') {
        return undefined
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return String(value)
    }

    const day = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
    const time = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
    return `${day} ${time} UTC`
}
