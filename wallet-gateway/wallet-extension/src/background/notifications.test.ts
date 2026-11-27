// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { NotificationService } from '@canton-network/core-wallet-services'
import type { Store } from '@canton-network/core-wallet-store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { fakeAuthContext } from '@/__tests__/fake-auth-context.ts'
import { asPort, type FakePort, fakePort } from '@/__tests__/fake-port.ts'
import { jwt } from '@/__tests__/jwt.ts'
import { logger } from '@/shared/logger.ts'

import type { SignedInContext } from './auth-context.ts'
import {
    createSitePorts,
    currentSessionSubscriber,
    handleNotificationPort,
    PortNotificationSink,
    type SitePorts,
} from './notifications.ts'
import { disconnectedStatusEvent } from './status.ts'
import { createTestWalletStore } from './store/test-store.ts'
import { VaultLockedError } from './vault/index.ts'

const userA = {
    userId: 'user-1',
    accessToken: 'token-a',
    identityProviderId: 'idp-mock-oauth',
}
const subscriber = {
    sessionId: 'session-1',
    userId: userA.userId,
    principal: JSON.stringify([userA.identityProviderId, userA.userId]),
}
const origin = 'https://dapp.example'

/** A vault whose `lock()` only runs the lock listeners. */
function fakeLockingVault() {
    const listeners: (() => void)[] = []
    return {
        onLock: (listener: () => void) => void listeners.push(listener),
        lock: () => listeners.forEach((listener) => listener()),
    }
}

/** Auth context changes that only happen on `signIn()`. */
function fakeAuthChanges() {
    const listeners: ((context: SignedInContext | undefined) => void)[] = []
    return {
        onChange: (listener: (context: SignedInContext | undefined) => void) =>
            void listeners.push(listener),
        signIn: (context?: SignedInContext) =>
            listeners.forEach((listener) => listener(context)),
    }
}

const userB = { ...userA, userId: 'user-2', accessToken: 'token-b' }

describe('PortNotificationSink', () => {
    let port: FakePort

    beforeEach(() => {
        port = fakePort()
    })

    it('posts the event with its first argument as params', () => {
        const sink = new PortNotificationSink(asPort(port))

        sink.send('txChanged', [{ status: 'pending', commandId: 'c1' }])

        expect(port.postMessage).toHaveBeenCalledWith({
            method: 'txChanged',
            params: { status: 'pending', commandId: 'c1' },
        })
    })

    it('keeps array arguments (e.g. accountsChanged) as params', () => {
        const sink = new PortNotificationSink(asPort(port))

        sink.send('accountsChanged', [[{ partyId: 'p1' }]])

        expect(port.postMessage).toHaveBeenCalledWith({
            method: 'accountsChanged',
            params: [{ partyId: 'p1' }],
        })
    })

    it('omits params for events without arguments', () => {
        const sink = new PortNotificationSink(asPort(port))

        sink.send('connected', [])

        expect(port.postMessage).toHaveBeenCalledWith({ method: 'connected' })
    })

    it('disconnects the port on close', () => {
        const sink = new PortNotificationSink(asPort(port))

        sink.close()

        expect(port.disconnect).toHaveBeenCalledTimes(1)
    })
})

describe('handleNotificationPort', () => {
    let service: NotificationService
    let port: FakePort
    let vault: ReturnType<typeof fakeLockingVault>
    let auth: ReturnType<typeof fakeAuthChanges>
    let sitePorts: SitePorts

    beforeEach(() => {
        service = new NotificationService()
        port = fakePort()
        vault = fakeLockingVault()
        auth = fakeAuthChanges()
        sitePorts = createSitePorts(vault, auth)
    })

    const subscribe = (sitePort: FakePort) =>
        handleNotificationPort(
            asPort(sitePort),
            service,
            async () => subscriber,
            sitePorts
        )

    it("resolves the subscriber for the port's origin", async () => {
        const resolve = vi.fn(async () => subscriber)

        await handleNotificationPort(asPort(port), service, resolve, sitePorts)

        expect(resolve).toHaveBeenCalledWith(origin)
    })

    it('disconnects a port without a web origin', async () => {
        const extensionPort = fakePort('chrome-extension://other-extension')
        const resolve = vi.fn(async () => subscriber)

        await handleNotificationPort(
            asPort(extensionPort),
            service,
            resolve,
            sitePorts
        )

        expect(resolve).not.toHaveBeenCalled()
        expect(extensionPort.disconnect).toHaveBeenCalledTimes(1)
    })

    it("closing an origin's ports tells them and leaves other origins", async () => {
        const otherPort = fakePort('https://other.example')
        await subscribe(port)
        await subscribe(otherPort)

        sitePorts.close(origin, disconnectedStatusEvent('disconnect'))
        const event = { status: 'x', origin: 'https://other.example' }
        service.getNotifier('session-1').emit('txChanged', event)

        expect(port.postMessage.mock.calls).toEqual([
            [
                {
                    method: 'statusChanged',
                    params: disconnectedStatusEvent('disconnect'),
                },
            ],
        ])
        expect(port.disconnect).toHaveBeenCalledTimes(1)
        expect(otherPort.postMessage).toHaveBeenCalledWith({
            method: 'txChanged',
            params: event,
        })
        expect(otherPort.disconnect).not.toHaveBeenCalled()
    })

    it('closes every port when the vault locks', async () => {
        const otherPort = fakePort('https://other.example')
        await subscribe(port)
        await subscribe(otherPort)

        vault.lock()
        service.getNotifier('session-1').emit('txChanged', {})

        for (const closed of [port, otherPort]) {
            expect(closed.postMessage.mock.calls).toEqual([
                [
                    {
                        method: 'statusChanged',
                        params: disconnectedStatusEvent('Locked'),
                    },
                ],
            ])
            expect(closed.disconnect).toHaveBeenCalledTimes(1)
        }
    })

    /** Starts subscribing `sitePort`, with a lookup that waits for `resolve`. */
    function pendingSubscribe(sitePort: FakePort) {
        let resolve!: (value: typeof subscriber) => void
        const done = handleNotificationPort(
            asPort(sitePort),
            service,
            () => new Promise((r) => (resolve = r)),
            sitePorts
        )
        return {
            finish: async () => {
                resolve(subscriber)
                await done
            },
        }
    }

    it("disconnects a port whose lookup raced its origin's close", async () => {
        const pending = pendingSubscribe(port)

        sitePorts.close(origin, disconnectedStatusEvent('disconnect'))
        await pending.finish()

        expect(port.disconnect).toHaveBeenCalledTimes(1)
        expect(service.getNotifier('session-1').emit('txChanged', {})).toBe(
            false
        )
    })

    it('disconnects a port whose lookup raced a lock', async () => {
        const pending = pendingSubscribe(port)

        vault.lock()
        await pending.finish()

        expect(port.disconnect).toHaveBeenCalledTimes(1)
    })

    it('closes every port without a status when another user signs in', async () => {
        const otherPort = fakePort('https://other.example')
        await subscribe(port)
        await subscribe(otherPort)

        auth.signIn(userB)
        service.getNotifier('session-1').emit('txChanged', {})

        // A disconnected status would make the dApp call `disconnect`,
        // revoking the incoming user's approval.
        for (const closed of [port, otherPort]) {
            expect(closed.postMessage).not.toHaveBeenCalled()
            expect(closed.disconnect).toHaveBeenCalledTimes(1)
        }
    })

    it('keeps the ports open when the same user signs in again', async () => {
        await subscribe(port)

        auth.signIn({ ...userA, accessToken: 'token-a2' })
        service
            .getNotifier('session-1')
            .emit('txChanged', { status: 'x', origin })

        expect(port.disconnect).not.toHaveBeenCalled()
        expect(port.postMessage.mock.calls).toEqual([
            [{ method: 'txChanged', params: { status: 'x', origin } }],
        ])
    })

    it('closes the ports when the same subject signs in through another IdP', async () => {
        await subscribe(port)

        auth.signIn({ ...userA, identityProviderId: 'idp-self-signed' })

        expect(port.postMessage).not.toHaveBeenCalled()
        expect(port.disconnect).toHaveBeenCalledTimes(1)
    })

    it('disconnects a port whose lookup raced another user signing in', async () => {
        const pending = pendingSubscribe(port)

        auth.signIn(userB)
        await pending.finish()

        expect(port.disconnect).toHaveBeenCalledTimes(1)
        expect(service.getNotifier('session-1').emit('txChanged', {})).toBe(
            false
        )
    })

    it('still subscribes a port when another origin closes during its lookup', async () => {
        const pending = pendingSubscribe(port)

        sitePorts.close(
            'https://other.example',
            disconnectedStatusEvent('disconnect')
        )
        await pending.finish()

        expect(port.disconnect).not.toHaveBeenCalled()
        expect(service.getNotifier('session-1').emit('txChanged', {})).toBe(
            true
        )
    })

    it('sends an event to one origin only', async () => {
        const otherPort = fakePort('https://other.example')
        await subscribe(port)
        await subscribe(otherPort)

        sitePorts.send(origin, 'connected', [{ ok: true }])

        expect(port.postMessage).toHaveBeenCalledWith({
            method: 'connected',
            params: { ok: true },
        })
        expect(otherPort.postMessage).not.toHaveBeenCalled()
    })

    it("sends a transaction's events only to the site that asked for it", async () => {
        const other = 'https://other.example'
        const otherPort = fakePort(other)
        await subscribe(port)
        await subscribe(otherPort)
        const signed = {
            id: 'tx-1',
            origin,
            status: 'signed',
            commandId: 'command-1',
            payload: { signature: 'signature', signedBy: 'ns', party: 'p' },
        }

        service.getNotifier('session-1').emit('txChanged', signed)
        service.getNotifier('session-1').emit('txChanged', { status: 'x' })
        service.getNotifier('user-1').emit('accountsChanged', [])

        expect(port.postMessage.mock.calls).toEqual([
            [{ method: 'txChanged', params: signed }],
            [{ method: 'accountsChanged', params: [] }],
        ])
        expect(otherPort.postMessage.mock.calls).toEqual([
            [{ method: 'accountsChanged', params: [] }],
        ])
    })

    it('cleans up every port of an origin when one fails to send', async () => {
        const failing = fakePort()
        failing.postMessage.mockImplementation(() => {
            throw new Error('Attempting to use a disconnected port object')
        })
        await subscribe(failing)
        await subscribe(port)

        sitePorts.close(origin, disconnectedStatusEvent('disconnect'))

        expect(failing.disconnect).toHaveBeenCalledTimes(1)
        expect(port.disconnect).toHaveBeenCalledTimes(1)
        expect(service.getNotifier('session-1').emit('txChanged', {})).toBe(
            false
        )
    })

    it('closes every origin on lock when a port fails', async () => {
        const otherPort = fakePort('https://other.example')
        port.postMessage.mockImplementation(() => {
            throw new Error('Attempting to use a disconnected port object')
        })
        port.disconnect.mockImplementation(() => {
            throw new Error('Attempting to use a disconnected port object')
        })
        await subscribe(port)
        await subscribe(otherPort)

        vault.lock()

        expect(otherPort.disconnect).toHaveBeenCalledTimes(1)
        expect(service.getNotifier('session-1').emit('txChanged', {})).toBe(
            false
        )
    })

    it('forwards session and user notifications to the port', async () => {
        await handleNotificationPort(
            asPort(port),
            service,
            async () => subscriber,
            sitePorts
        )

        service
            .getNotifier('session-1')
            .emit('txChanged', { status: 'pending', origin })
        service.getNotifier('user-1').emit('accountsChanged', [])
        service.getNotifier('session-2').emit('txChanged', { other: true })

        expect(port.postMessage.mock.calls).toEqual([
            [{ method: 'txChanged', params: { status: 'pending', origin } }],
            [{ method: 'accountsChanged', params: [] }],
        ])
        expect(port.disconnect).not.toHaveBeenCalled()
    })

    it('disconnects the port when there is no authenticated session', async () => {
        await handleNotificationPort(
            asPort(port),
            service,
            async () => undefined,
            sitePorts
        )

        expect(port.disconnect).toHaveBeenCalledTimes(1)
        expect(service.getNotifier('session-1').emit('txChanged', {})).toBe(
            false
        )
    })

    it('disconnects the port when the session lookup fails', async () => {
        await handleNotificationPort(
            asPort(port),
            service,
            async () => {
                throw new Error('store unavailable')
            },
            sitePorts
        )

        expect(port.disconnect).toHaveBeenCalledTimes(1)
    })

    it('disconnects the port and stops forwarding on logout', async () => {
        await handleNotificationPort(
            asPort(port),
            service,
            async () => subscriber,
            sitePorts
        )

        service.getNotifier('session-1').emit('logout')
        service.getNotifier('session-1').emit('txChanged', {})

        expect(port.disconnect).toHaveBeenCalledTimes(1)
        expect(port.postMessage).not.toHaveBeenCalled()
    })

    it('unsubscribes when the content script disconnects', async () => {
        await handleNotificationPort(
            asPort(port),
            service,
            async () => subscriber,
            sitePorts
        )

        port.remoteDisconnect()

        expect(service.getNotifier('session-1').emit('txChanged', {})).toBe(
            false
        )
        expect(service.getNotifier('user-1').emit('accountsChanged', [])).toBe(
            false
        )
        expect(port.postMessage).not.toHaveBeenCalled()
    })

    it('does not subscribe a port that disconnected during the lookup', async () => {
        let resolve!: (value: typeof subscriber) => void
        const pending = handleNotificationPort(
            asPort(port),
            service,
            () => new Promise((r) => (resolve = r)),
            sitePorts
        )

        port.remoteDisconnect()
        resolve(subscriber)
        await pending

        expect(service.getNotifier('session-1').emit('txChanged', {})).toBe(
            false
        )
        expect(port.disconnect).not.toHaveBeenCalled()
    })
})

describe('currentSessionSubscriber', () => {
    const context = {
        ...userA,
        accessToken: jwt({ iss: 'https://idp', sub: 'user-1' }),
    }
    const { principal } = subscriber
    const approvedSites = {
        isApproved: vi.fn(
            async (owner: string, site: string) =>
                owner === principal && site === origin
        ),
    }
    let store: Store

    beforeEach(() => {
        fakeBrowser.reset()
        store = createTestWalletStore().withAuthContext(context)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('resolves nothing when signed out', async () => {
        const resolve = currentSessionSubscriber(
            async () => store,
            fakeAuthContext(),
            approvedSites
        )

        await expect(resolve(origin)).resolves.toBeUndefined()
    })

    it('resolves nothing when the token has no session', async () => {
        const resolve = currentSessionSubscriber(
            async () => store,
            fakeAuthContext(context),
            approvedSites
        )

        await expect(resolve(origin)).resolves.toBeUndefined()
    })

    it('resolves nothing for a site the user has not approved', async () => {
        await store.setSession({
            id: 'session-1',
            origin: 'browserext',
            network: 'canton:local-oauth',
            accessToken: context.accessToken,
        })
        const resolve = currentSessionSubscriber(
            async () => store,
            fakeAuthContext(context),
            approvedSites
        )

        await expect(resolve('https://other.example')).resolves.toBeUndefined()
        expect(approvedSites.isApproved).toHaveBeenCalledWith(
            principal,
            'https://other.example'
        )
    })

    it("resolves the token's session and user", async () => {
        await store.setSession({
            id: 'session-1',
            origin: 'browserext',
            network: 'canton:local-oauth',
            accessToken: context.accessToken,
        })
        const resolve = currentSessionSubscriber(
            async () => store,
            fakeAuthContext(context),
            approvedSites
        )

        await expect(resolve(origin)).resolves.toEqual(subscriber)
    })

    const locked = async (): Promise<never> => {
        throw new VaultLockedError()
    }

    // The store and the auth context are both in the vault. load() rejects
    // too when a lock() lands after getStore().
    it.each([
        { rejects: 'getStore()', getStore: locked, load: async () => context },
        { rejects: 'load()', getStore: async () => store, load: locked },
    ])(
        'resolves nothing, without an error log, when $rejects finds the vault locked',
        async ({ getStore, load }) => {
            const logError = vi.spyOn(logger, 'error')
            const resolve = currentSessionSubscriber(
                getStore,
                { ...fakeAuthContext(), load },
                approvedSites
            )
            const port = fakePort()

            await expect(resolve(origin)).resolves.toBeUndefined()
            await handleNotificationPort(
                asPort(port),
                new NotificationService(),
                resolve,
                createSitePorts(fakeLockingVault(), fakeAuthChanges())
            )

            expect(port.disconnect).toHaveBeenCalledTimes(1)
            expect(logError).not.toHaveBeenCalled()
        }
    )

    it('still fails on other store errors', async () => {
        const resolve = currentSessionSubscriber(
            async () => {
                throw new Error('corrupt snapshot')
            },
            fakeAuthContext(context),
            approvedSites
        )

        await expect(resolve(origin)).rejects.toThrow('corrupt snapshot')
    })
})
