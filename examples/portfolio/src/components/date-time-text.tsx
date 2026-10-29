// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    formatDateTimeString,
    formatUtcDateTimeString,
} from '@utils/date-format'

interface DateTimeTextProps {
    value: string | Date
    /** Shows the UTC offset, e.g. "UTC+2" @default true */
    offset?: boolean
}

/** A date in the viewer's time zone, with the exact time in UTC as tooltip */
export function DateTimeText({ value, offset = true }: DateTimeTextProps) {
    const raw = typeof value === 'string' ? value : value.toISOString()

    return (
        <time dateTime={raw} title={formatUtcDateTimeString(raw)}>
            {formatDateTimeString(raw, { offset })}
        </time>
    )
}
