// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { JsonRpcRequest, JsonRpcResponse } from '@canton-network/core-types'

export type AnyController = Record<
    string,
    (...args: unknown[]) => Promise<unknown>
>
const log = logger.getChild('json-rpc-handler')

/**
 * Take an in-coming JSON-RPC request and route it to the appropriate controller.
 */
export function jsonRpcHandler(
    messenger: BackgroundMessenger,
    controller: AnyController
) {
    messenger.onJsonRpcRequest((request) => processRequest(request, controller))
}

async function processRequest(
    request: JsonRpcRequest,
    controller: AnyController
): Promise<JsonRpcResponse> {
    log.debug('Received request: {*}', { id: request.id, request })

    const { method, params } = request

    const fn = controller[method]
    if (fn === undefined) {
        throw new Error(`Method ${method} does not exist.`)
    }
    const result = await fn(params)

    log.debug('Sending response: {*}', { id: request.id, result })

    return {
        jsonrpc: '2.0',
        id: request.id,
        result,
    }
}
