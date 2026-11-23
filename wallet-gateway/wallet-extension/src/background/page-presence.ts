// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { browser } from 'wxt/browser'

import { PAGE_PRESENCE_PORT_NAME } from '@/shared/ports.ts'

import { senderOrigin, senderTab } from './dapp-service.ts'

export interface PagePresence {
    /**
     * Calls `listener` with the `page` (see `SiteApprovalTab`) whose
     * presence port disconnected: the page unloaded, or its content script
     * lost the extension.
     */
    onUnload(listener: (page: string) => void): void
}

/**
 * Accepts the presence ports of content scripts. Must be created
 * synchronously during background start-up, as it adds a port listener.
 */
export function createPagePresence(): PagePresence {
    const listeners = new Set<(page: string) => void>()

    browser.runtime.onConnect.addListener((port) => {
        if (port.name !== PAGE_PRESENCE_PORT_NAME) return
        // Only a dApp page unloads; an extension page could otherwise end
        // a page's prompts.
        const page = senderTab(port.sender)?.page
        if (page === undefined || senderOrigin(port.sender) === undefined) {
            port.disconnect()
            return
        }
        port.onDisconnect.addListener(() => {
            for (const listener of listeners) listener(page)
        })
    })

    return {
        onUnload(listener) {
            listeners.add(listener)
        },
    }
}
