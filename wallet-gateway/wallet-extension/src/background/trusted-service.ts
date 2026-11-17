// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    defineExtensionMessaging,
    type RemoveListenerCallback,
} from '@webext-core/messaging'
import type { ProxyServiceKey } from '@webext-core/proxy-service'
import { browser, type Browser } from 'wxt/browser'
import { logger } from '@/shared/logger'

/** The extension pages that may use the page services. */
const TRUSTED_PAGES = new Set(['/popup.html', '/app.html'])

const log = logger.getChild('service')

export type Sender = Pick<Browser.runtime.MessageSender, 'id' | 'url'>

/**
 * Whether a message comes from the extension's popup or app page. Content
 * scripts share the extension's ID, so the URL decides; its hash and query
 * don't matter. `sender.tab` doesn't help, since app.html opens in a tab.
 */
export function isTrustedSender(sender: Sender): boolean {
    if (sender.id !== browser.runtime.id || sender.url === undefined) {
        return false
    }
    let url: URL
    try {
        url = new URL(sender.url)
    } catch {
        return false
    }
    // Compare protocol and host, not `origin`: the URL standard gives
    // non-web schemes an opaque origin ("null"), which every such URL shares.
    const extension = new URL(browser.runtime.getURL('/'))
    return (
        url.protocol === extension.protocol &&
        url.host === extension.host &&
        TRUSTED_PAGES.has(url.pathname)
    )
}

/** What `createProxyService` sends. Pages are untrusted input, so unknown. */
interface ProxyCall {
    path?: unknown
    args?: unknown
}

type ProxyProtocol = Record<string, (call: ProxyCall) => unknown>

/**
 * Finds the method at `path`, following only own properties of plain
 * objects, so inherited members such as `constructor` or `toString` can't be
 * called. Returns the method's parent as its `this`.
 */
function resolveMethod(
    service: object,
    path: unknown
): { target: object; method: (...args: unknown[]) => unknown } {
    if (
        !Array.isArray(path) ||
        path.length === 0 ||
        !path.every((name) => typeof name === 'string')
    ) {
        throw new Error('Invalid method path')
    }
    let target: object = service
    let value: unknown = service
    for (const name of path) {
        if (
            typeof value !== 'object' ||
            value === null ||
            !Object.hasOwn(value, name)
        ) {
            throw new Error(`Unknown method ${path.join('.')}`)
        }
        target = value
        value = (value as Record<string, unknown>)[name]
    }
    if (typeof value !== 'function') {
        throw new Error(`Unknown method ${path.join('.')}`)
    }
    return { target, method: value as (...args: unknown[]) => unknown }
}

/**
 * Answers `createProxyService(key)` calls from the extension pages only.
 * proxy-service's `registerService` ignores the sender, so any context of
 * the extension, the content script included, could call it. This one
 * refuses senders `isTrustedSender` rejects and calls only the service's own
 * methods. Must be called synchronously during background start-up, so a
 * message that wakes the service worker is handled. Arguments are never
 * logged.
 */
export function registerTrustedService<T extends object>(
    key: ProxyServiceKey<T>,
    service: T
): RemoveListenerCallback {
    const messenger = defineExtensionMessaging<ProxyProtocol>()
    return messenger.onMessage(
        `proxy-service.${key}`,
        async ({ type, sender, data }) => {
            if (!isTrustedSender(sender)) {
                log.warn('Refused {type} from an untrusted sender', { type })
                throw new Error(`${type} is only for the extension pages.`)
            }
            const { target, method } = resolveMethod(service, data?.path)
            if (!Array.isArray(data.args)) {
                throw new Error('Invalid method arguments')
            }
            return await method.apply(target, data.args)
        }
    )
}
