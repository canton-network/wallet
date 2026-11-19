// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { HoldingView } from '@canton-network/core-token-standard'
import type { HoldingView as HoldingViewV2 } from '@canton-network/core-token-standard-v2'

export function checkLock(
    lock: HoldingView['lock'] | HoldingViewV2['lock'],
    createdAtTime: string,
    currentTime: Date = new Date()
): boolean {
    if (!lock) return false

    let expiresAtAbsolute: Date | null = null
    let expiresAtRelative: Date | null = null

    if (lock.expiresAfter) {
        const createdAt = new Date(createdAtTime)

        // 1 microsecond = 0.001 milliseconds
        const msToAdd = parseInt(lock.expiresAfter.microseconds) / 1000

        expiresAtRelative = new Date(createdAt.getTime() + msToAdd)
    }
    if (lock.expiresAt) {
        expiresAtAbsolute = new Date(lock.expiresAt)
    }

    let expiresAt: Date

    // If both `expiresAt` and `expiresAfter` are set, the lock expires at the earlier of the two times.
    if (expiresAtRelative && expiresAtAbsolute) {
        expiresAt =
            expiresAtRelative < expiresAtAbsolute
                ? expiresAtRelative
                : expiresAtAbsolute
    } else if (expiresAtRelative) {
        expiresAt = expiresAtRelative
    } else if (expiresAtAbsolute) {
        expiresAt = expiresAtAbsolute
    } else {
        // No expiration => locked
        return true
    }

    return currentTime < expiresAt
}
