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
    vi,
} from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { fakeAuthContext } from '@/__tests__/fake-auth-context.ts'
import { inAnHour, jwt } from '@/__tests__/jwt.ts'

import {
    createSiteApprovals,
    currentSessionCheck,
    type SessionCheck,
    type SiteApprovals,
} from './site-approval.ts'
import type { ApprovedSiteStore } from './store/approved-sites.ts'
import { createTestWalletStore } from './store/test-store.ts'

const origin = 'https://dapp.example'
const windowId = 42
const alice = { principal: 'alice', origin, accessToken: 'token-a' }

describe('createSiteApprovals', () => {
    let lockListeners: (() => void)[]
    let authListeners: ((context: AuthContext | undefined) => void)[]
    let sites: {
        [K in keyof ApprovedSiteStore]: Mock<ApprovedSiteStore[K]>
    }
    let isCurrent: Mock<SessionCheck>
    let open: Mock<(path: string) => Promise<number>>
    let approvals: SiteApprovals

    /** The request ID from the path of the page that was opened last. */
    const openedId = async () => {
        await vi.waitFor(() => expect(open).toHaveBeenCalled())
        const path = open.mock.lastCall![0]
        return new URLSearchParams(path.split('?')[1]).get('id')!
    }
    const signIn = (context?: AuthContext) =>
        authListeners.forEach((listener) => listener(context))

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
        open = vi.fn(async () => windowId)
        approvals = createSiteApprovals({
            vault: { onLock: (listener) => void lockListeners.push(listener) },
            authContext: {
                onChange: (listener) => void authListeners.push(listener),
            },
            isCurrent,
            sites,
            open,
            timeoutMs: 1000,
        })
    })

    afterEach(() => {
        // Settles anything still pending, which clears its timer.
        lockListeners.forEach((listener) => listener())
        vi.useRealTimers()
    })

    it('stores the approval and resolves every waiting request', async () => {
        const first = approvals.request(alice)
        const second = approvals.request(alice)
        const id = await openedId()

        await expect(approvals.service.get(id)).resolves.toEqual({ origin })
        await approvals.service.decide(id, true)

        await expect(first).resolves.toBeUndefined()
        await expect(second).resolves.toBeUndefined()
        expect(open).toHaveBeenCalledTimes(1)
        expect(open).toHaveBeenCalledWith(
            expect.stringMatching(/^\/approve-site\?id=/)
        )
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

    it('rejects with 4001 when the user closes the page', async () => {
        const request = approvals.request(alice)
        await openedId()
        // Let `open` resolve to the window's ID.
        await Promise.resolve()

        await fakeBrowser.windows.onRemoved.trigger(windowId)

        await expect(request).rejects.toMatchObject({
            code: errorCodes.provider.userRejectedRequest,
        })
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

        await vi.waitFor(() => expect(open).toHaveBeenCalledTimes(2))
    })

    it('does not prompt for a session that is not current', async () => {
        isCurrent.mockResolvedValue(false)

        await expect(approvals.request(alice)).rejects.toMatchObject({
            code: errorCodes.provider.unauthorized,
        })
        expect(open).not.toHaveBeenCalled()
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
        const remove = vi
            .spyOn(fakeBrowser.windows, 'remove')
            .mockResolvedValue(undefined)
        const request = approvals.request(alice).catch(() => {})
        await openedId()
        // Let `open` resolve to the window's ID.
        await Promise.resolve()

        signIn(undefined)
        await request

        expect(remove).toHaveBeenCalledWith(windowId)
    })

    it('closes a page that opens after its prompt was cancelled', async () => {
        const remove = vi
            .spyOn(fakeBrowser.windows, 'remove')
            .mockResolvedValue(undefined)
        let opened!: (id: number) => void
        open.mockImplementationOnce(
            () => new Promise((resolve) => (opened = resolve))
        )
        const request = approvals.request(alice).catch(() => {})
        await openedId()

        signIn(undefined)
        await request
        expect(remove).not.toHaveBeenCalled()
        opened(windowId)

        await vi.waitFor(() => expect(remove).toHaveBeenCalledWith(windowId))
    })
})

describe('currentSessionCheck', () => {
    beforeEach(() => {
        fakeBrowser.reset()
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
        const open = vi.fn(async () => windowId)
        const approvals = createSiteApprovals({
            vault: { onLock: () => {} },
            authContext: { onChange: () => {} },
            isCurrent: await signedIn(token),
            sites: { approve, isApproved: vi.fn(), revoke: vi.fn() },
            open,
        })

        await expect(
            approvals.request({
                principal: 'alice',
                origin,
                accessToken: token,
            })
        ).rejects.toMatchObject({ code: errorCodes.provider.unauthorized })
        expect(open).not.toHaveBeenCalled()
        expect(approve).not.toHaveBeenCalled()
    })
})
