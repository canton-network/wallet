// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { errorCodes } from '@canton-network/core-rpc-errors'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import { NotificationService } from '@canton-network/core-wallet-services'
import type { Store, Transaction } from '@canton-network/core-wallet-store'
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

import { asPort, type FakePort, fakePort } from '@/__tests__/fake-port.ts'
import { PAGE_PRESENCE_PORT_NAME, txApprovalPortName } from '@/shared/ports.ts'

import { createPagePresence, type PagePresence } from './page-presence.ts'
import type { SessionCheck, SiteApprovalTab } from './site-approval.ts'
import type { WalletStore } from './store/index.ts'
import { createTestWalletStore } from './store/test-store.ts'
import { createTabIcons } from './tab-icon.ts'
import {
    createTxApprovals,
    type TxApprovalRequest,
    type TxApprovals,
} from './tx-approval.ts'
import { VaultLockedError } from './vault/index.ts'

const origin = 'https://dapp.example'
const tab = { tabId: 7, windowId: 3, page: 'document-1' }
const alice = { userId: 'alice', accessToken: 'token-a' }
const sessionId = 'session-a'
const executed = { updateId: 'update-1', completionOffset: 42 }

describe('createTxApprovals', () => {
    let lockListeners: (() => void)[]
    let unlockListeners: (() => void)[]
    let authListeners: ((context: AuthContext | undefined) => void)[]
    let isCurrent: Mock<SessionCheck>
    let notificationService: NotificationService
    let walletStore: WalletStore
    let locked: boolean
    // Alice's view of the store.
    let store: Store
    // The txChanged events of alice's session.
    let events: unknown[]
    let popups: Map<number | undefined, string>
    let openPopup: MockInstance<typeof fakeBrowser.action.openPopup>
    let connectListeners: ((port: Browser.runtime.Port) => void)[]
    let presence: PagePresence
    let approvals: TxApprovals
    let alicePage: FakePort
    let pageTab: SiteApprovalTab
    let counter: number

    const shownId = (tabId = tab.tabId) =>
        new URLSearchParams(popups.get(tabId)?.split('?')[1]).get('id')
    const badge = (tabId = tab.tabId) =>
        fakeBrowser.action.getBadgeText({ tabId })
    const expectRestored = () =>
        vi.waitFor(async () => {
            expect(popups.get(tab.tabId)).toBe('popup.html')
            expect(await badge()).toBe('')
        })
    const notifier = (id = sessionId) => notificationService.getNotifier(id)

    const connectPresence = (frameId = 0, documentId = tab.page) => {
        const port = fakePort(origin, PAGE_PRESENCE_PORT_NAME)
        port.sender = {
            ...port.sender,
            tab: { id: tab.tabId, windowId: tab.windowId } as Browser.tabs.Tab,
            documentId,
            frameId,
        }
        connectListeners.forEach((listener) => listener(asPort(port)))
        return port
    }

    /** Opens the transaction's port from the approval page. */
    const connectPage = (transactionId: string) => {
        const port = fakePort(origin, txApprovalPortName(transactionId))
        port.sender = {
            id: fakeBrowser.runtime.id,
            url: fakeBrowser.runtime.getURL(
                `/popup.html#/approve-transaction?id=${transactionId}`
            ),
        }
        connectListeners.forEach((listener) => listener(asPort(port)))
        return port
    }

    /** Stores a pending transaction, as `prepareExecute` does. */
    async function prepare(
        overrides: Partial<TxApprovalRequest> = {}
    ): Promise<TxApprovalRequest> {
        counter += 1
        const request = {
            transactionId: `tx-${counter}`,
            commandId: `command-${counter}`,
            sessionId,
            auth: alice,
            tab: pageTab,
            ...overrides,
        }
        await store.setTransaction({
            id: request.transactionId,
            commandId: request.commandId,
            status: 'pending',
            preparedTransaction: 'prepared',
            preparedTransactionHash: 'hash',
            origin,
        } satisfies Transaction)
        return request
    }

    /** Prepares a transaction and prompts for it. */
    async function prompt(overrides: Partial<TxApprovalRequest> = {}) {
        const request = await prepare(overrides)
        const { outcome } = await approvals.request(request)
        return { request, outcome }
    }

    const stored = (id: string) => store.getTransaction(id)

    const failedEvent = (commandId: string, code: number) => ({
        status: 'failed',
        commandId,
        error: { code, message: expect.any(String) },
    })

    beforeEach(() => {
        fakeBrowser.reset()
        counter = 0
        lockListeners = []
        unlockListeners = []
        authListeners = []
        isCurrent = vi.fn(async () => true)
        notificationService = new NotificationService()
        walletStore = createTestWalletStore()
        locked = false
        store = walletStore.withAuthContext(alice)
        events = []
        notifier().on('txChanged', (event) => events.push(event))
        popups = new Map()
        vi.spyOn(fakeBrowser.action, 'setPopup').mockImplementation(
            async ({ tabId, popup }) => {
                popups.set(tabId ?? undefined, popup)
            }
        )
        openPopup = vi
            .spyOn(fakeBrowser.action, 'openPopup')
            .mockResolvedValue(undefined)
        connectListeners = []
        vi.spyOn(
            fakeBrowser.runtime.onConnect,
            'addListener'
        ).mockImplementation((listener) => void connectListeners.push(listener))
        vi.spyOn(fakeBrowser.tabs, 'get').mockImplementation((async () => ({
            active: true,
        })) as unknown as typeof fakeBrowser.tabs.get)
        presence = createPagePresence()
        approvals = createTxApprovals({
            vault: {
                onLock: (listener) => void lockListeners.push(listener),
                onUnlock: (listener) => void unlockListeners.push(listener),
            },
            authContext: {
                onChange: (listener) => void authListeners.push(listener),
            },
            presence,
            tabIcons: createTabIcons(),
            isCurrent,
            notificationService,
            getStore: async () => {
                if (locked) throw new VaultLockedError()
                return walletStore
            },
            timeoutMs: 1000,
        })
        alicePage = connectPresence()
        pageTab = {
            ...tab,
            connection: presence.connection(tab.page, origin),
        }
    })

    afterEach(() => {
        lockListeners.forEach((listener) => listener())
        vi.useRealTimers()
        vi.restoreAllMocks()
    })

    it("prompts on the toolbar icon of the dApp's tab", async () => {
        const { request } = await prompt()

        await vi.waitFor(() =>
            expect(openPopup).toHaveBeenCalledWith({ windowId: tab.windowId })
        )
        expect(popups.get(tab.tabId)).toBe(
            `popup.html#/approve-transaction?id=${request.transactionId}`
        )
        expect(await badge()).toBe('1')
    })

    it('resolves with the executed event and closes the page', async () => {
        const { request, outcome } = await prompt()
        const page = connectPage(request.transactionId)

        notifier().emit('txChanged', {
            id: request.transactionId,
            commandId: request.commandId,
            status: 'executed',
            payload: executed,
            preparedTransaction: 'prepared',
        })

        await expect(outcome).resolves.toEqual({
            status: 'executed',
            commandId: request.commandId,
            payload: executed,
        })
        expect(page.disconnect).toHaveBeenCalled()
        await expectRestored()
    })

    it('rejects with 4001 when the user rejects the transaction', async () => {
        const { request, outcome } = await prompt()

        // As `deleteTransaction` emits it.
        notifier().emit('txChanged', {
            status: 'failed',
            commandId: request.commandId,
            error: {
                code: errorCodes.provider.userRejectedRequest,
                message: 'Rejected by the user',
            },
        })

        await expect(outcome).rejects.toMatchObject({
            code: errorCodes.provider.userRejectedRequest,
        })
        await expectRestored()
    })

    it('rejects with the failure of a failed execution', async () => {
        const { request, outcome } = await prompt()

        notifier().emit('txChanged', {
            id: request.transactionId,
            status: 'failed',
            commandId: request.commandId,
            error: {
                code: errorCodes.rpc.transactionRejected,
                message: 'INVALID: no',
            },
        })

        await expect(outcome).rejects.toMatchObject({
            code: errorCodes.rpc.transactionRejected,
            message: 'INVALID: no',
        })
    })

    it('ignores events of another command, transaction or session', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        const { request, outcome } = await prompt()
        const result = vi.fn()
        outcome.then(result, result)
        const success = { status: 'executed', payload: executed }

        notifier().emit('txChanged', { ...success, commandId: 'other' })
        notifier().emit('txChanged', {
            ...success,
            commandId: request.commandId,
            id: 'another-transaction',
        })
        notifier('session-b').emit('txChanged', {
            ...success,
            commandId: request.commandId,
        })
        notifier().emit('txChanged', {
            status: 'signed',
            commandId: request.commandId,
        })
        await vi.advanceTimersByTimeAsync(500)

        expect(result).not.toHaveBeenCalled()
        expect(shownId()).toBe(request.transactionId)
    })

    describe.each([
        [
            'times out',
            errorCodes.provider.userRejectedRequest,
            async () => {
                await vi.advanceTimersByTimeAsync(1000)
            },
        ],
        [
            'the session ends',
            errorCodes.provider.unauthorized,
            async () =>
                authListeners.forEach((listener) => listener(undefined)),
        ],
        [
            'another account signs in',
            errorCodes.provider.unauthorized,
            async () =>
                authListeners.forEach((listener) =>
                    listener({ userId: 'bob', accessToken: 'token-b' })
                ),
        ],
        [
            'the tab closes',
            errorCodes.provider.userRejectedRequest,
            async () =>
                fakeBrowser.tabs.onRemoved.trigger(tab.tabId, {
                    windowId: tab.windowId,
                    isWindowClosing: false,
                }),
        ],
        [
            'the page unloads',
            errorCodes.provider.userRejectedRequest,
            async () => alicePage.remoteDisconnect(),
        ],
        [
            'a new page replaces it in the frame',
            errorCodes.provider.userRejectedRequest,
            async () => void connectPresence(0, 'document-2'),
        ],
    ])('when it %s', (name, code, endIt) => {
        it('rejects, deletes the transaction and reports it failed', async () => {
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
            const { request, outcome } = await prompt()
            const page = connectPage(request.transactionId)

            await endIt()

            await expect(outcome).rejects.toMatchObject({ code })
            expect(page.disconnect).toHaveBeenCalled()
            await vi.waitFor(async () =>
                expect(await stored(request.transactionId)).toBeUndefined()
            )
            expect(events).toContainEqual(failedEvent(request.commandId, code))
            vi.useRealTimers()
            // A closed tab has no icon to restore.
            if (name !== 'the tab closes') await expectRestored()
        })
    })

    it('rejects with 4100 on a lock, and deletes the transaction once unlocked', async () => {
        const { request, outcome } = await prompt()

        locked = true
        lockListeners.forEach((listener) => listener())

        await expect(outcome).rejects.toMatchObject({
            code: errorCodes.provider.unauthorized,
        })
        await vi.waitFor(() =>
            expect(events).toContainEqual(
                failedEvent(request.commandId, errorCodes.provider.unauthorized)
            )
        )
        expect(await stored(request.transactionId)).toBeDefined()
        await expectRestored()

        locked = false
        unlockListeners.forEach((listener) => listener())

        await vi.waitFor(async () =>
            expect(await stored(request.transactionId)).toBeUndefined()
        )
    })

    it('leaves a transaction that is being signed or executed', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        const { request, outcome } = await prompt()
        await store.setTransactionStatus(request.transactionId, 'signed')

        await vi.advanceTimersByTimeAsync(1000)

        await expect(outcome).rejects.toMatchObject({
            code: errorCodes.provider.userRejectedRequest,
        })
        expect(await stored(request.transactionId)).toMatchObject({
            status: 'signed',
        })
        expect(events).toEqual([])
    })

    it.each([
        ['without a tab', () => ({ tab: undefined })],
        [
            'when the page has gone',
            () => {
                alicePage.remoteDisconnect()
                return {}
            },
        ],
    ])('prompts for nothing %s', async (_, setUp) => {
        const request = await prepare(setUp())

        await expect(approvals.request(request)).rejects.toMatchObject({
            code: errorCodes.provider.userRejectedRequest,
        })

        await vi.waitFor(async () =>
            expect(await stored(request.transactionId)).toBeUndefined()
        )
        expect(events).toEqual([
            failedEvent(
                request.commandId,
                errorCodes.provider.userRejectedRequest
            ),
        ])
        expect(popups.size).toBe(0)
        expect(openPopup).not.toHaveBeenCalled()
    })

    it('prompts for nothing when the session is not current', async () => {
        isCurrent.mockResolvedValue(false)
        const request = await prepare()

        await expect(approvals.request(request)).rejects.toMatchObject({
            code: errorCodes.provider.unauthorized,
        })
        await vi.waitFor(async () =>
            expect(await stored(request.transactionId)).toBeUndefined()
        )
        expect(openPopup).not.toHaveBeenCalled()
    })

    it('refuses a second transaction with the same command ID', async () => {
        const first = await prompt({ commandId: 'command-x' })
        const second = await prepare({ commandId: 'command-x' })

        await expect(approvals.request(second)).rejects.toMatchObject({
            code: errorCodes.rpc.invalidParams,
        })

        await vi.waitFor(async () =>
            expect(await stored(second.transactionId)).toBeUndefined()
        )
        // A failed event would end the first one too, for the dApp.
        expect(events).toEqual([])
        expect(await stored(first.request.transactionId)).toBeDefined()
        expect(shownId()).toBe(first.request.transactionId)
    })

    it('shows the newest of two transactions on a tab, then the other', async () => {
        const first = await prompt()
        const second = await prompt()

        await vi.waitFor(async () => expect(await badge()).toBe('2'))
        expect(shownId()).toBe(second.request.transactionId)

        notifier().emit('txChanged', {
            status: 'failed',
            commandId: second.request.commandId,
        })
        await expect(second.outcome).rejects.toBeDefined()

        await vi.waitFor(async () => expect(await badge()).toBe('1'))
        expect(shownId()).toBe(first.request.transactionId)
    })

    it('leaves the transaction pending when the page closes', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        const { request, outcome } = await prompt()
        const result = vi.fn()
        outcome.then(result, result)

        connectPage(request.transactionId).remoteDisconnect()
        await vi.advanceTimersByTimeAsync(500)

        expect(result).not.toHaveBeenCalled()
        expect(await stored(request.transactionId)).toBeDefined()
    })

    it('refuses a port from a content script', async () => {
        const { request } = await prompt()
        const port = fakePort(origin, txApprovalPortName(request.transactionId))

        connectListeners.forEach((listener) => listener(asPort(port)))

        expect(port.disconnect).toHaveBeenCalled()
        expect(shownId()).toBe(request.transactionId)
    })
})
