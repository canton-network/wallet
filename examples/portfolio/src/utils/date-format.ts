// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { format, formatDistance, formatISO } from 'date-fns'

export const formatIsoDateTime = (date: Date): string => formatISO(date)

export function getExpiryTime(expiry: string): number {
    const time = Date.parse(expiry)
    return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time
}

export function isExpired(expiry: string): boolean {
    return getExpiryTime(expiry) <= Date.now()
}

export function formatIsoDateTimeString(date: string): string {
    const parsedDate = new Date(date)
    return Number.isNaN(parsedDate.getTime())
        ? date
        : formatISO(parsedDate, { representation: 'date' })
}

export function formatDateTimeString(date: string): string {
    const parsedDate = new Date(date)

    return Number.isNaN(parsedDate.getTime())
        ? date
        : format(parsedDate, 'yyyy-MM-dd HH:mm')
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
