// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { errorCodes } from '@canton-network/core-rpc-errors'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    type Mock,
    type MockInstance,
    vi,
} from 'vitest'
import type { Browser } from 'wxt/browser'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { fakeAuthContext } from '@/__tests__/fake-auth-context.ts'
import { asPort, type FakePort, fakePort } from '@/__tests__/fake-port.ts'
import { inAnHour, jwt } from '@/__tests__/jwt.ts'
import {
    PAGE_PRESENCE_PORT_NAME,
    siteApprovalPortName,
} from '@/shared/ports.ts'

import { createPagePresence, type PagePresence } from './page-presence.ts'
import {
    createSiteApprovals,
    currentSessionCheck,
    type SessionCheck,
    type SiteApprovalRequest,
    type SiteApprovals,
    type SiteApprovalTab,
} from './site-approval.ts'
import type { ApprovedSiteStore } from './store/approved-sites.ts'
import { createTestWalletStore } from './store/test-store.ts'
import { createTabIcons } from './tab-icon.ts'

const origin = 'https://dapp.example'
const tab = { tabId: 7, windowId: 3, page: 'document-1' }
const pageGone = 'The page that asked for the site was closed or reloaded'

describe('createSiteApprovals', () => {
    let lockListeners: (() => void)[]
    let authListeners: ((context: AuthContext | undefined) => void)[]
    let sites: {
        [K in keyof ApprovedSiteStore]: Mock<ApprovedSiteStore[K]>
    }
    let isCurrent: Mock<SessionCheck>
    // The popup of each tab, as set through `action.setPopup`.
    let popups: Map<number | undefined, string>
    let setPopup: MockInstance<typeof fakeBrowser.action.setPopup>
    let openPopup: MockInstance<typeof fakeBrowser.action.openPopup>
    let connectListeners: ((port: Browser.runtime.Port) => void)[]
    let presence: PagePresence
    let approvals: SiteApprovals
    // The presence port of alice's page, tab 7's document-1.
    let alicePage: FakePort
    let alice: SiteApprovalRequest & { tab: SiteApprovalTab }

    /** The request ID the tab's toolbar icon points at. */
    const shownId = (tabId = tab.tabId) =>
        new URLSearchParams(popups.get(tabId)?.split('?')[1]).get('id')
    /** The request ID of the prompt that opened last. */
    const openedId = async () => {
        await vi.waitFor(() => expect(openPopup).toHaveBeenCalled())
        return shownId()!
    }
    const badge = (tabId = tab.tabId) =>
        fakeBrowser.action.getBadgeText({ tabId })
    const expectRestored = () =>
        vi.waitFor(async () => {
            expect(popups.get(tab.tabId)).toBe('popup.html')
            expect(await badge()).toBe('')
        })
    const signIn = (context?: AuthContext) =>
        authListeners.forEach((listener) => listener(context))
    /** Opens the request's port, from the approval page by default. */
    const connectPage = (
        id: string,
        url = fakeBrowser.runtime.getURL(`/popup.html#/approve-site?id=${id}`)
    ) => {
        const port = fakePort(origin, siteApprovalPortName(id))
        port.sender = { id: fakeBrowser.runtime.id, url }
        connectListeners.forEach((listener) => listener(asPort(port)))
        return port
    }

    /** Opens a content script's presence port, from tab 7 by default. */
    const connectPresence = (
        sender: Partial<Browser.runtime.MessageSender> = {
            tab: { id: tab.tabId, windowId: tab.windowId } as Browser.tabs.Tab,
            documentId: tab.page,
            frameId: 0,
        }
    ) => {
        const port = fakePort(origin, PAGE_PRESENCE_PORT_NAME)
        port.sender = { ...port.sender, ...sender }
        connectListeners.forEach((listener) => listener(asPort(port)))
        return port
    }

    /**
     * Opens the presence port of a page in tab 7, and gives the tab of its
     * requests, as `registerDappService` would.
     */
    const openPage = ({
        documentId = tab.page as string | undefined,
        frameId = 0,
        pageOrigin = origin,
    } = {}) => {
        const port = connectPresence({
            tab: { id: tab.tabId, windowId: tab.windowId } as Browser.tabs.Tab,
            documentId,
            frameId,
            origin: pageOrigin,
            url: `${pageOrigin}/`,
        })
        const page = documentId ?? JSON.stringify([tab.tabId, frameId])
        return {
            port,
            tab: {
                ...tab,
                page,
                connection: presence.connection(page, pageOrigin),
            },
        }
    }

    beforeEach(() => {
        fakeBrowser.reset()
        lockListeners = []
        authListeners = []
        // In memory, like the vault item.
        const granted = new Set<string>()
        const key = (owner: string, site: string) =>
            JSON.stringify([owner, site])
        sites = {
            isApproved: vi.fn(async (owner, site) =>
                granted.has(key(owner, site))
            ),
            approve: vi.fn(async (owner, site) => {
                granted.add(key(owner, site))
            }),
            revoke: vi.fn(async (owner, site) => {
                granted.delete(key(owner, site))
            }),
        }
        isCurrent = vi.fn(async () => true)
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
        connectListeners = []
        // The fake browser doesn't implement runtime.onConnect.
        vi.spyOn(
            fakeBrowser.runtime.onConnect,
            'addListener'
        ).mockImplementation((listener) => void connectListeners.push(listener))
        // The toolbar popup only opens on the active tab.
        vi.spyOn(fakeBrowser.tabs, 'get').mockImplementation((async () => ({
            active: true,
        })) as unknown as typeof fakeBrowser.tabs.get)
        presence = createPagePresence()
        approvals = createSiteApprovals({
            vault: { onLock: (listener) => void lockListeners.push(listener) },
            authContext: {
                onChange: (listener) => void authListeners.push(listener),
            },
            presence,
            tabIcons: createTabIcons(),
            isCurrent,
            sites,
            timeoutMs: 1000,
        })
        const page = openPage()
        alicePage = page.port
        alice = {
            principal: 'alice',
            origin,
            accessToken: 'token-a',
            tab: page.tab,
        }
    })

    afterEach(() => {
        // Settles anything still pending, which clears its timer.
        lockListeners.forEach((listener) => listener())
        vi.useRealTimers()
        vi.restoreAllMocks()
    })

    it('stores the approval and resolves every waiting request', async () => {
        const first = approvals.request(alice)
        const second = approvals.request(alice)
        const id = await openedId()

        await expect(approvals.service.get(id)).resolves.toEqual({ origin })
        await approvals.service.decide(id, true)

        await expect(first).resolves.toBeUndefined()
        await expect(second).resolves.toBeUndefined()
        expect(openPopup).toHaveBeenCalledTimes(1)
        expect(sites.approve).toHaveBeenCalledWith('alice', origin)
        await expect(approvals.service.get(id)).resolves.toBeNull()
    })

    it('rejects with 4001 when the user rejects, and only once', async () => {
        const request = approvals.request(alice)
        const id = await openedId()

        await approvals.service.decide(id, false)

        await expect(request).rejects.toMatchObject({
            code: errorCodes.provider.userRejectedRequest,
        })
        await expect(approvals.service.decide(id, true)).rejects.toThrow(
            'no longer pending'
        )
        expect(sites.approve).not.toHaveBeenCalled()
    })

    it('rejects with 4001 after the timeout', async () => {
        vi.useFakeTimers()
        const request = approvals.request(alice)
        const id = await openedId()

        vi.advanceTimersByTime(1000)

        await expect(request).rejects.toMatchObject({
            code: errorCodes.provider.userRejectedRequest,
            message: 'The site approval timed out',
        })
        await expect(approvals.service.get(id)).resolves.toBeNull()
    })

    it("prompts on the toolbar icon of the dApp's tab", async () => {
        const create = vi.spyOn(fakeBrowser.windows, 'create')

        void approvals.request(alice).catch(() => {})
        const id = await openedId()

        expect(popups.get(tab.tabId)).toBe(`popup.html#/approve-site?id=${id}`)
        expect(await badge()).toBe('1')
        expect(openPopup).toHaveBeenCalledWith({ windowId: tab.windowId })
        expect(
            setPopup.mock.calls.every(([details]) => details.tabId === 7)
        ).toBe(true)
        expect(create).not.toHaveBeenCalled()
    })

    it('leaves the prompt on the icon when the toolbar popup cannot open', async () => {
        openPopup.mockRejectedValue(
            new Error('Could not find an active browser window.')
        )
        const create = vi.spyOn(fakeBrowser.windows, 'create')

        const request = approvals.request(alice)
        await vi.waitFor(() => expect(openPopup).toHaveBeenCalled())
        const id = shownId()!

        expect(create).not.toHaveBeenCalled()
        expect(await badge()).toBe('1')
        await expect(approvals.service.get(id)).resolves.toEqual({ origin })
        await approvals.service.decide(id, true)
        await expect(request).resolves.toBeUndefined()
    })

    it('waits for the timeout without a tab, and opens nothing', async () => {
        vi.useFakeTimers()
        const request = approvals.request({ ...alice, tab: undefined })
        const settled = expect(request).rejects.toMatchObject({
            code: errorCodes.provider.userRejectedRequest,
            message: 'The site approval timed out',
        })
        await vi.advanceTimersByTimeAsync(1000)

        await settled
        expect(setPopup).not.toHaveBeenCalled()
        expect(openPopup).not.toHaveBeenCalled()
    })

    it.each<[string, (id: string) => unknown]>([
        ['approved', (id) => approvals.service.decide(id, true)],
        ['rejected', (id) => approvals.service.decide(id, false)],
        ['timed out', () => vi.advanceTimersByTime(1000)],
        ['cancelled by a lock', () => lockListeners.forEach((l) => l())],
        ['cancelled by a sign-out', () => signIn(undefined)],
    ])(
        'points the tab back at the wallet once the prompt is %s',
        async (_, settle) => {
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
            const request = approvals.request(alice).catch(() => {})
            const id = await openedId()

            await settle(id)
            await request

            await expectRestored()
            expect(
                setPopup.mock.calls.every(([details]) => details.tabId === 7)
            ).toBe(true)
        }
    )

    it('rejects with 4001 when the tab closes', async () => {
        const request = approvals.request(alice)
        const id = await openedId()
        setPopup.mockClear()

        await fakeBrowser.tabs.onRemoved.trigger(tab.tabId, {
            windowId: tab.windowId,
            isWindowClosing: false,
        })

        await expect(request).rejects.toMatchObject({
            code: errorCodes.provider.userRejectedRequest,
        })
        await expect(approvals.service.get(id)).resolves.toBeNull()
        expect(setPopup).not.toHaveBeenCalled()
    })

    it('ignores another tab closing', async () => {
        const request = approvals.request(alice)
        const id = await openedId()

        await fakeBrowser.tabs.onRemoved.trigger(8, {
            windowId: tab.windowId,
            isWindowClosing: false,
        })
        await approvals.service.decide(id, true)

        await expect(request).resolves.toBeUndefined()
    })

    it('keeps the prompt when the tab loads without the page unloading', async () => {
        // Chrome reports `history.pushState` like this.
        const request = approvals.request(alice)
        const id = await openedId()

        await fakeBrowser.tabs.onUpdated.trigger(
            tab.tabId,
            { status: 'loading', url: `${origin}/route` },
            {} as Browser.tabs.Tab
        )

        await expect(approvals.service.get(id)).resolves.toEqual({ origin })
        expect(shownId()).toBe(id)
        expect(alicePage.disconnect).not.toHaveBeenCalled()
        await approvals.service.decide(id, true)
        await expect(request).resolves.toBeUndefined()
    })

    it('rejects with 4001 when the page that asked unloads, and starts afresh', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        const request = approvals.request(alice)
        const id = await openedId()
        // Another document in the same tab, in a frame.
        const widget = openPage({
            documentId: 'document-2',
            frameId: 1,
            pageOrigin: 'https://widget.example',
        })
        const elsewhere = approvals.request({
            ...alice,
            origin: 'https://widget.example',
            tab: widget.tab,
        })
        await vi.waitFor(() => expect(openPopup).toHaveBeenCalledTimes(2))
        const laterId = shownId()!
        vi.advanceTimersByTime(600)

        alicePage.remoteDisconnect()

        await expect(request).rejects.toMatchObject({
            code: errorCodes.provider.userRejectedRequest,
            message: pageGone,
        })
        await expect(approvals.service.get(id)).resolves.toBeNull()
        await vi.waitFor(() => expect(shownId()).toBe(laterId))
        expect(await badge()).toBe('1')
        await approvals.service.decide(laterId, true)
        await expect(elsewhere).resolves.toBeUndefined()
        await expectRestored()

        // The reloaded page's connect gets its own prompt and full timeout.
        openPopup.mockClear()
        const reloaded = openPage({ documentId: 'document-3' })
        const again = approvals.request({ ...alice, tab: reloaded.tab })
        const againId = await openedId()
        expect(againId).not.toBe(id)
        let settled = false
        again.catch(() => {}).finally(() => (settled = true))
        vi.advanceTimersByTime(999)
        await Promise.resolve()
        expect(settled).toBe(false)
        vi.advanceTimersByTime(1)
        await expect(again).rejects.toMatchObject({
            message: 'The site approval timed out',
        })
    })

    it('keys a page by tab and frame without a documentId', async () => {
        const top = openPage({ documentId: undefined })
        const request = approvals.request({ ...alice, tab: top.tab })
        const id = await openedId()
        const subframe = openPage({ documentId: undefined, frameId: 2 })

        subframe.port.remoteDisconnect()
        await expect(approvals.service.get(id)).resolves.toEqual({ origin })
        top.port.remoteDisconnect()

        await expect(request).rejects.toMatchObject({
            code: errorCodes.provider.userRejectedRequest,
        })
        await expectRestored()
    })

    it('refuses a presence port from an extension page', async () => {
        const request = approvals.request(alice)
        const id = await openedId()

        const port = connectPresence({
            id: fakeBrowser.runtime.id,
            origin: undefined,
            url: fakeBrowser.runtime.getURL('/popup.html'),
            tab: { id: tab.tabId, windowId: tab.windowId } as Browser.tabs.Tab,
            documentId: tab.page,
        })
        expect(port.disconnect).toHaveBeenCalled()
        port.remoteDisconnect()

        expect(alice.tab.connection?.live).toBe(true)
        await approvals.service.decide(id, true)
        await expect(request).resolves.toBeUndefined()
    })

    it('prompts for nothing when the page goes while the session is checked', async () => {
        let checked!: (current: boolean) => void
        isCurrent.mockImplementationOnce(
            () => new Promise((resolve) => (checked = resolve))
        )

        const request = approvals.request(alice)
        await vi.waitFor(() => expect(checked).toBeDefined())
        alicePage.remoteDisconnect()
        checked(true)

        await expect(request).rejects.toMatchObject({
            code: errorCodes.provider.userRejectedRequest,
            message: pageGone,
        })
        expect(setPopup).not.toHaveBeenCalled()
        expect(openPopup).not.toHaveBeenCalled()
    })

    it.each([
        ['with a documentId', 'document-2', origin],
        ['by tab and frame', undefined, origin],
        [
            'by tab and frame, from another origin',
            undefined,
            'https://other.example',
        ],
    ])(
        'gives a new page in the same frame (%s) a prompt of its own, whichever event comes first',
        async (_, documentId, nextOrigin) => {
            for (const order of ['new page first', 'old page first']) {
                openPopup.mockClear()
                const old = documentId
                    ? openPage()
                    : openPage({ documentId: undefined })
                const first = approvals.request({ ...alice, tab: old.tab })
                const firstId = await openedId()

                if (order === 'old page first') old.port.remoteDisconnect()
                const next = openPage({ documentId, pageOrigin: nextOrigin })

                await expect(first).rejects.toMatchObject({
                    code: errorCodes.provider.userRejectedRequest,
                    message: pageGone,
                })
                openPopup.mockClear()
                const second = approvals.request({
                    ...alice,
                    origin: nextOrigin,
                    tab: next.tab,
                })
                const secondId = await openedId()
                expect(secondId).not.toBe(firstId)
                // The old page's disconnect comes late, and is ignored.
                if (order === 'new page first') old.port.remoteDisconnect()

                expect(next.tab.connection?.live).toBe(true)
                await expect(approvals.service.get(secondId)).resolves.toEqual({
                    origin: nextOrigin,
                })
                expect(shownId()).toBe(secondId)
                await approvals.service.decide(secondId, true)
                await expect(second).resolves.toBeUndefined()
            }
        }
    )

    it('binds a request only to a page of its own origin', () => {
        const old = openPage({ documentId: undefined })
        openPage({ documentId: undefined, pageOrigin: 'https://other.example' })

        expect(old.tab.connection?.live).toBe(false)
        expect(presence.connection(old.tab.page, origin)).toBeUndefined()
    })

    it('does not make a request with a tab wait on a prompt without one', async () => {
        void approvals.request({ ...alice, tab: undefined }).catch(() => {})
        const request = approvals.request(alice)

        const id = await openedId()
        await approvals.service.decide(id, true)
        await expect(request).resolves.toBeUndefined()
    })

    it('leaves the prompt on the icon without an openPopup method', async () => {
        // Older browsers have no action.openPopup.
        const action = fakeBrowser.action as { openPopup?: unknown }
        const original = action.openPopup
        action.openPopup = undefined
        try {
            const request = approvals.request(alice)
            await vi.waitFor(async () => expect(await badge()).toBe('1'))
            const id = shownId()!

            await approvals.service.decide(id, true)
            await expect(request).resolves.toBeUndefined()
        } finally {
            action.openPopup = original
        }
    })

    it('leaves the prompt on the icon when the tab is not the active one', async () => {
        vi.mocked(fakeBrowser.tabs.get).mockImplementation((async () => ({
            active: false,
        })) as unknown as typeof fakeBrowser.tabs.get)

        const request = approvals.request(alice)
        await vi.waitFor(() => expect(fakeBrowser.tabs.get).toHaveBeenCalled())
        const id = shownId()!

        expect(openPopup).not.toHaveBeenCalled()
        expect(await badge()).toBe('1')
        await approvals.service.decide(id, true)
        await expect(request).resolves.toBeUndefined()
    })

    it('shows the prompt again after an update that loads nothing', async () => {
        void approvals.request(alice).catch(() => {})
        const id = await openedId()
        // As if something had cleared the tab's popup and badge.
        popups.set(tab.tabId, 'popup.html')
        await fakeBrowser.action.setBadgeText({ tabId: tab.tabId, text: '' })

        await fakeBrowser.tabs.onUpdated.trigger(
            tab.tabId,
            { url: `${origin}/next` },
            {} as Browser.tabs.Tab
        )

        await vi.waitFor(() => expect(shownId()).toBe(id))
        expect(await badge()).toBe('1')
        await expect(approvals.service.get(id)).resolves.toEqual({ origin })
    })

    it('shows the newest of two prompts on a tab, then the other', async () => {
        const first = approvals.request(alice)
        const firstId = await openedId()
        const second = approvals.request({
            ...alice,
            origin: 'https://widget.example',
        })
        await vi.waitFor(() => expect(openPopup).toHaveBeenCalledTimes(2))
        const secondId = shownId()!

        expect(secondId).not.toBe(firstId)
        expect(await badge()).toBe('2')

        await approvals.service.decide(secondId, true)
        await vi.waitFor(() => expect(shownId()).toBe(firstId))
        expect(await badge()).toBe('1')

        await approvals.service.decide(firstId, false)
        await expectRestored()
        await expect(second).resolves.toBeUndefined()
        await expect(first).rejects.toMatchObject({
            code: errorCodes.provider.userRejectedRequest,
        })
    })

    it('leaves the request pending when the page closes', async () => {
        const request = approvals.request(alice)
        const id = await openedId()
        const port = connectPage(id)

        port.remoteDisconnect()

        await expect(approvals.service.get(id)).resolves.toEqual({ origin })
        expect(shownId()).toBe(id)
        await approvals.service.decide(id, true)
        await expect(request).resolves.toBeUndefined()
    })

    it('refuses a port from a content script', async () => {
        const request = approvals.request(alice).catch(() => {})
        const id = await openedId()

        const port = connectPage(id, `${origin}/`)
        expect(port.disconnect).toHaveBeenCalledTimes(1)
        signIn(undefined)
        await request

        // Not attached to the prompt, so its cancellation didn't reach it.
        expect(port.disconnect).toHaveBeenCalledTimes(1)
    })

    it('keeps an approval that is being saved when the tab closes', async () => {
        const request = approvals.request(alice)
        const id = await openedId()
        const approve = sites.approve.getMockImplementation()!
        let saved!: () => void
        sites.approve.mockImplementationOnce(async (owner, site) => {
            await new Promise<void>((resolve) => (saved = resolve))
            await approve(owner, site)
        })

        const decided = approvals.service.decide(id, true)
        await vi.waitFor(() => expect(saved).toBeDefined())
        await fakeBrowser.tabs.onRemoved.trigger(tab.tabId, {
            windowId: tab.windowId,
            isWindowClosing: false,
        })
        saved()

        await expect(decided).resolves.toBeUndefined()
        await expect(request).resolves.toBeUndefined()
        expect(await sites.isApproved('alice', origin)).toBe(true)
        expect(sites.revoke).not.toHaveBeenCalled()
    })

    it('rejects with 4100 when the vault locks', async () => {
        const request = approvals.request(alice)
        await openedId()

        lockListeners.forEach((listener) => listener())

        await expect(request).rejects.toMatchObject({
            code: errorCodes.provider.unauthorized,
        })
    })

    it('asks again for another principal', async () => {
        void approvals.request(alice).catch(() => {})
        void approvals
            .request({ ...alice, principal: 'bob', accessToken: 'token-b' })
            .catch(() => {})

        await vi.waitFor(() => expect(openPopup).toHaveBeenCalledTimes(2))
    })

    it('does not prompt for a session that is not current', async () => {
        isCurrent.mockResolvedValue(false)

        await expect(approvals.request(alice)).rejects.toMatchObject({
            code: errorCodes.provider.unauthorized,
        })
        expect(setPopup).not.toHaveBeenCalled()
    })

    it.each([
        ['signs out', undefined],
        ['switches account', { userId: 'bob', accessToken: 'token-b' }],
    ])(
        'cancels the prompt when the user %s, and a late answer writes nothing',
        async (_, context) => {
            const request = approvals.request(alice)
            const id = await openedId()

            signIn(context)

            await expect(request).rejects.toMatchObject({
                code: errorCodes.provider.unauthorized,
            })
            await expect(approvals.service.decide(id, true)).rejects.toThrow(
                'no longer pending'
            )
            expect(sites.approve).not.toHaveBeenCalled()
        }
    )

    it('keeps the prompt when the same token is stored again', async () => {
        const request = approvals.request(alice)
        const id = await openedId()

        signIn({ userId: 'alice', accessToken: alice.accessToken })
        await approvals.service.decide(id, true)

        await expect(request).resolves.toBeUndefined()
    })

    it('writes no approval when the session ended before the answer', async () => {
        const request = approvals.request(alice)
        const id = await openedId()
        isCurrent.mockResolvedValue(false)

        await expect(approvals.service.decide(id, true)).rejects.toThrow(
            'has ended'
        )

        await expect(request).rejects.toMatchObject({
            code: errorCodes.provider.unauthorized,
        })
        expect(sites.approve).not.toHaveBeenCalled()
    })

    it('writes no approval when another user signs in while the answer is checked', async () => {
        const request = approvals.request(alice)
        const id = await openedId()
        let checked!: (current: boolean) => void
        // The check read the old session, then the switch lands.
        isCurrent.mockImplementationOnce(
            () => new Promise((resolve) => (checked = resolve))
        )
        isCurrent.mockResolvedValue(false)

        const decided = approvals.service.decide(id, true)
        await vi.waitFor(() => expect(checked).toBeDefined())
        signIn({ userId: 'bob', accessToken: 'token-b' })
        checked(true)

        await expect(decided).rejects.toThrow('has ended')
        await expect(request).rejects.toMatchObject({
            code: errorCodes.provider.unauthorized,
        })
        expect(await sites.isApproved('alice', origin)).toBe(false)
    })

    it('undoes the approval when another user signs in during its write', async () => {
        const request = approvals.request(alice)
        const id = await openedId()
        const approve = sites.approve.getMockImplementation()!
        sites.approve.mockImplementationOnce(async (owner, site) => {
            await approve(owner, site)
            isCurrent.mockResolvedValue(false)
            signIn({ userId: 'bob', accessToken: 'token-b' })
        })

        await expect(approvals.service.decide(id, true)).rejects.toThrow(
            'has ended'
        )
        await expect(request).rejects.toMatchObject({
            code: errorCodes.provider.unauthorized,
        })
        expect(sites.approve).toHaveBeenCalled()
        expect(await sites.isApproved('alice', origin)).toBe(false)
    })

    it('closes the approval page when the prompt is cancelled', async () => {
        const request = approvals.request(alice).catch(() => {})
        const port = connectPage(await openedId())

        signIn(undefined)
        await request

        expect(port.disconnect).toHaveBeenCalled()
    })

    it('closes a page that connects after its prompt was cancelled', async () => {
        const request = approvals.request(alice).catch(() => {})
        const id = await openedId()

        signIn(undefined)
        await request
        const port = connectPage(id)

        expect(port.disconnect).toHaveBeenCalled()
    })
})

describe('currentSessionCheck', () => {
    beforeEach(() => {
        fakeBrowser.reset()
        vi.spyOn(
            fakeBrowser.runtime.onConnect,
            'addListener'
        ).mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    async function signedIn(accessToken: string) {
        const context = { userId: 'alice', accessToken }
        const store = createTestWalletStore().withAuthContext(context)
        await store.setSession({
            id: 'session-1',
            origin: 'browserext',
            network: 'canton:local-oauth',
            accessToken,
        })
        return currentSessionCheck(async () => store, fakeAuthContext(context))
    }

    it("accepts the signed-in user's unexpired token with a session", async () => {
        const token = jwt({ iss: 'idp', sub: 'alice', exp: inAnHour() })

        await expect((await signedIn(token))(token)).resolves.toBe(true)
    })

    it('refuses an expired token, even with a session', async () => {
        const token = jwt({ iss: 'idp', sub: 'alice', exp: 1 })

        await expect((await signedIn(token))(token)).resolves.toBe(false)
    })

    it('refuses a token that is not the signed-in one', async () => {
        const token = jwt({ iss: 'idp', sub: 'alice', exp: inAnHour() })
        const check = await signedIn(token)

        await expect(
            check(jwt({ iss: 'idp', sub: 'bob', exp: inAnHour() }))
        ).resolves.toBe(false)
    })

    it('gives an expired session no prompt and no grant', async () => {
        const token = jwt({ iss: 'idp', sub: 'alice', exp: 1 })
        const approve = vi.fn<ApprovedSiteStore['approve']>()
        const setPopup = vi.spyOn(fakeBrowser.action, 'setPopup')
        const approvals = createSiteApprovals({
            vault: { onLock: () => {} },
            authContext: { onChange: () => {} },
            presence: { onEnd: () => {} },
            tabIcons: createTabIcons(),
            isCurrent: await signedIn(token),
            sites: { approve, isApproved: vi.fn(), revoke: vi.fn() },
        })

        await expect(
            approvals.request({
                principal: 'alice',
                origin,
                accessToken: token,
                tab: {
                    ...tab,
                    connection: { page: tab.page, origin, live: true },
                },
            })
        ).rejects.toMatchObject({ code: errorCodes.provider.unauthorized })
        expect(setPopup).not.toHaveBeenCalled()
        expect(approve).not.toHaveBeenCalled()
    })
})
