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
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { createTabIcons, openTabPopup } from './tab-icon.ts'

const prompt = { popup: 'popup.html#/approve-site?id=request-1', badge: '1' }

const overriddenTabs = async () =>
    (await fakeBrowser.storage.session.get('overriddenTabs')).overriddenTabs

describe('createTabIcons', () => {
    // The popup of each tab, as set through `action.setPopup`.
    let popups: Map<number | undefined, string>

    beforeEach(() => {
        fakeBrowser.reset()
        popups = new Map()
        // The fake browser doesn't implement setPopup.
        vi.spyOn(fakeBrowser.action, 'setPopup').mockImplementation(
            async ({ tabId, popup }) => {
                popups.set(tabId ?? undefined, popup)
            }
        )
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('records the tabs whose icon it changed', async () => {
        const tabIcons = createTabIcons()

        await tabIcons.set(7, 'approval', prompt)
        await vi.waitFor(async () =>
            expect(await overriddenTabs()).toEqual([7])
        )
        await tabIcons.set(7, 'approval', undefined)

        await vi.waitFor(async () => expect(await overriddenTabs()).toEqual([]))
    })

    it("resets the icons the previous worker left, but not a new request's", async () => {
        // The browser kept these across a worker restart.
        await fakeBrowser.storage.session.set({ overriddenTabs: [7, 9] })
        popups.set(7, 'popup.html#/unlock')
        popups.set(9, 'popup.html#/approve-site?id=old')
        await fakeBrowser.action.setBadgeText({ tabId: 7, text: '!' })
        await fakeBrowser.action.setBadgeText({ tabId: 9, text: '1' })

        const tabIcons = createTabIcons()
        // A request that wakes the worker sets its tab's icon right away.
        void tabIcons.set(9, 'approval', prompt)

        await vi.waitFor(async () => {
            expect(popups.get(7)).toBe('popup.html')
            expect(await fakeBrowser.action.getBadgeText({ tabId: 7 })).toBe('')
            expect(await overriddenTabs()).toEqual([9])
        })
        expect(popups.get(9)).toBe(prompt.popup)
        expect(await fakeBrowser.action.getBadgeText({ tabId: 9 })).toBe('1')
    })
})

describe('openTabPopup', () => {
    let openPopup: MockInstance<typeof fakeBrowser.action.openPopup>
    let active: boolean

    beforeEach(() => {
        fakeBrowser.reset()
        active = true
        openPopup = vi
            .spyOn(fakeBrowser.action, 'openPopup')
            .mockResolvedValue(undefined)
        vi.spyOn(fakeBrowser.tabs, 'get').mockImplementation((async () => ({
            active,
        })) as unknown as typeof fakeBrowser.tabs.get)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("opens the popup of the active tab's window", async () => {
        await openTabPopup(7, 3)

        expect(openPopup).toHaveBeenCalledWith({ windowId: 3 })
    })

    it('opens nothing for a tab that is not the active one', async () => {
        active = false

        await openTabPopup(7, 3)

        expect(openPopup).not.toHaveBeenCalled()
    })

    it('settles without an openPopup method', async () => {
        const action = fakeBrowser.action as { openPopup?: unknown }
        const original = action.openPopup
        action.openPopup = undefined
        try {
            await expect(openTabPopup(7, 3)).resolves.toBeUndefined()
        } finally {
            action.openPopup = original
        }
    })

    it.each([
        [
            'throws',
            () => {
                throw new Error('openPopup is not available')
            },
        ],
        [
            'rejects',
            () => Promise.reject(new Error('Could not find an active window')),
        ],
    ])('settles when openPopup %s', async (_, fail) => {
        openPopup.mockImplementation(fail as never)

        await expect(openTabPopup(7, 3)).resolves.toBeUndefined()
    })

    it('settles when the tab has closed', async () => {
        vi.mocked(fakeBrowser.tabs.get).mockRejectedValue(
            new Error('No tab with id: 7')
        )

        await expect(openTabPopup(7, 3)).resolves.toBeUndefined()
        expect(openPopup).not.toHaveBeenCalled()
    })
})
