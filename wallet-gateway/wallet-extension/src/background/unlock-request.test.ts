// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    type MockInstance,
    vi,
} from 'vitest'
import type { Browser } from 'wxt/browser'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import type { PageConnection } from './page-presence.ts'
import type { RequestTab } from './page-presence.ts'
import { createTabIcons, type TabIcons } from './tab-icon.ts'
import { createUnlockRequests, type UnlockRequests } from './unlock-request.ts'

/** A page in tab 7, with a live presence connection. */
const openPage = (page = 'document-1') => ({
    tabId: 7,
    windowId: 3,
    page,
    connection: { page, origin: 'https://dapp.example', live: true },
})

describe('createUnlockRequests', () => {
    let unlockListeners: (() => void)[]
    let endListeners: ((connection: PageConnection) => void)[]
    let tab: RequestTab & { connection: { live: boolean } }
    // The popup of each tab, as set through `action.setPopup`.
    let popups: Map<number | undefined, string>
    let setPopup: MockInstance<typeof fakeBrowser.action.setPopup>
    let openPopup: MockInstance<typeof fakeBrowser.action.openPopup>
    let tabIcons: TabIcons
    let unlockRequests: UnlockRequests

    const badge = (tabId = tab.tabId) =>
        fakeBrowser.action.getBadgeText({ tabId })
    const expectRestored = async () => {
        expect(popups.get(tab.tabId)).toBe('popup.html')
        expect(await badge()).toBe('')
    }
    const endPage = (page: RequestTab & { connection: { live: boolean } }) => {
        page.connection.live = false
        endListeners.forEach((listener) => listener(page.connection!))
    }

    beforeEach(() => {
        fakeBrowser.reset()
        unlockListeners = []
        endListeners = []
        tab = openPage()
        popups = new Map()
        // The fake browser doesn't implement setPopup or openPopup.
        setPopup = vi
            .spyOn(fakeBrowser.action, 'setPopup')
            .mockImplementation(async ({ tabId, popup }) => {
                popups.set(tabId ?? undefined, popup)
            })
        openPopup = vi
            .spyOn(fakeBrowser.action, 'openPopup')
            .mockResolvedValue(undefined)
        // The toolbar popup only opens on the active tab.
        vi.spyOn(fakeBrowser.tabs, 'get').mockImplementation((async () => ({
            active: true,
        })) as unknown as typeof fakeBrowser.tabs.get)
        tabIcons = createTabIcons()
        unlockRequests = createUnlockRequests({
            vault: {
                onUnlock: (listener) => void unlockListeners.push(listener),
            },
            presence: {
                onEnd: (listener) => void endListeners.push(listener),
            },
            tabIcons,
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("shows the unlock page on the toolbar icon of the dApp's tab", async () => {
        const create = vi.spyOn(fakeBrowser.windows, 'create')

        await unlockRequests.request(tab)

        expect(popups.get(tab.tabId)).toBe('popup.html#/unlock')
        expect(await badge()).toBe('!')
        expect(openPopup).toHaveBeenCalledWith({ windowId: tab.windowId })
        expect(create).not.toHaveBeenCalled()
    })

    it('leaves the unlock page on the icon when the toolbar popup cannot open', async () => {
        openPopup.mockRejectedValue(
            new Error('Could not find an active browser window.')
        )

        await unlockRequests.request(tab)

        expect(popups.get(tab.tabId)).toBe('popup.html#/unlock')
    })

    it('points the tab back at the wallet once the vault unlocks', async () => {
        await unlockRequests.request(tab)

        unlockListeners.forEach((listener) => listener())

        await vi.waitFor(expectRestored)
    })

    it('points the tab back at the wallet when the page that asked unloads', async () => {
        await unlockRequests.request(tab)

        endPage(openPage('document-2'))
        expect(popups.get(tab.tabId)).toBe('popup.html#/unlock')
        endPage(tab)

        await vi.waitFor(expectRestored)
    })

    it('shows nothing when the page went while the request waited', async () => {
        endPage(tab)

        await unlockRequests.request(tab)

        expect(setPopup).not.toHaveBeenCalled()
        expect(openPopup).not.toHaveBeenCalled()
    })

    it('keeps the icon for the page that asked last when an older one ends', async () => {
        await unlockRequests.request(tab)
        const next = openPage('document-2')
        await unlockRequests.request(next)

        endPage(tab)
        expect(popups.get(tab.tabId)).toBe('popup.html#/unlock')
        endPage(next)

        await vi.waitFor(expectRestored)
    })

    it('leaves the unlock page on the icon when the tab is not the active one', async () => {
        vi.mocked(fakeBrowser.tabs.get).mockImplementation((async () => ({
            active: false,
        })) as unknown as typeof fakeBrowser.tabs.get)

        await unlockRequests.request(tab)

        expect(popups.get(tab.tabId)).toBe('popup.html#/unlock')
        expect(openPopup).not.toHaveBeenCalled()
    })

    it('forgets a closed tab', async () => {
        await unlockRequests.request(tab)
        setPopup.mockClear()

        await fakeBrowser.tabs.onRemoved.trigger(tab.tabId, {
            windowId: tab.windowId,
            isWindowClosing: false,
        })
        await fakeBrowser.tabs.onUpdated.trigger(
            tab.tabId,
            { status: 'loading' },
            {} as Browser.tabs.Tab
        )
        unlockListeners.forEach((listener) => listener())

        expect(setPopup).not.toHaveBeenCalled()
    })

    it('shows a site approval prompt over the unlock page', async () => {
        const approval = {
            popup: 'popup.html#/approve-site?id=request-1',
            badge: '1',
        }
        await unlockRequests.request(tab)

        await tabIcons.set(tab.tabId, 'site', approval)
        expect(popups.get(tab.tabId)).toBe(approval.popup)
        await unlockRequests.request(tab)
        expect(openPopup).toHaveBeenCalledTimes(2)
        expect(popups.get(tab.tabId)).toBe(approval.popup)
        expect(await badge()).toBe('1')

        await tabIcons.set(tab.tabId, 'site', undefined)
        expect(popups.get(tab.tabId)).toBe('popup.html#/unlock')
        unlockListeners.forEach((listener) => listener())
        await vi.waitFor(expectRestored)
    })

    it('opens nothing without a tab', async () => {
        await unlockRequests.request(undefined)

        expect(popups.size).toBe(0)
        expect(openPopup).not.toHaveBeenCalled()
    })
})
