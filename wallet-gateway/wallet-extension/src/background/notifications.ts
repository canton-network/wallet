// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AuthContext } from '@canton-network/core-wallet-auth'
import {
    type DappNotificationEvent,
    type INotificationService,
    type NotificationSink,
    type NotificationSubscriber,
    subscribeNotifications,
} from '@canton-network/core-wallet-services'
import type { Store } from '@canton-network/core-wallet-store'
import { browser, type Browser } from 'wxt/browser'
import { logger } from '@/shared/logger'
import {
    NOTIFICATIONS_PORT_NAME,
    type NotificationPortMessage,
} from '@/shared/ports'
import type { AuthContextStore } from './auth-context'
import { VaultLockedError } from './vault'

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

/**
 * Resolves the session & user a newly connected client should be subscribed
 * to, or `undefined` when there is no authenticated session.
 */
export type ResolveSubscriber = () => Promise<
    NotificationSubscriber | undefined
>

/**
 * Resolves the signed-in user's current session, which content-script ports
 * are subscribed to. While the vault is locked there is none.
 */
export function currentSessionSubscriber(
    getStore: () => Promise<Store>,
    authContext: AuthContextStore
): ResolveSubscriber {
    return async () => {
        let store: Store
        let context: AuthContext | undefined
        // Both reject with `VaultLockedError` while the vault is locked, and
        // a locked vault has no session.
        try {
            store = await getStore()
            context = await authContext.load()
        } catch (error) {
            if (error instanceof VaultLockedError) return undefined
            throw error
        }
        if (!context) return undefined

        const session = await store.getSession(context.accessToken)
        if (!session) return undefined

        return { sessionId: session.id, userId: context.userId }
    }
}

/**
 * Subscribes a content-script port to the notifications of the current
 * session. The port is disconnected when there is no authenticated session
 * (the equivalent of the remote's 401), and unsubscribed when it disconnects.
 */
export async function handleNotificationPort(
    port: Port,
    notificationService: INotificationService,
    resolveSubscriber: ResolveSubscriber
): Promise<void> {
    // Register before any await, so a disconnect during the lookup is seen.
    let disconnected = false
    port.onDisconnect.addListener(() => {
        disconnected = true
    })

    let subscriber: NotificationSubscriber | undefined
    try {
        subscriber = await resolveSubscriber()
    } catch (error) {
        logger.error('Failed to resolve notification subscriber: {*}', {
            error,
        })
    }

    if (disconnected) return
    if (!subscriber) {
        port.disconnect()
        return
    }

    const unsubscribe = subscribeNotifications(
        notificationService,
        subscriber,
        new PortNotificationSink(port)
    )
    port.onDisconnect.addListener(unsubscribe)
}

/**
 * Accepts notification ports opened by content scripts. Must be called
 * synchronously during background start-up, so a connect that wakes the MV3
 * service worker is not missed.
 */
export function registerNotificationPorts(
    notificationService: INotificationService,
    resolveSubscriber: ResolveSubscriber
): void {
    browser.runtime.onConnect.addListener((port) => {
        if (port.name !== NOTIFICATIONS_PORT_NAME) return
        void handleNotificationPort(
            port,
            notificationService,
            resolveSubscriber
        )
    })
}
