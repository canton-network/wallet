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

function processRequest(message: unknown) {
    const msg = SpliceMessage.parse(message)

    if (msg.type === WalletEvent.SPLICE_WALLET_REQUEST) {
        const method = msg.request.method as keyof Methods
        const args = msg.request.params

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fn = (dappController as any)[method] as (
            params: unknown
        ) => Promise<unknown>

        fn(args)
    }
}
