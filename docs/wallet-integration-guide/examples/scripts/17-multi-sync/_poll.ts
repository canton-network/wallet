// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface PollOptions {
    /** Maximum time to keep polling before giving up, in milliseconds. */
    timeoutMs: number
    /** Delay between successive attempts, in milliseconds. */
    intervalMs: number
    /** Error message thrown when the timeout elapses without a result. */
    timeoutMessage: string
}

/**
 * Repeatedly invokes `fn` until it resolves to a defined (non-`undefined`)
 * value or the timeout elapses. Bridges cross-participant read-after-write
 * delays where a contract created on one participant becomes visible on another
 * only after asynchronous propagation.
 *
 * @throws {Error} With `timeoutMessage` when no result is produced in time.
 */
export async function pollUntil<T>(
    fn: () => Promise<T | undefined>,
    { timeoutMs, intervalMs, timeoutMessage }: PollOptions
): Promise<T> {
    const deadline = Date.now() + timeoutMs
    for (;;) {
        const result = await fn()
        if (result !== undefined) return result
        if (Date.now() >= deadline) throw new Error(timeoutMessage)
        await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }
}
