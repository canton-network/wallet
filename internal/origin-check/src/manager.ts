// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { OriginHandshake, OriginHandshakeMessage } from './types'

abstract class OriginManager {
    protected allowedOrigins: Set<Location['origin']> = new Set()
    protected abstract readonly messageToReceive: OriginHandshakeMessage
    protected abstract readonly listenerCallback: (event: MessageEvent) => void

    protected listener = (event: MessageEvent) => {
        const parsedData = OriginHandshake.safeParse(event.data)
        if (
            !parsedData.success ||
            event.origin !== parsedData.data.origin ||
            parsedData.data.message !== this.messageToReceive
        )
            return
        this.allowedOrigins.add(event.origin)
        this.listenerCallback(event)
    }

    constructor() {
        window.addEventListener('message', this.listener)
    }

    protected get messageToSend() {
        return this.messageToReceive ===
            OriginHandshakeMessage.enum.SPLICE_WALLET_BROADCAST_ORIGIN
            ? OriginHandshakeMessage.enum.SPLICE_WALLET_BROADCAST_ORIGIN_ACK
            : OriginHandshakeMessage.enum.SPLICE_WALLET_BROADCAST_ORIGIN
    }

    protected broadcast(options: {
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

    public assert(origin: Location['origin']) {
        return this.allowedOrigins.has(origin)
    }

    public removeListener() {
        window.removeEventListener('message', this.listener)
    }
}

export class ParentWindowOriginManager extends OriginManager {
    protected readonly messageToReceive =
        OriginHandshakeMessage.enum.SPLICE_WALLET_BROADCAST_ORIGIN_ACK
    protected readonly listenerCallback = (event: MessageEvent) => {
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

    public poll(origin: Location['origin']) {
        const intervalID = setInterval(() => {
            this.broadcast({
                origin,
            })
        }, 500)
        this.intervalMap.set(origin, intervalID)
    }
}

export class ChildWindowOriginManager extends OriginManager {
    protected readonly messageToReceive =
        OriginHandshakeMessage.enum.SPLICE_WALLET_BROADCAST_ORIGIN
    protected readonly listenerCallback = (event: MessageEvent) => {
        this.broadcast({
            window: window.opener,
            origin: event.origin,
        })
        this.removeListener()
    }
}
