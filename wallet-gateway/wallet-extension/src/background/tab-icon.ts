// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { browser } from 'wxt/browser'

export const DEFAULT_POPUP = 'popup.html'

/** What a tab's toolbar icon opens, and its badge. */
export interface TabIconView {
    popup: string
    badge: string
}

/** Who asks for a tab's icon, highest priority first. */
const USERS = ['approval', 'unlock'] as const

export type TabIconUser = (typeof USERS)[number]

export interface TabIcons {
    /**
     * Sets what `user` wants the tab's icon to show, or with `undefined`
     * gives the icon up. The icon shows the view of the highest-priority
     * user, or the wallet. Resolves once the icon is set.
     */
    set(
        tabId: number,
        user: TabIconUser,
        view: TabIconView | undefined
    ): Promise<void>
}

// The tab may have closed in the meantime.
const ignore = () => {}

/**
 * Owns what each tab's toolbar icon shows. Other tabs keep the default
 * popup. Must be created synchronously during background start-up, as it
 * adds tab listeners.
 */
export function createTabIcons(): TabIcons {
    const views = new Map<number, Map<TabIconUser, TabIconView>>()

    async function show(tabId: number): Promise<void> {
        const users = views.get(tabId)
        const shown = USERS.map((user) => users?.get(user)).find(Boolean)
        await Promise.all([
            browser.action
                .setPopup({ tabId, popup: shown?.popup ?? DEFAULT_POPUP })
                .catch(ignore),
            browser.action
                .setBadgeText({ tabId, text: shown?.badge ?? '' })
                .catch(ignore),
            shown
                ? browser.action
                      .setBadgeBackgroundColor({ tabId, color: '#d32f2f' })
                      .catch(ignore)
                : undefined,
        ])
    }

    // Sets the icon again should anything have cleared it.
    browser.tabs.onUpdated.addListener((tabId) => {
        if (views.has(tabId)) void show(tabId)
    })

    // Nothing left to restore on a closed tab.
    browser.tabs.onRemoved.addListener((tabId) => {
        views.delete(tabId)
    })

    return {
        set(tabId, user, view) {
            const users = views.get(tabId) ?? new Map()
            if (view) users.set(user, view)
            else users.delete(user)
            if (users.size) views.set(tabId, users)
            else views.delete(tabId)
            return show(tabId)
        },
    }
}
