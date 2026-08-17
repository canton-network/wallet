// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SpliceMessage, WalletEvent } from '@canton-network/core-types'
import { dappController } from './dapp/controller'
import type { Methods } from './dapp/rpc-gen'

/**
 * Take an in-coming JSON-RPC request and route it to the appropriate controller.
 */
export function jsonRpcHandler() {
    browser.runtime.onMessage.addListener(processRequest)
}

async function processRequest(message: unknown) {
    const msg = SpliceMessage.parse(message)

    if (msg.type === WalletEvent.SPLICE_WALLET_REQUEST) {
        const method = msg.request.method as keyof Methods
        const args = msg.request.params

        const store = undefined
        const controller = dappController(store)
        const fn = controller[method] as (params: unknown) => Promise<unknown>

        const resp = await fn(args)

        console.log('received request: ', {
            method,
            args,
            controller,
            fn,
            resp,
        })
        browser.tabs.postMessage(resp)
    }
}
