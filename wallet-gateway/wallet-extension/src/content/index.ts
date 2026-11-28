// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { announceSelf } from './announce-self.ts'
import { jsonRpcProxy } from './json-rpc-proxy.ts'
import { createNotificationRelay } from './notification-relay.ts'

/**
 * Runs in the content script: announces the wallet to the page, proxies dApp
 * JSON-RPC requests to the background and relays notifications back.
 */
export function startContent(): void {
    // An opaque origin (e.g. a CSP-sandboxed page) is not the origin of its
    // URL, which is all the background sees in Firefox. Such a page must not
    // act with that origin's approval, so it gets no wallet at all.
    if (window.origin === 'null') return
    announceSelf()
    jsonRpcProxy(createNotificationRelay())
}
