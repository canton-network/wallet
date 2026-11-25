// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { vi } from 'vitest'
import type { Browser } from 'wxt/browser'
import { fakeBrowser } from 'wxt/testing/fake-browser'

/**
 * Makes the fake browser deliver `runtime.sendMessage(message, callback)`
 * calls, the form `@webext-core/messaging` uses, with `sender`. The fake
 * always sends an empty sender. `vi.restoreAllMocks()` undoes it.
 */
export function sendMessagesFrom(sender: Browser.runtime.MessageSender): void {
    const { runtime } = fakeBrowser
    vi.spyOn(runtime, 'sendMessage').mockImplementation(((
        message: unknown,
        callback: (response: unknown) => void
    ) => {
        let sendResponse!: (response: unknown) => void
        const response = new Promise((resolve) => (sendResponse = resolve))
        void runtime.onMessage
            .trigger(message, sender, sendResponse)
            // A listener returns true to answer later through sendResponse.
            .then(async (results: unknown[]) =>
                callback(results.includes(true) ? await response : undefined)
            )
    }) as typeof runtime.sendMessage)
}

/** The sender of a message from the extension's app page. */
export function appPageSender(): Browser.runtime.MessageSender {
    return {
        id: fakeBrowser.runtime.id,
        url: fakeBrowser.runtime.getURL('/app.html'),
    }
}
