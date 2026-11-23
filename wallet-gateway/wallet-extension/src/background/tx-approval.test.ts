// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { errorCodes } from '@canton-network/core-rpc-errors'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import {
    LOGOUT_EVENT,
    NotificationService,
} from '@canton-network/core-wallet-services'
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

import type { TransactionSubmitter } from './controllers/user/transactions.ts'
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
const party = 'alice::1220'
const executed = { updateId: 'update-1', completionOffset: 42 }
const signature = {
    status: 'signed' as const,
    partyId: party,
    signature: 'signature',
    signedBy: 'namespace',
}

describe('createTxApprovals', () => {
    let lockListeners: (() => void)[]
    let unlockListeners: (() => void)[]
    let authListeners: ((context: AuthContext | undefined) => void)[]
    let isCurrent: Mock<SessionCheck>
    let sign: Mock<TransactionSubmitter['sign']>
    let execute: Mock<TransactionSubmitter['execute']>
    let notificationService: NotificationService
    let walletStore: WalletStore
    let locked: boolean
    let vaultReady: () => void
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

    const expectRestored = () =>
        vi.waitFor(async () => {
            expect(popups.get(tab.tabId)).toBe('popup.html')
            expect(await fakeBrowser.action.getBadgeText({ tabId: 7 })).toBe('')
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

    const nextRequest = (
        overrides: Partial<TxApprovalRequest> = {}
    ): TxApprovalRequest => {
        counter += 1
        return {
            transactionId: `tx-${counter}`,
            commandId: `command-${counter}`,
            sessionId,
            auth: alice,
            origin,
            tab: pageTab,
            ...overrides,
        }
    }

    /** Stores a pending transaction, as `prepareExecute` does. */
    const storeTransaction = (
        request: Pick<TxApprovalRequest, 'transactionId' | 'commandId'>,
        status: Transaction['status'] = 'pending'
    ) =>
        store.setTransaction({
            id: request.transactionId,
            commandId: request.commandId,
            status,
            preparedTransaction: 'prepared',
            preparedTransactionHash: 'hash',
            payload: { actAs: [party] },
            origin,
        } satisfies Transaction)

    /** Begins, prepares and prompts for a transaction, as the dApp API does. */
    async function prompt(overrides: Partial<TxApprovalRequest> = {}) {
        const request = nextRequest(overrides)
        const approval = approvals.begin(request)
        await storeTransaction(request)
        await approval.prompt()
        return { request, outcome: approval.outcome }
    }

    const stored = (id: string) => store.getTransaction(id)

    const failedEvent = (
        { transactionId, commandId }: TxApprovalRequest,
        code: number
    ) => ({
        status: 'failed',
        commandId,
        error: { code, message: expect.any(String) },
        id: transactionId,
        origin,
    })

    function create() {
        return createTxApprovals({
            vault: {
                ready: new Promise<void>((resolve) => (vaultReady = resolve)),
                status: () => (locked ? 'locked' : 'unlocked'),
                onLock: (listener) => void lockListeners.push(listener),
                onUnlock: (listener) => void unlockListeners.push(listener),
            },
            authContext: {
                load: async () => alice,
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
            submitter: { sign, execute },
            timeoutMs: 1000,
        })
    }

    beforeEach(() => {
        fakeBrowser.reset()
        counter = 0
        lockListeners = []
        unlockListeners = []
        authListeners = []
        isCurrent = vi.fn(async () => true)
        sign = vi.fn(async (store, _context, _session, { transactionId }) => {
            await store.setTransactionSigned(transactionId, new Date())
            return signature
        })
        execute = vi.fn(
            async (store, _context, _session, { transactionId }) => {
                await store.setTransactionStatus(transactionId, 'executed')
                return executed
            }
        )
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
        approvals = create()
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

    it('reports it pending, prompts on the tab, then signs and executes on approval', async () => {
        const { request, outcome } = await prompt()
        await vi.waitFor(() =>
            expect(openPopup).toHaveBeenCalledWith({ windowId: tab.windowId })
        )
        expect(popups.get(tab.tabId)).toBe(
            `popup.html#/approve-transaction?id=${request.transactionId}`
        )
        expect(events).toEqual([
            {
                status: 'pending',
                commandId: request.commandId,
                id: request.transactionId,
                origin,
            },
        ])

        await approvals.service.decide(request.transactionId, true)

        await expect(outcome).resolves.toEqual({
            status: 'executed',
            commandId: request.commandId,
            payload: executed,
        })
        const params = { transactionId: request.transactionId, partyId: party }
        expect(sign).toHaveBeenCalledWith(
            expect.anything(),
            alice,
            sessionId,
            params
        )
        expect(execute).toHaveBeenCalledWith(
            expect.anything(),
            alice,
            sessionId,
            params
        )
        await expectRestored()
    })

    it('deletes the transaction and rejects with 4001 when the user rejects it', async () => {
        const { request, outcome } = await prompt()

        await approvals.service.decide(request.transactionId, false)

        await expect(outcome).rejects.toMatchObject({
            code: errorCodes.provider.userRejectedRequest,
        })
        expect(await stored(request.transactionId)).toBeUndefined()
        expect(events).toContainEqual(
            failedEvent(request, errorCodes.provider.userRejectedRequest)
        )
        expect(sign).not.toHaveBeenCalled()
    })

    it('rejects with the failure when the ledger rejects it', async () => {
        execute.mockImplementation(async (store, _c, _s, { transactionId }) => {
            await store.setTransactionStatus(transactionId, 'failed')
            throw new Error('Ledger rejected submission INVALID: no')
        })
        const { request, outcome } = await prompt()

        await expect(
            approvals.service.decide(request.transactionId, true)
        ).rejects.toMatchObject({ code: errorCodes.rpc.transactionRejected })
        await expect(outcome).rejects.toMatchObject({
            code: errorCodes.rpc.transactionRejected,
            message: 'Ledger rejected submission INVALID: no',
        })
    })

    it('reports an unknown outcome, not a rejection, when the submission is not confirmed', async () => {
        execute.mockRejectedValue(new Error('Ledger did not confirm'))
        const { request, outcome } = await prompt()

        await expect(
            approvals.service.decide(request.transactionId, true)
        ).rejects.toBeDefined()

        await expect(outcome).rejects.toMatchObject({
            code: errorCodes.rpc.internal,
        })
        expect(await stored(request.transactionId)).toMatchObject({
            status: 'signed',
        })
    })

    it.each([
        [
            'times out',
            errorCodes.provider.userRejectedRequest,
            async () => {
                await vi.advanceTimersByTimeAsync(1000)
            },
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
            'the session signs out',
            errorCodes.provider.unauthorized,
            async () =>
                authListeners.forEach((listener) => listener(undefined)),
        ],
        [
            'its session is replaced with the same token',
            errorCodes.provider.unauthorized,
            async () => void notifier().emit(LOGOUT_EVENT),
        ],
    ])(
        'rejects, deletes the transaction and reports it failed when it %s',
        async (_, code, endIt) => {
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
            const { request, outcome } = await prompt()
            const page = connectPage(request.transactionId)

            await endIt()

            await expect(outcome).rejects.toMatchObject({ code })
            expect(page.disconnect).toHaveBeenCalled()
            await vi.waitFor(async () =>
                expect(await stored(request.transactionId)).toBeUndefined()
            )
            expect(events).toContainEqual(failedEvent(request, code))
            await expect(
                approvals.service.decide(request.transactionId, true)
            ).rejects.toThrow('no longer waiting')
            expect(sign).not.toHaveBeenCalled()
        }
    )

    it('times out from the request, while the transaction is still prepared', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        const request = nextRequest()
        const approval = approvals.begin(request)

        await vi.advanceTimersByTimeAsync(1000)

        await expect(approval.outcome).rejects.toMatchObject({
            code: errorCodes.provider.userRejectedRequest,
        })
        await storeTransaction(request)
        await expect(approval.prompt()).rejects.toMatchObject({
            code: errorCodes.provider.userRejectedRequest,
        })
        expect(await stored(request.transactionId)).toBeUndefined()
        expect(events).toEqual([])
        expect(openPopup).not.toHaveBeenCalled()
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
                failedEvent(request, errorCodes.provider.unauthorized)
            )
        )
        expect(await stored(request.transactionId)).toBeDefined()

        locked = false
        unlockListeners.forEach((listener) => listener())

        await vi.waitFor(async () =>
            expect(await stored(request.transactionId)).toBeUndefined()
        )
    })

    it('lets no other ending interrupt a decision', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        let finishSigning!: () => void
        const signing = new Promise<void>(
            (resolve) => (finishSigning = resolve)
        )
        sign.mockImplementation(async (store, _c, _s, { transactionId }) => {
            await signing
            await store.setTransactionSigned(transactionId, new Date())
            return signature
        })
        const { request, outcome } = await prompt()
        const result = vi.fn()
        outcome.then(result, result)

        const decided = approvals.service.decide(request.transactionId, true)
        await vi.advanceTimersByTimeAsync(1000)
        alicePage.remoteDisconnect()
        fakeBrowser.tabs.onRemoved.trigger(tab.tabId, {
            windowId: tab.windowId,
            isWindowClosing: false,
        })
        lockListeners.forEach((listener) => listener())
        await vi.advanceTimersByTimeAsync(0)

        expect(result).not.toHaveBeenCalled()
        expect(await stored(request.transactionId)).toBeDefined()
        await expect(
            approvals.service.decide(request.transactionId, false)
        ).rejects.toThrow('no longer waiting')

        finishSigning()
        await decided
        await expect(outcome).resolves.toMatchObject({ status: 'executed' })
        expect(events).not.toContainEqual(
            expect.objectContaining({ status: 'failed' })
        )
    })

    it('refuses to decide a transaction it has no waiting prompt for', async () => {
        const orphan = nextRequest()
        await storeTransaction(orphan)

        await expect(
            approvals.service.decide(orphan.transactionId, true)
        ).rejects.toThrow('no longer waiting')
        await expect(approvals.service.get(orphan.transactionId)).resolves.toBe(
            null
        )
        expect(sign).not.toHaveBeenCalled()
        expect(await stored(orphan.transactionId)).toMatchObject({
            status: 'pending',
        })
    })

    it('ends with 4100 and signs nothing when the session is no longer current', async () => {
        const { request, outcome } = await prompt()
        isCurrent.mockResolvedValue(false)

        await expect(
            approvals.service.decide(request.transactionId, true)
        ).rejects.toMatchObject({ code: errorCodes.provider.unauthorized })

        expect(isCurrent).toHaveBeenLastCalledWith(alice.accessToken, sessionId)
        await expect(outcome).rejects.toMatchObject({
            code: errorCodes.provider.unauthorized,
        })
        expect(sign).not.toHaveBeenCalled()
        expect(await stored(request.transactionId)).toBeUndefined()
    })

    it('refuses a second request with the same command ID, even from a page that has gone', async () => {
        const first = await prompt({ commandId: 'command-x' })
        const result = vi.fn()
        first.outcome.then(result, result)
        const deadTab = { ...pageTab, connection: undefined }

        expect(() =>
            approvals.begin(
                nextRequest({ commandId: 'command-x', tab: deadTab })
            )
        ).toThrow(
            expect.objectContaining({ code: errorCodes.rpc.invalidParams })
        )

        await new Promise((resolve) => setTimeout(resolve, 0))
        expect(result).not.toHaveBeenCalled()
        expect(events).toEqual([
            {
                status: 'pending',
                commandId: 'command-x',
                id: first.request.transactionId,
                origin,
            },
        ])
        await expect(
            approvals.service.get(first.request.transactionId)
        ).resolves.toMatchObject({ id: first.request.transactionId })
    })

    it('deletes pending transactions without a prompt on unlock and at start-up, and keeps signed ones', async () => {
        const live = await prompt()
        const orphan = nextRequest()
        const signed = nextRequest()
        await storeTransaction(orphan)
        await storeTransaction(signed, 'signed')

        unlockListeners.forEach((listener) => listener())

        await vi.waitFor(async () =>
            expect(await stored(orphan.transactionId)).toBeUndefined()
        )
        expect(await stored(signed.transactionId)).toBeDefined()
        expect(await stored(live.request.transactionId)).toBeDefined()

        // A new worker, started while unlocked.
        const restarted = nextRequest()
        await storeTransaction(restarted)
        create()
        vaultReady()
        await vi.waitFor(async () =>
            expect(await stored(restarted.transactionId)).toBeUndefined()
        )
        expect(events).not.toContainEqual(
            expect.objectContaining({ status: 'failed' })
        )
    })
})
