// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    type DappNotificationEvent,
    type INotificationService,
    type NotificationSink,
    type NotificationSubscriber,
    subscribeNotifications,
} from '@canton-network/core-wallet-services'
import type { Store } from '@canton-network/core-wallet-store'
import { browser, type Browser } from 'wxt/browser'

import { logger } from '@/shared/logger.ts'
import {
    NOTIFICATIONS_PORT_NAME,
    type NotificationPortMessage,
} from '@/shared/ports.ts'

import type {
    AuthContextChanges,
    AuthContextStore,
    SignedInContext,
} from './auth-context.ts'
import type { StatusEvent } from './controllers/dapp/rpc-gen/typings.ts'
import { senderOrigin } from './dapp-service.ts'
import { disconnectedStatusEvent } from './status.ts'
import {
    type ApprovedSiteStore,
    sitePrincipal,
} from './store/approved-sites.ts'
import { type Vault, VaultLockedError } from './vault/index.ts'

type Port = Browser.runtime.Port

/**
 * Delivers notifications to a content script over a `runtime.Port`.
 *
 * Encoding differs from the remote's SSE transport: SSE sends the full emit
 * argument list (`data: [args]`) and `DappAsyncProvider` spreads it, whereas the
 * window transport carries a JSON-RPC notification whose single `params` value
 * `DappSyncProvider` emits as-is. Every dApp event is emitted with exactly one
 * argument, so only `args[0]` is sent.
 */
export class PortNotificationSink implements NotificationSink {
    constructor(private readonly port: Port) {}

    send(event: DappNotificationEvent, args: unknown[]): void {
        const message: NotificationPortMessage = { method: event }
        if (args[0] !== undefined) {
            message.params = args[0]
        }
        this.port.postMessage(message)
    }

    close(): void {
        this.port.disconnect()
    }
}

/** A port's subscriber, with the principal that approved its origin. */
export interface SiteSubscriber extends NotificationSubscriber {
    principal: string
}

/**
 * Resolves the session & user a port from `origin` should be subscribed to,
 * or `undefined` when there is no authenticated session or the user hasn't
 * approved the origin.
 */
export type ResolveSubscriber = (
    origin: string
) => Promise<SiteSubscriber | undefined>

/**
 * Resolves the signed-in user's current session, which content-script ports
 * of approved sites are subscribed to. While the vault is locked there is
 * none.
 */
export function currentSessionSubscriber(
    getStore: () => Promise<Store>,
    authContext: AuthContextStore,
    sites: Pick<ApprovedSiteStore, 'isApproved'>
): ResolveSubscriber {
    return async (origin) => {
        let store: Store
        let context: SignedInContext | undefined
        let principal: string | undefined
        // All three reject with `VaultLockedError` while the vault is locked,
        // and a locked vault has no session.
        try {
            store = await getStore()
            context = await authContext.load()
            if (!context) return undefined
            principal = sitePrincipal(context)
            if (principal === undefined) return undefined
            if (!(await sites.isApproved(principal, origin))) return undefined
        } catch (error) {
            if (error instanceof VaultLockedError) return undefined
            throw error
        }

        const session = await store.getSession(context.accessToken)
        if (!session) return undefined

        return { sessionId: session.id, userId: context.userId, principal }
    }
}

interface SitePort {
    principal: string
    sink: NotificationSink
    unsubscribe: () => void
}

/** The subscribed notification ports, by the origin of their page. */
export interface SitePorts {
    /**
     * Call before looking up a port's subscriber. The returned check turns
     * false once the origin's ports were closed, or the vault locked or the
     * auth context was written, since: the lookup may then have read an
     * approval or a session that is gone.
     */
    watch(origin: string): () => boolean
    /** Tracks a subscribed port. Returns the function that stops tracking it. */
    add(origin: string, port: SitePort): () => void
    /** Sends an event to the origin's ports only. */
    send(origin: string, event: DappNotificationEvent, args: unknown[]): void
    /**
     * Sends `statusChanged` with `event` to the origin's ports, then
     * unsubscribes and closes them. Other origins keep theirs.
     */
    close(origin: string, event: StatusEvent): void
}

/**
 * Runs one step of talking to a port. A port can fail at any time (e.g. its
 * tab just closed), and that must not stop the other ports' cleanup.
 */
function attempt(step: string, fn: () => void): void {
    try {
        fn()
    } catch (error) {
        logger.warn('Notification port {step} failed: {error}', {
            step,
            error,
        })
    }
}

/**
 * Closes every port when the vault locks, and the ports of other principals
 * when the signed-in user changes: a port is subscribed to one user's
 * session, and a new user signing in without a logout only ends the sessions
 * of the new user. The same user signing in again keeps their ports, as the
 * replaced session's logout already closes them.
 */
export function createSitePorts(
    vault: Pick<Vault, 'onLock'>,
    authContext: AuthContextChanges
): SitePorts {
    const ports = new Map<string, Set<SitePort>>()
    const closes = new Map<string, number>()
    let resets = 0

    function send(
        origin: string,
        event: DappNotificationEvent,
        args: unknown[]
    ) {
        for (const port of ports.get(origin) ?? []) {
            attempt('send', () => port.sink.send(event, args))
        }
    }

    function closePort(port: SitePort, event: StatusEvent | undefined) {
        if (event) {
            attempt('send', () => port.sink.send('statusChanged', [event]))
        }
        attempt('unsubscribe', port.unsubscribe)
        attempt('close', () => port.sink.close())
    }

    function close(origin: string, event: StatusEvent) {
        closes.set(origin, (closes.get(origin) ?? 0) + 1)
        const closing = [...(ports.get(origin) ?? [])]
        ports.delete(origin)
        for (const port of closing) closePort(port, event)
    }

    vault.onLock(() => {
        resets++
        for (const origin of ports.keys()) {
            close(origin, disconnectedStatusEvent('Locked'))
        }
    })

    // Any auth write may have replaced what a pending lookup read, so it is
    // redone. Ports of another principal close without a status event: a
    // disconnected status makes dApps call `disconnect`, which would revoke
    // the incoming user's approval of the site.
    authContext.onChange((context) => {
        resets++
        const principal = context && sitePrincipal(context)
        for (const set of ports.values()) {
            for (const port of set) {
                if (port.principal !== principal) closePort(port, undefined)
            }
        }
    })

    return {
        watch(origin) {
            const closed = closes.get(origin) ?? 0
            const reset = resets
            return () =>
                (closes.get(origin) ?? 0) === closed && resets === reset
        },
        add(origin, port) {
            let set = ports.get(origin)
            if (!set) {
                set = new Set()
                ports.set(origin, set)
            }
            set.add(port)
            const tracked = set
            return () => {
                tracked.delete(port)
                if (tracked.size === 0 && ports.get(origin) === tracked) {
                    ports.delete(origin)
                }
            }
        },
        send,
        close,
    }
}

/**
 * Subscribes a content-script port to the notifications of the current
 * session, if the user approved the port's origin. The origin comes from the
 * browser's sender information. The port is disconnected when there is no
 * authenticated session or approval (the equivalent of the remote's 401),
 * and unsubscribed when it disconnects.
 */
export async function handleNotificationPort(
    port: Port,
    notificationService: INotificationService,
    resolveSubscriber: ResolveSubscriber,
    sitePorts: SitePorts
): Promise<void> {
    // Register before any await, so a disconnect during the lookup is seen.
    let disconnected = false
    port.onDisconnect.addListener(() => {
        disconnected = true
    })

    const origin = senderOrigin(port.sender)
    if (origin === undefined) {
        port.disconnect()
        return
    }

    const unchanged = sitePorts.watch(origin)
    let subscriber: SiteSubscriber | undefined
    try {
        subscriber = await resolveSubscriber(origin)
    } catch (error) {
        logger.error('Failed to resolve notification subscriber: {*}', {
            error,
        })
    }

    if (disconnected) return
    // A disconnect or lock during the lookup may have revoked what it read.
    if (!subscriber || !unchanged()) {
        port.disconnect()
        return
    }

    const portSink = new PortNotificationSink(port)
    let untrack = () => {}
    // Closed on logout too, so the port is then no longer tracked.
    const sink: NotificationSink = {
        send: (event, args) => portSink.send(event, args),
        close: () => {
            untrack()
            portSink.close()
        },
    }
    const unsubscribe = subscribeNotifications(
        notificationService,
        subscriber,
        sink
    )
    untrack = sitePorts.add(origin, {
        principal: subscriber.principal,
        sink,
        unsubscribe,
    })
    port.onDisconnect.addListener(() => {
        unsubscribe()
        untrack()
    })
}

/**
 * Accepts notification ports opened by content scripts. Must be called
 * synchronously during background start-up, so a connect that wakes the MV3
 * service worker is not missed.
 */
export function registerNotificationPorts(
    notificationService: INotificationService,
    resolveSubscriber: ResolveSubscriber,
    sitePorts: SitePorts
): void {
    browser.runtime.onConnect.addListener((port) => {
        if (port.name !== NOTIFICATIONS_PORT_NAME) return
        void handleNotificationPort(
            port,
            notificationService,
            resolveSubscriber,
            sitePorts
        )
    })
}
