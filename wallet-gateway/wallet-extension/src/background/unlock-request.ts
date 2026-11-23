// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { browser } from 'wxt/browser'

import { logger } from '@/shared/logger.ts'

import type { PagePresence } from './page-presence.ts'
import type { SiteApprovalTab } from './site-approval.ts'
import { DEFAULT_POPUP, type TabIcons } from './tab-icon.ts'
import type { Vault } from './vault/index.ts'

const UNLOCK_VIEW = { popup: `${DEFAULT_POPUP}#/unlock`, badge: '!' }

export interface UnlockRequests {
    /**
     * Points the toolbar icon of the tab at the unlock page, with a badge,
     * and tries to open it. The icon goes back to the wallet once the vault
     * unlocks, the tab closes or the page that asked unloads.
     */
    request(tab: SiteApprovalTab | undefined): Promise<void>
}

export interface UnlockRequestsOptions {
    vault: Pick<Vault, 'onUnlock'>
    presence: PagePresence
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
    const pages = new Map<number, string>()

    function end(tabId: number): void {
        pages.delete(tabId)
        void tabIcons.set(tabId, 'unlock', undefined)
    }

    vault.onUnlock(() => {
        for (const tabId of pages.keys()) end(tabId)
    })

    presence.onUnload((page) => {
        for (const [tabId, asked] of pages) {
            if (asked === page) end(tabId)
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
            const { tabId, windowId, page } = tab
            pages.set(tabId, page)
            await tabIcons.set(tabId, 'unlock', UNLOCK_VIEW)
            // Unlocked, closed or unloaded in the meantime.
            if (pages.get(tabId) !== page) return
            // Without a focused normal window this fails, and the user opens
            // the unlock page from the icon.
            await browser.action.openPopup({ windowId }).catch(() => {})
        },
    }
}
