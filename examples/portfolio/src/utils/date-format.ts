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
 * Formats a date in the viewer's time zone in a fixed format with its UTC
 * offset, e.g. "2025-06-01 14:34 UTC+2"
 */
export function formatDateTimeString(
    date: string,
    { offset = true }: { offset?: boolean } = {}
): string {
    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) {
        return date
    }

    const day = `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(parsedDate.getDate())}`
    const time = `${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}`
    return offset
        ? `${day} ${time} ${formatUtcOffset(parsedDate)}`
        : `${day} ${time}`
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
