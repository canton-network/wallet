// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { formatDistance } from 'date-fns'

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

export function getExpiryTime(expiry: string): number {
    const time = Date.parse(expiry)
    return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time
}

export function isExpired(expiry: string): boolean {
    return getExpiryTime(expiry) <= Date.now()
}

/**
 * Formats a date in the viewer's time zone and locale with two-digit fields
 * and its UTC offset, e.g. "06/01/2025, 02:34 PM UTC+2" in en-US or
 * "01.06.2025, 14:34 UTC+2" in de-CH
 */
export function formatDateTimeString(
    date: string,
    { offset = true }: { offset?: boolean } = {}
): string {
    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) {
        return date
    }

    const local = new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(parsedDate)
    return offset ? `${local} ${formatUtcOffset(parsedDate)}` : local
}

/** The exact time in UTC, e.g. "2025-06-01 12:34:56 UTC", for a tooltip */
export function formatUtcDateTimeString(date: string): string {
    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) {
        return date
    }

    const day = `${parsedDate.getUTCFullYear()}-${pad(parsedDate.getUTCMonth() + 1)}-${pad(parsedDate.getUTCDate())}`
    const time = `${pad(parsedDate.getUTCHours())}:${pad(parsedDate.getUTCMinutes())}:${pad(parsedDate.getUTCSeconds())}`
    return `${day} ${time} UTC`
}

export function formatDistanceToNow(date: string): string {
    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
        return date
    }

    return parsedDate.getTime() <= Date.now()
        ? 'Expired'
        : formatDistance(parsedDate, new Date())
}
