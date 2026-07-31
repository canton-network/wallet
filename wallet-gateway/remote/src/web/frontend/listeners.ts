// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    isSpliceMessageEvent,
    SpliceMessage,
    WalletEvent,
} from '@canton-network/core-types'
import { stateManager } from './state-manager'

/** How long to wait for the dApp to broadcast its origin into a popup. */
export const DETECT_ORIGIN_TIMEOUT_MS = 10_000

const handleOriginBroadcast = (event: MessageEvent) => {
    if (!isSpliceMessageEvent(event)) return
    if (window.opener && event.source !== window.opener) return
    if (event.data.type !== WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN) return
    if (event.data.origin !== event.origin) return

    stateManager.currentOrigin.set(event.data.origin)
    window.opener?.postMessage(
        {
            type: WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN_ACK,
        } satisfies SpliceMessage,
        event.origin
    )
}

window.addEventListener('message', handleOriginBroadcast)

/**
 * Resolve the dApp origin for the current wallet UI context.
 *
 * - Top-level window (no opener): use `window.origin`.
 * - Popup: prefer a previously stored origin (localStorage), otherwise wait for
 *   the parent `SPLICE_WALLET_BROADCAST_ORIGIN` message (with timeout).
 */
export async function detectCurrentOrigin(
    timeoutMs: number = DETECT_ORIGIN_TIMEOUT_MS
): Promise<string> {
    if (!window.opener) {
        stateManager.currentOrigin.set(window.origin)
        return window.origin
    }

    const existing = stateManager.currentOrigin.get()
    if (existing) {
        return existing
    }

    return new Promise<string>((resolve, reject) => {
        const interval = setInterval(() => {
            const currentOrigin = stateManager.currentOrigin.get()
            if (currentOrigin) {
                cleanup()
                resolve(currentOrigin)
            }
        }, 100)

        const timeout = setTimeout(() => {
            cleanup()
            reject(
                new Error(
                    `Timed out after ${timeoutMs}ms waiting for dApp origin broadcast`
                )
            )
        }, timeoutMs)

        const cleanup = () => {
            clearInterval(interval)
            clearTimeout(timeout)
        }
    })
}
