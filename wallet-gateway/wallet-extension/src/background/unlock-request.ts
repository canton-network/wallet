// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { browser } from 'wxt/browser'

import { logger } from '@/shared/logger.ts'

import type {
    PageConnection,
    PagePresence,
    RequestTab,
} from './page-presence.ts'
import { SITE_APPROVAL_TIMEOUT_MS } from './site-approval.ts'
import { DEFAULT_POPUP, openTabPopup, type TabIcons } from './tab-icon.ts'
import type { Vault } from './vault/index.ts'

const UNLOCK_VIEW = { popup: `${DEFAULT_POPUP}#/unlock`, badge: '!' }

export interface UnlockRequests {
    /**
     * Points the toolbar icon of the tab at the unlock page, with a badge,
     * and tries to open it. The icon goes back to the wallet once the vault
     * unlocks, the tab closes, the page that asked unloads or the request
     * times out. Does nothing once that page has gone.
     */
    request(tab: RequestTab | undefined): Promise<void>
}

export interface UnlockRequestsOptions {
    vault: Pick<Vault, 'onUnlock'>
    presence: Pick<PagePresence, 'onEnd'>
    tabIcons: TabIcons
    timeoutMs?: number
}

/**
 * Keeps the tabs whose dApp asked to connect while the vault was locked.
 * Must be created synchronously during background start-up, as it adds tab
 * listeners.
 */
export function createUnlockRequests({
    vault,
    presence,
    tabIcons,
    timeoutMs = SITE_APPROVAL_TIMEOUT_MS,
}: UnlockRequestsOptions): UnlockRequests {
    // The page that asked last, by tab, and when its request times out.
    const pages = new Map<
        number,
        { connection: PageConnection; timer: ReturnType<typeof setTimeout> }
    >()

    function forget(tabId: number): void {
        clearTimeout(pages.get(tabId)?.timer)
        pages.delete(tabId)
    }

    function end(tabId: number): void {
        forget(tabId)
        void tabIcons.set(tabId, 'unlock', undefined)
    }

    vault.onUnlock(() => {
        for (const tabId of pages.keys()) end(tabId)
    })

    presence.onEnd((connection) => {
        for (const [tabId, asked] of pages) {
            if (asked.connection === connection) end(tabId)
        }
    })

    browser.tabs.onRemoved.addListener(forget)

    return {
        async request(tab) {
            if (!tab) {
                logger.warn(
                    'A locked connect has no tab to show the unlock page in'
                )
                return
            }
            const { tabId, windowId, connection } = tab
            // Gone while the request waited, so no page would clear the icon.
            if (!connection?.live) return
            forget(tabId)
            // Its prompt keeps the worker running.
            const timer = setTimeout(() => end(tabId), timeoutMs)
            pages.set(tabId, { connection, timer })
            await tabIcons.set(tabId, 'unlock', UNLOCK_VIEW)
            // Unlocked, closed, unloaded or timed out in the meantime.
            if (pages.get(tabId)?.connection !== connection) return
            await openTabPopup(tabId, windowId)
        },
    }
}
