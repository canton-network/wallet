// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { OriginHandshake, OriginHandshakeMessage } from './types'

type OriginManagerConstructor = {
    readonly userHandshakeCallback?: (event: MessageEvent) => void
}

abstract class OriginManager {
    protected allowedOrigins: Set<Location['origin']> = new Set()
    protected abstract readonly messageToReceive: OriginHandshakeMessage
    protected abstract readonly classHandshakeCallback: (
        event: MessageEvent
    ) => void

    constructor(private options?: OriginManagerConstructor) {
        window.addEventListener('message', this.listener)
    }

    /**
     * Returns the complementary handshake message to send.
     */
    protected get messageToSend() {
        return this.messageToReceive ===
            OriginHandshakeMessage.enum.SPLICE_WALLET_BROADCAST_ORIGIN
            ? OriginHandshakeMessage.enum.SPLICE_WALLET_BROADCAST_ORIGIN_ACK
            : OriginHandshakeMessage.enum.SPLICE_WALLET_BROADCAST_ORIGIN
    }

    /**
     * Creates a listener function that validates incoming handshake messages before invoking the callback.
     */
    protected listenerFactory =
        (callback: (event: MessageEvent) => void) => (event: MessageEvent) => {
            const parsedData = OriginHandshake.safeParse(event.data)
            if (
                !parsedData.success ||
                event.origin !== parsedData.data.origin ||
                parsedData.data.message !== this.messageToReceive
            )
                return
            callback(event)
        }

    /**
     * Validates and processes incoming handshake messages.
     */
    private listener = this.listenerFactory((event) => {
        this.allowedOrigins.add(event.origin)
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
                message: this.messageToSend,
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
     * Posts a message only when the target origin is trusted.
     */
    protected postMessageFactory =
        (options: { origin: Location['origin']; window: Window }) =>
        (message: unknown) => {
            if (!this.assert(options.origin)) return

            options.window.postMessage(message, options.origin)
        }

    /**
     * Sends an arbitrary message to a previously trusted origin.
     */
    public abstract postMessage: (
        message: unknown,
        origin: Location['origin']
    ) => void
}

export class ParentWindowOriginManager extends OriginManager {
    protected readonly messageToReceive =
        OriginHandshakeMessage.enum.SPLICE_WALLET_BROADCAST_ORIGIN_ACK
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
     * Sends a message from the parent window to a trusted origin. If the connection hasn't been established yet, poll for handshake and postMessage upon success.
     */
    public postMessage = (message: unknown, origin: Location['origin']) => {
        const postMessageFunction = this.postMessageFactory({
            window,
            origin,
        })
        if (this.assert(origin)) {
            postMessageFunction(message)
            return
        }
        const eventListener = this.listenerFactory(() => {
            postMessageFunction(message)
            window.removeEventListener('message', eventListener)
        })
        window.addEventListener('message', eventListener)
        this.poll(origin)
    }
}

export class ChildWindowOriginManager extends OriginManager {
    protected readonly messageToReceive =
        OriginHandshakeMessage.enum.SPLICE_WALLET_BROADCAST_ORIGIN

    constructor(
        private readonly childOptions: {
            parentWindow: Window
        } & OriginManagerConstructor = {
            parentWindow: window.opener,
        }
    ) {
        super(childOptions)
    }

    /**
     * Replies to parent handshake messages and then removes the listener.
     */
    protected readonly classHandshakeCallback = (event: MessageEvent) => {
        this.handshake({
            window: this.childOptions.parentWindow,
            origin: event.origin,
        })
        this.removeListener()
    }

    /**
     * Sends a message to the parent window if it exists.
     */
    public readonly postMessage = (message: unknown) => {
        if (!this.childOptions.parentWindow) return
        this.postMessageFactory({
            window: this.childOptions.parentWindow,
            origin: this.childOptions.parentWindow.origin,
        })(message)
    }
}
