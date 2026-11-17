// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { announceSelf } from './announce-self.ts'
import { jsonRpcProxy } from './json-rpc-proxy.ts'
import { createNotificationRelay } from './notification-relay.ts'

export default defineContentScript({
    matches: ['file://*/*', 'http://*/*', 'https://*/*'],
    main() {
        // initialize content script
        announceSelf()
        jsonRpcProxy(createNotificationRelay())
    },
})
