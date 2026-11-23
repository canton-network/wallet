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

import { createTabIcons, type TabIcons } from './tab-icon.ts'
import { createUnlockRequests, type UnlockRequests } from './unlock-request.ts'

const tab = { tabId: 7, windowId: 3, page: 'document-1' }

describe('createUnlockRequests', () => {
    let unlockListeners: (() => void)[]
    let unloadListeners: ((page: string) => void)[]
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

    beforeEach(() => {
        fakeBrowser.reset()
        unlockListeners = []
        unloadListeners = []
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
        tabIcons = createTabIcons()
        unlockRequests = createUnlockRequests({
            vault: {
                onUnlock: (listener) => void unlockListeners.push(listener),
            },
            presence: {
                onUnload: (listener) => void unloadListeners.push(listener),
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

        unloadListeners.forEach((listener) => listener('document-2'))
        expect(popups.get(tab.tabId)).toBe('popup.html#/unlock')
        unloadListeners.forEach((listener) => listener(tab.page))

        await vi.waitFor(expectRestored)
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

        await tabIcons.set(tab.tabId, 'approval', approval)
        expect(popups.get(tab.tabId)).toBe(approval.popup)
        await unlockRequests.request(tab)
        expect(openPopup).toHaveBeenCalledTimes(2)
        expect(popups.get(tab.tabId)).toBe(approval.popup)
        expect(await badge()).toBe('1')

        await tabIcons.set(tab.tabId, 'approval', undefined)
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
