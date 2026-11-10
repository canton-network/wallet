// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { randomBytes } from 'crypto'

const TTL_MS = 60_000
const tickets = new Map<
    string,
    { token: string; expiresAt: number; timer: ReturnType<typeof setTimeout> }
>()

// EventSource cannot send an Authorization header. The browser gets a
// short-lived ticket and puts that on the URL instead of the session token.
export function issueSseTicket(token: string): string {
    const ticket = randomBytes(32).toString('base64url')
    const timer = setTimeout(() => {
        tickets.delete(ticket)
    }, TTL_MS)
    // A ticket nobody comes back for still has to leave the map.
    timer.unref?.()
    tickets.set(ticket, {
        token,
        expiresAt: Date.now() + TTL_MS,
        timer,
    })
    return ticket
}

export function resolveSseTicket(ticket: string): string | undefined {
    const row = tickets.get(ticket)
    if (!row) return undefined
    if (row.expiresAt <= Date.now()) {
        clearTimeout(row.timer)
        tickets.delete(ticket)
        return undefined
    }
    return row.token
}
