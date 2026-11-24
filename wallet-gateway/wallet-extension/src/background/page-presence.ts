// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { browser, type Browser } from 'wxt/browser'

import {
    PAGE_PRESENCE_PORT_NAME,
    type PresenceHeartbeat,
} from '@/shared/ports.ts'

import { senderOrigin, senderTab } from './dapp-service.ts'

/** One presence port of a dApp page, from connect to disconnect. */
export interface PageConnection {
    /** See `RequestTab`. */
    readonly page: string
    readonly origin: string
    /**
     * False once the port disconnected or a newer connection from the same
     * tab and frame replaced it.
     */
    readonly live: boolean
}

/** The browser tab of the page that sent a dApp request. */
export interface RequestTab {
    tabId: number
    windowId: number
    /** The document that sent it: `documentId`, or the tab and frame. */
    page: string
    /**
     * The page's presence connection when the request arrived. None, or not
     * live, means the page has gone.
     */
    connection: PageConnection | undefined
}

export interface PagePresence {
    /**
     * The live connection of `page` from `origin`, if any. Take it when a
     * request arrives, before any await, so that a page that goes while the
     * request waits is noticed.
     */
    connection(page: string, origin: string): PageConnection | undefined
    /**
     * Calls `listener` once for each connection that ends: the page
     * unloaded, its content script lost the extension, or another page in
     * the same tab and frame connected.
     */
    onEnd(listener: (connection: PageConnection) => void): void
    /**
     * Makes the tab's pages send a heartbeat while the background holds
     * a prompt for it, which keeps the service worker running.
     */
    heartbeat(tabId: number, held: boolean): void
}

function send(port: Browser.runtime.Port, heartbeat: boolean): void {
    try {
        port.postMessage({ heartbeat } satisfies PresenceHeartbeat)
    } catch {
        // Disconnected; the page has gone.
    }
}

/**
 * Accepts the presence ports of content scripts. Must be created
 * synchronously during background start-up, as it adds a port listener.
 */
export function createPagePresence(): PagePresence {
    const listeners = new Set<(connection: PageConnection) => void>()
    // The live connection of each tab and frame. Without a `documentId`, a
    // new document there has the same `page`, so only the newest counts.
    const byFrame = new Map<
        string,
        {
            page: string
            origin: string
            live: boolean
            tabId: number
            port: Browser.runtime.Port
        }
    >()
    const heldTabs = new Set<number>()

    function end(frame: string): void {
        const connection = byFrame.get(frame)
        if (!connection) return
        byFrame.delete(frame)
        connection.live = false
        for (const listener of listeners) listener(connection)
    }

    browser.runtime.onConnect.addListener((port) => {
        if (port.name !== PAGE_PRESENCE_PORT_NAME) return
        // Only a dApp page unloads; an extension page could otherwise end
        // a page's prompts.
        const tab = senderTab(port.sender)
        const origin = senderOrigin(port.sender)
        if (tab === undefined || origin === undefined) {
            port.disconnect()
            return
        }
        const frame = JSON.stringify([tab.tabId, port.sender?.frameId ?? 0])
        // The page before it may not have disconnected yet, and a request of
        // the new page must not join its prompts.
        end(frame)
        const connection = {
            page: tab.page,
            origin,
            live: true,
            tabId: tab.tabId,
            port,
        }
        byFrame.set(frame, connection)
        // Another page of the tab, in another frame, may hold a prompt.
        if (heldTabs.has(tab.tabId)) send(port, true)
        port.onDisconnect.addListener(() => {
            if (byFrame.get(frame) === connection) end(frame)
        })
    })

    return {
        connection(page, origin) {
            for (const connection of byFrame.values()) {
                if (connection.page === page && connection.origin === origin) {
                    return connection
                }
            }
            return undefined
        },
        onEnd(listener) {
            listeners.add(listener)
        },
        heartbeat(tabId, held) {
            if (held) heldTabs.add(tabId)
            else heldTabs.delete(tabId)
            for (const connection of byFrame.values()) {
                if (connection.tabId === tabId) send(connection.port, held)
            }
        },
    }
}
