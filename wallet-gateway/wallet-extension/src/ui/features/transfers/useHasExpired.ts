// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useReducer } from 'react'

// A longer setTimeout delay overflows and fires at once.
const MAX_TIMEOUT_MS = 2 ** 31 - 1

export function hasExpired(executeBefore: string): boolean {
    return new Date(executeBefore).getTime() <= Date.now()
}

/** Whether `executeBefore` has passed, rerendering when it does. */
export function useHasExpired(executeBefore: string): boolean {
    const [, wake] = useReducer((count: number) => count + 1, 0)
    const expired = hasExpired(executeBefore)

    useEffect(() => {
        if (expired) return
        const deadline = new Date(executeBefore).getTime()
        const wait = () => Math.min(deadline - Date.now(), MAX_TIMEOUT_MS)
        // A delay capped short of the deadline waits again.
        const onTimeout = () => {
            if (Date.now() >= deadline) wake()
            else timer = setTimeout(onTimeout, wait())
        }
        let timer = setTimeout(onTimeout, wait())
        return () => clearTimeout(timer)
    }, [executeBefore, expired])

    return expired
}
