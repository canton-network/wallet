// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { browser } from 'wxt/browser'

import { logger } from '@/shared/logger.ts'

import type { PageConnection, PagePresence } from './page-presence.ts'
import type { SiteApprovalTab } from './site-approval.ts'
import { DEFAULT_POPUP, openTabPopup, type TabIcons } from './tab-icon.ts'
import type { Vault } from './vault/index.ts'

const UNLOCK_VIEW = { popup: `${DEFAULT_POPUP}#/unlock`, badge: '!' }

export interface UnlockRequests {
    /**
     * Points the toolbar icon of the tab at the unlock page, with a badge,
     * and tries to open it. The icon goes back to the wallet once the vault
     * unlocks, the tab closes or the page that asked unloads. Does nothing
     * once that page has gone.
     */
    request(tab: SiteApprovalTab | undefined): Promise<void>
}

export interface UnlockRequestsOptions {
    vault: Pick<Vault, 'onUnlock'>
    presence: Pick<PagePresence, 'onEnd'>
    tabIcons: TabIcons
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
}: UnlockRequestsOptions): UnlockRequests {
    // The page that asked last, by tab.
    const pages = new Map<number, PageConnection>()

    function end(tabId: number): void {
        pages.delete(tabId)
        void tabIcons.set(tabId, 'unlock', undefined)
    }

    vault.onUnlock(() => {
        for (const tabId of pages.keys()) end(tabId)
    })

    presence.onEnd((connection) => {
        for (const [tabId, asked] of pages) {
            if (asked === connection) end(tabId)
        }
    })

    browser.tabs.onRemoved.addListener((tabId) => {
        pages.delete(tabId)
    })

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
            pages.set(tabId, connection)
            await tabIcons.set(tabId, 'unlock', UNLOCK_VIEW)
            // Unlocked, closed or unloaded in the meantime.
            if (pages.get(tabId) !== connection) return
            await openTabPopup(tabId, windowId)
        },
    }
}
