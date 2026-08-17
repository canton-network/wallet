// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    SpliceMessage,
    WalletEvent,
    type SpliceMessageEvent,
} from '@canton-network/core-types'

/**
 * Proxies JSON-RPC requests, responses, between the dApp page (window message events),
 * and the background script (extension runtime messages)
 */
export function jsonRpcProxy() {
    const runtimeId = browser.runtime?.id

    const shouldHandle = (target: string | undefined): boolean => {
        if (!target) return true
        if (!runtimeId) return false
        return target === runtimeId
    }

    window.addEventListener('message', async (event: SpliceMessageEvent) => {
        console.log('Content script received message:', event.data)

        const { data: msg, success } = SpliceMessage.safeParse(event.data)

        if (!success) {
            // not a valid SpliceMessage, ignore
            return
        }

        // Forward JSON RPC requests to the background script
        if (msg.type === WalletEvent.SPLICE_WALLET_REQUEST) {
            if (!shouldHandle(msg.target)) return

            // Proxy the message to the extension background script
            // and wait for the response
            const msgResponse = await browser.runtime.sendMessage(msg)

            console.log('Received response from background:', msgResponse)
            const response = SpliceMessage.parse(msgResponse)

            window.postMessage(response, '*')
        }

        // Forward UI open requests to the background script
        if (msg.type === WalletEvent.SPLICE_WALLET_EXT_OPEN) {
            if (!shouldHandle(msg.target)) return
            await browser.runtime.sendMessage(msg)
        }

        // Acknowledge the extension readiness request
        if (msg.type === WalletEvent.SPLICE_WALLET_EXT_READY) {
            if (!shouldHandle(msg.target)) return
            window.postMessage(
                {
                    type: WalletEvent.SPLICE_WALLET_EXT_ACK,
                    target: msg.target,
                },
                '*'
            )
        }
    })
}
