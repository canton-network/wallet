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
 * Formats a timestamp in the viewer's time zone in a fixed, locale-independent
 * format with its UTC offset, e.g. "2025-06-01 14:34 UTC+2", so it can be
 * shared as is. Returns "N/A" for a missing value and an unparsable string as
 * is.
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

    const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}${seconds ? `:${pad(date.getSeconds())}` : ''}`
    return `${day} ${time} ${formatUtcOffset(date)}`
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
