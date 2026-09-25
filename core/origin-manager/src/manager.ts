// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SpliceMessageHandshake, WalletEvent } from '@canton-network/core-types'
import z from 'zod'

type OriginManagerConstructor = {
    readonly userHandshakeCallback?: (event: MessageEvent) => void
}

abstract class OriginManager {
    protected allowedOrigins: Set<Location['origin']> = new Set()
    protected abstract readonly messageToReceive: WalletEvent
    protected abstract readonly classHandshakeCallback: (
        event: MessageEvent
    ) => void

    constructor(private options?: OriginManagerConstructor) {
        // we need to wait for the subclass `super` call to be processed before accessing the sessionStorage key properly
        queueMicrotask(() => this.loadOrigins())
        window.addEventListener('message', this.listener)
    }

    /**
     * Returns the complementary handshake message to send.
     */
    protected get messageToSend() {
        return this.messageToReceive ===
            WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN
            ? WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN_ACK
            : WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN
    }

    /**
     * Creates a listener function that validates incoming handshake messages before invoking the callback.
     */
    protected listenerFactory =
        (callback: (cbEvent: MessageEvent) => void) =>
        (event: MessageEvent) => {
            const parsedData = SpliceMessageHandshake.safeParse(event.data)
            if (
                !parsedData.success ||
                event.origin !== parsedData.data.origin ||
                parsedData.data.type !== this.messageToReceive
            )
                return
            callback(event)
        }

    /**
     * Validates and processes incoming handshake messages.
     */
    private listener = this.listenerFactory((event) => {
        this.allowedOrigins.add(event.origin)
        this.saveOrigins()
        this.classHandshakeCallback(event)
        this.options?.userHandshakeCallback?.(event)
    })

    /**
     * Sends a handshake message to the target window and origin.
     */
    protected handshake(options: {
        window?: Window
        origin: Location['origin']
    }) {
        ;(options?.window ?? window).postMessage(
            {
                type: this.messageToSend,
                origin: window.location.origin,
            },
            options.origin
        )
    }

    /**
     * Returns true when the origin has completed handshake validation.
     */
    public assert(origin: Location['origin']) {
        return this.allowedOrigins.has(origin)
    }

    /**
     * Unregisters the handshake message listener.
     */
    public removeListener() {
        window.removeEventListener('message', this.listener)
    }

    /**
     * Posts a message only when the target origin is trusted. Sends message to all trusted origins if not specified.
     */
    protected postMessageFactory =
        (options?: Partial<{ origin: Location['origin']; window: Window }>) =>
        (message: unknown) => {
            const establishedWindow = options?.window ?? window
            if (!options?.origin) {
                this.allowedOrigins.forEach((origin) => {
                    establishedWindow.postMessage(message, origin)
                })
                return
            }
            if (!this.assert(options.origin)) {
                console.warn(
                    "Can't send the message as the origin is not trusted.",
                    {
                        message,
                        origin: options.origin,
                    }
                )
                return
            }

            establishedWindow.postMessage(message, options.origin)
        }

    /**
     * Sends an arbitrary message to a previously trusted origin.
     */
    public abstract postMessage: (
        message: unknown,
        origin: Location['origin']
    ) => void

    private get sessionStorageKey() {
        return this.messageToReceive
    }

    /**
     * Uses Session Storage to get previously saved origins. Does nothing if the value can't be found or properly parsed.
     */
    private loadOrigins() {
        const storageValue = sessionStorage.getItem(this.sessionStorageKey)
        if (!storageValue) return
        const persistedOrigins = z
            .array(z.url())
            .safeParse(JSON.parse(storageValue))

        if (persistedOrigins.success)
            this.allowedOrigins = new Set(persistedOrigins.data)
    }

    /**
     * Users Session Storage to save current state of origin set.
     */
    private saveOrigins() {
        const storageValue = [...this.allowedOrigins.values()]
        sessionStorage.setItem(
            this.sessionStorageKey,
            JSON.stringify(storageValue)
        )
    }
}

export class ParentWindowOriginManager extends OriginManager {
    protected readonly messageToReceive =
        WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN_ACK
    /**
     * Stops polling once an ACK is received for a tracked origin.
     */
    protected readonly classHandshakeCallback = (event: MessageEvent) => {
        const associatedIntervalID = this.intervalMap.get(event.origin)
        if (associatedIntervalID) {
            clearInterval(associatedIntervalID)
            this.intervalMap.delete(event.origin)
        }
    }
    private intervalMap = new Map<
        Location['origin'],
        ReturnType<typeof setInterval>
    >()

    /**
     * Starts periodically broadcasting handshake messages to the child origin.
     */
    private poll(origin: Location['origin']) {
        const intervalID = setInterval(() => {
            this.handshake({
                origin,
            })
        }, 500)
        this.intervalMap.set(origin, intervalID)
    }

    /**
     * Sends a message from the parent window to a trusted origin. If the connection hasn't been established yet, poll for handshake and postMessage upon success. Post message to all trusted origins if none was specified.
     */
    public postMessage = (message: unknown, origin?: Location['origin']) => {
        // origin is given and trusted or we're looping over all trusted origins
        if (
            (origin && this.assert(origin)) ||
            (!origin && this.allowedOrigins.size)
        ) {
            this.postMessageFactory({
                origin: origin ?? '',
            })(message)
            return
        }

        if (!origin) return
        // origin not registered as trusted
        const eventListener = this.listenerFactory(() => {
            this.postMessageFactory({
                window,
                origin,
            })(message)
            window.removeEventListener('message', eventListener)
        })
        window.addEventListener('message', eventListener)
        this.poll(origin)
    }
}

export class ChildWindowOriginManager extends OriginManager {
    protected readonly messageToReceive =
        WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN

    private parentWindow: Window

    constructor(
        private readonly childOptions?: {
            parentWindow?: Window
        } & OriginManagerConstructor
    ) {
        super(childOptions)
        this.parentWindow = childOptions?.parentWindow ?? window.opener
    }

    /**
     * Replies to parent handshake messages and then removes the listener.
     */
    protected readonly classHandshakeCallback = (event: MessageEvent) => {
        this.handshake({
            window: this.parentWindow,
            origin: event.origin,
        })
        this.removeListener()
    }

    /**
     * Sends a message to the parent window if it exists.
     */
    public readonly postMessage = (
        message: unknown,
        origin?: Window['origin']
    ) => {
        if (!this.parentWindow) {
            console.warn(
                "Can't send a message since no window was specified.",
                {
                    parentWindow: this.parentWindow,
                    origin,
                    message,
                }
            )
            return
        }
        this.postMessageFactory({
            window: this.parentWindow,
            ...(origin ? { origin } : {}),
        })(message)
    }
}
