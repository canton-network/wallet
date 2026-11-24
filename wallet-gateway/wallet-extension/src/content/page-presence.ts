// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { browser, type Browser } from 'wxt/browser'

import { logger } from '@/shared/logger.ts'
import {
    PAGE_PRESENCE_PORT_NAME,
    PRESENCE_HEARTBEAT_MS,
    type PresenceHeartbeat,
} from '@/shared/ports.ts'

type Port = Browser.runtime.Port

export interface PagePresence {
    /** Opens the presence port, unless it is open. */
    open(): void
}

/**
 * Holds a port to the background while the page is loaded, so the
 * background sees the page unload and ends the approval prompts it
 * asked for. A service worker restart closes the port, and the prompts with
 * it, so the next request opens it again. While the background holds a
 * prompt for the tab, it sends a heartbeat on the port, which keeps the
 * service worker from stopping while the user answers.
 */
export function createPagePresence(
    connect: () => Port = () =>
        browser.runtime.connect({ name: PAGE_PRESENCE_PORT_NAME })
): PagePresence {
    let port: Port | undefined
    return {
        open() {
            if (port) return
            let opened: Port
            try {
                opened = connect()
            } catch (error) {
                // e.g. the extension was reloaded and this context is orphaned
                logger.warn('Unable to open the page presence port: {*}', {
                    error,
                })
                return
            }
            port = opened
            let heartbeat: ReturnType<typeof setInterval> | undefined
            const stop = () => {
                clearInterval(heartbeat)
                heartbeat = undefined
            }
            opened.onMessage.addListener((message) => {
                if (!(message as PresenceHeartbeat).heartbeat) stop()
                else if (heartbeat === undefined) {
                    heartbeat = setInterval(
                        () => opened.postMessage('heartbeat'),
                        PRESENCE_HEARTBEAT_MS
                    )
                }
            })
            opened.onDisconnect.addListener(() => {
                stop()
                if (port === opened) port = undefined
            })
        },
    }
}
