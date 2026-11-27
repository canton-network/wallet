// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { browser } from 'wxt/browser'

/**
 * How often the worker calls an extension API while a tab holds a prompt.
 * Chrome stops an idle service worker after 30 seconds, and any extension
 * API call resets that timer.
 */
export const KEEP_ALIVE_MS = 20_000

const ignore = () => {}

/**
 * Keeps the service worker running while any tab holds a prompt, so the
 * prompt isn't lost while the user answers. Returns the `onHeld` callback
 * of `createTabIcons`.
 */
export function createKeepAlive(): (tabId: number, held: boolean) => void {
    const heldTabs = new Set<number>()
    let timer: ReturnType<typeof setInterval> | undefined
    return (tabId, held) => {
        if (held) heldTabs.add(tabId)
        else heldTabs.delete(tabId)
        if (heldTabs.size === 0) {
            clearInterval(timer)
            timer = undefined
        } else if (timer === undefined) {
            timer = setInterval(
                () => void browser.runtime.getPlatformInfo().catch(ignore),
                KEEP_ALIVE_MS
            )
        }
    }
}
