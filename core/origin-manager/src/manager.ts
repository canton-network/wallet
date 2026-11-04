// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SpliceMessageHandshake, WalletEvent } from '@canton-network/core-types'
import z from 'zod'

type OriginManagerConstructor = {
    readonly userHandshakeCallback?: (event: MessageEvent) => void
    /**
     * Origins trusted up front without a handshake, e.g. the page's own
     * origin when messaging the same window from a content script.
     */
    readonly trustedOrigins?: readonly Location['origin'][]
    readonly logger?: Console
}

abstract class OriginManager {
    protected trustedOrigins: Set<Location['origin']> = new Set()
    protected abstract readonly messageToReceive: WalletEvent
    protected abstract readonly classHandshakeCallback: (
        event: MessageEvent
    ) => void
    protected readonly _logger: Console

    /**
     * IMPORTANT: each child constructor must call `this.loadOrigins()` AFTER calling `super()`.
     */
    constructor(private options?: OriginManagerConstructor) {
        options?.trustedOrigins?.forEach((origin) =>
            this.trustedOrigins.add(origin)
        )
        this._logger = options?.logger ?? console
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
        this.trustedOrigins.add(event.origin)
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
        return this.trustedOrigins.has(origin)
    }

    /**
     * Unregisters the handshake message listener.
     */
    public removeListener() {
        window.removeEventListener('message', this.listener)
    }

    /**
     * Posts a message only when the target origin is trusted. Sends message to all trusted origins if not specified.
     * @returns Boolean which indicates if message was sent or not
     */
    protected postMessageFactory =
        (options: { origin: Location['origin']; window: Window }) =>
        (message: unknown) => {
            const establishedWindow = options?.window ?? window
            if (!options?.origin) {
                this._logger.info('Sending message to all trusted origins')
                this.trustedOrigins.forEach((origin) => {
                    establishedWindow.postMessage(message, origin)
                })
                return true
            }
            if (!this.assert(options.origin)) {
                this._logger.warn(
                    "Can't send the message as the origin is not trusted.",
                    {
                        message,
                        origin: options.origin,
                    }
                )
                return false
            }

            establishedWindow.postMessage(message, options.origin)
            return true
        }

    /**
     * Sends an arbitrary message to a previously trusted origin.
     */
    public abstract postMessage: (
        message: unknown,
        origin?: Location['origin']
    ) => void

    private get sessionStorageKey() {
        return this.messageToReceive
    }

    /**
     * Uses Session Storage to get previously saved origins. Relies on `this.messageToReceive` to work properly, hence it must be called after invoking child `super` call. Does nothing if the value can't be found or properly parsed.
     */
    protected loadOrigins() {
        const storageValue = sessionStorage.getItem(this.sessionStorageKey)
        if (!storageValue) {
            this._logger.info(
                'Skipping loading origins from session storage as no entries were found.'
            )
            return
        }
        const persistedOrigins = z
            .array(z.url())
            .safeParse(JSON.parse(storageValue))

        if (persistedOrigins.success)
            persistedOrigins.data.forEach((origin) =>
                this.trustedOrigins.add(origin)
            )
    }

    /**
     * Users Session Storage to save current state of origin set.
     */
    private saveOrigins() {
        const storageValue = [...this.trustedOrigins.values()]
        sessionStorage.setItem(
            this.sessionStorageKey,
            JSON.stringify(storageValue)
        )
    }
}

export class ParentWindowOriginManager extends OriginManager {
    protected readonly messageToReceive =
        WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN_ACK

    constructor(options?: OriginManagerConstructor) {
        super(options)
        this.loadOrigins()
    }

    /**
     * Stops polling once an ACK is received for a tracked origin.
     */
    protected readonly handshakeCallback = (event: MessageEvent) => {
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
     * Sends a message from the parent window to a trusted origin. If the connection hasn't been established yet, poll for handshake and postMessage upon success. Post message to all trusted origins if none were specified.
     */
    public readonly postMessage = (
        message: unknown,
        origin?: Location['origin']
    ) => {
        // origin is given and trusted or we're looping over all trusted origins
        const isOriginTrusted = origin && this.assert(origin)
        const isNoOriginGivenAndAnyOriginsTrusted =
            !origin && this.trustedOrigins.size
        if (isOriginTrusted || isNoOriginGivenAndAnyOriginsTrusted) {
            if (isNoOriginGivenAndAnyOriginsTrusted) {
                this._logger.info(
                    'No given origin is trusted, looping over all trusted origins instead'
                )
            }
            this.postMessageFactory({
                origin: origin ?? '',
            })(message)
            return
        }

        if (!origin) {
            this._logger.warn(
                'No origin given and no origin trusted to post the message, skipping...',
                { message }
            )
            return
        }
        // origin not registered as trusted
        const eventListener = this.listenerFactory(() => {
            const sent = this.postMessageFactory({
                window,
                origin,
            })(message)
            if (sent) window.removeEventListener('message', eventListener)
        })
        window.addEventListener('message', eventListener)
        this.poll(origin)
    }
}

export class ChildWindowOriginManager extends OriginManager {
    protected readonly messageToReceive =
        OriginHandshakeMessage.enum.SPLICE_WALLET_BROADCAST_ORIGIN

    private parentWindow: Window

    constructor(
        childOptions?: {
            parentWindow?: Window
        } & OriginManagerConstructor
    ) {
        super(childOptions)
        this.parentWindow = childOptions?.parentWindow ?? window.opener
        this.loadOrigins()
    }

    /**
     * Replies to parent handshake messages and then removes the listener.
     */
    protected readonly handshakeCallback = (event: MessageEvent) => {
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
            this._logger.warn(
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
            origin: this.parentWindow.origin,
        })(message)
    }
}
