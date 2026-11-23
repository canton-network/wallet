// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { providerErrors } from '@canton-network/core-rpc-errors'
import type { JsonRpcRequest } from '@canton-network/core-types'
import {
    defineExtensionMessaging,
    type RemoveListenerCallback,
} from '@webext-core/messaging'
import type { Browser } from 'wxt/browser'

import { DAPP_RPC_KEY } from '@/shared/service-keys.ts'

import type { DappDispatcher } from './controllers/dapp/dispatch.ts'
import type { PagePresence } from './page-presence.ts'
import type { RequestTab } from './page-presence.ts'

type Sender = Pick<Browser.runtime.MessageSender, 'origin' | 'url'>

/**
 * The web origin of the page a message or port comes from, as the browser
 * reports it. Firefox has no `sender.origin`, so the URL is the fallback.
 * Anything but http and https is refused, extension pages included: they
 * have the user API.
 */
export function senderOrigin(sender: Sender | undefined): string | undefined {
    const value = sender?.origin ?? sender?.url
    if (value === undefined) return undefined
    let url: URL
    try {
        url = new URL(value)
    } catch {
        return undefined
    }
    return url.protocol === 'http:' || url.protocol === 'https:'
        ? url.origin
        : undefined
}

/**
 * The tab and document of a message or port from a content script, if the
 * browser reports a tab. Firefox has no `documentId`, so there the document
 * is the tab and frame, which a reload keeps.
 */
export function senderTab(
    sender:
        | Pick<Browser.runtime.MessageSender, 'documentId' | 'frameId' | 'tab'>
        | undefined
): Omit<RequestTab, 'connection'> | undefined {
    const tab = sender?.tab
    if (tab?.id === undefined || tab.windowId === undefined) return undefined
    return {
        tabId: tab.id,
        windowId: tab.windowId,
        page:
            sender?.documentId ??
            JSON.stringify([tab.id, sender?.frameId ?? 0]),
    }
}

interface ProxyCall {
    path?: unknown
    args?: unknown
}

type ProxyProtocol = Record<string, (call: ProxyCall) => unknown>

/**
 * Answers the content script's `createProxyService(DAPP_RPC_KEY)` calls.
 * proxy-service's `registerService` drops the sender, so this listens on its
 * message type itself and attributes each request to the sender's origin.
 * Any origin argument the caller sends is ignored. Must be called
 * synchronously during background start-up.
 */
export function registerDappService(
    dispatcher: DappDispatcher,
    presence: Pick<PagePresence, 'connection'>
): RemoveListenerCallback {
    const messenger = defineExtensionMessaging<ProxyProtocol>()
    return messenger.onMessage(
        `proxy-service.${DAPP_RPC_KEY}`,
        async ({ sender, data }) => {
            const origin = senderOrigin(sender)
            if (origin === undefined) {
                throw providerErrors.unauthorized({
                    message:
                        'dApp requests must come from an http or https page',
                })
            }
            const path = data?.path
            if (
                !Array.isArray(path) ||
                path.length !== 1 ||
                path[0] !== 'request'
            ) {
                throw new Error('Unknown method')
            }
            const [request] = Array.isArray(data.args) ? data.args : []
            if (typeof request !== 'object' || request === null) {
                throw new Error('Invalid dApp request')
            }
            const page = senderTab(sender)
            return await dispatcher.request(
                request as JsonRpcRequest,
                origin,
                page && {
                    ...page,
                    // Taken before any await, so a prompt can tell whether
                    // the page went while the request waited.
                    connection: presence.connection(page.page, origin),
                }
            )
        }
    )
}
