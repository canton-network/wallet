// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { JsonRpcRequest, JsonRpcResponse } from '@canton-network/core-types'
import { dappController } from './dapp/controller'
import type { Methods } from './dapp/rpc-gen'
import type { Store } from '@canton-network/core-wallet-store'

/**
 * Take an in-coming JSON-RPC request and route it to the appropriate controller.
 */
export function jsonRpcHandler(messenger: BackgroundMessenger, store: Store) {
    messenger.onJsonRpcRequest((request) => processRequest(request, store))
}

const log = logger.getChild('json-rpc-handler')

async function processRequest(
    request: JsonRpcRequest,
    store: Store
): Promise<JsonRpcResponse> {
    log.debug('Received request: {*}', { id: request.id, request })
    const controller = dappController(store)

    const method = request.method as keyof Methods
    const args = request.params

    const fn = controller[method] as (params: unknown) => Promise<unknown>

    const result = await fn(args)

    log.debug('Sending response: {*}', { id: request.id, result })

    return {
        jsonrpc: '2.0',
        id: request.id,
        result,
    }
}
