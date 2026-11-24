// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { browser } from 'wxt/browser'
import { storage } from 'wxt/utils/storage'

export const DEFAULT_POPUP = 'popup.html'

/** What a tab's toolbar icon opens, and its badge. */
export interface TabIconView {
    popup: string
    badge: string
}

/** Who asks for a tab's icon, highest priority first. */
const USERS = ['site', 'transaction', 'unlock'] as const

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

// The browser can keep a tab's icon across a service worker restart, while
// the views that set it are gone.
const overriddenTabsItem = storage.defineItem<number[]>(
    'session:overriddenTabs',
    { fallback: [] }
)

/**
 * Opens the toolbar popup of the tab's window, if the browser can and the
 * tab is the active one: the popup is the active tab's, so for another tab
 * it would not show the request. Otherwise the user clicks the icon.
 */
export async function openTabPopup(
    tabId: number,
    windowId: number
): Promise<void> {
    try {
        if (!(await browser.tabs.get(tabId)).active) return
        // Without a focused normal window this fails, and a browser without
        // the method throws.
        await browser.action.openPopup({ windowId })
    } catch {
        // The badge stays for the user to click.
    }
}

/**
 * Owns what each tab's toolbar icon shows. Other tabs keep the default
 * popup. Must be created synchronously during background start-up, as it
 * adds tab listeners, and resets the icons the previous worker left behind.
 * Calls `onHeld` when a tab gets its first prompt and when it loses its
 * last one.
 */
export function createTabIcons(
    onHeld: (tabId: number, held: boolean) => void = () => {}
): TabIcons {
    const views = new Map<number, Map<TabIconUser, TabIconView>>()
    // Saves go in order, after the previous worker's list was read.
    let saved = restoreLeftovers().catch(ignore)

    function save(): void {
        saved = saved
            .then(() => overriddenTabsItem.setValue([...views.keys()]))
            .catch(ignore)
    }

    async function restoreLeftovers(): Promise<void> {
        const tabIds = await overriddenTabsItem.getValue()
        // show() sets what the tab holds now, so a tab that a new request
        // has set since start-up keeps that request's icon, and a later
        // set() runs its own show() after this one.
        await Promise.all(tabIds.map(show))
        if (tabIds.length) {
            await overriddenTabsItem.setValue([...views.keys()])
        }
    }

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
        if (!views.delete(tabId)) return
        save()
        onHeld(tabId, false)
    })

    return {
        set(tabId, user, view) {
            const users = views.get(tabId) ?? new Map()
            if (view) users.set(user, view)
            else users.delete(user)
            const had = views.has(tabId)
            if (users.size) views.set(tabId, users)
            else views.delete(tabId)
            if (had !== views.has(tabId)) {
                save()
                onHeld(tabId, !had)
            }
            return show(tabId)
        },
    }
}
