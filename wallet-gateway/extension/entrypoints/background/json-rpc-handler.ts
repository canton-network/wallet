// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    ErrorResponse,
    JsonRpcResponse,
    SpliceMessage,
    WalletEvent,
} from '@canton-network/core-types'
import { dappController } from './dapp/controller'
import type { Methods } from './dapp/rpc-gen'
import {
    JsonRpcError,
    rpcErrors,
    toHttpErrorCode,
} from '@canton-network/core-rpc-errors'
import { isJsCantonError } from '@canton-network/core-ledger-client'
import { jsonRpcResponse } from '@canton-network/core-rpc-transport'

/**
 * Handles JSON-RPC errors and maps them to HTTP responses.
 * @param error The error that occurred.
 * @param id The JSON-RPC request ID.
 * @param logger The logger instance.
 * @param method The name of the JSON-RPC method being called.
 * @returns A tuple containing the HTTP status code and the JSON-RPC response.
 */
export const handleRpcError = (
    error: unknown,
    id: string | number | null,
    method?: string
): [number, JsonRpcResponse] => {
    const genericMessage = method
        ? `Something went wrong while calling ${method}`
        : 'Something went wrong'

    let response: ErrorResponse = {
        error: {
            ...rpcErrors.internal(),
            message: genericMessage,
            data: error,
        },
    }

    if (error instanceof JsonRpcError) {
        response.error = error
        const httpCode = toHttpErrorCode(error.code)
        return [httpCode, jsonRpcResponse(id, response)]
    }

    if (isJsCantonError(error)) {
        response.error = {
            code: rpcErrors.internal().code,
            message: error.cause,
            data: error,
        }
    }

    if (error instanceof Error) {
        response.error.message = error.message
    } else if (typeof error === 'string') {
        response.error.message = error
    } else if (ErrorResponse.safeParse(error).success) {
        response = error as ErrorResponse
    } else if (
        // Check for a Ledger API error format
        typeof error === 'object' &&
        error !== null &&
        'cause' in error &&
        'code' in error
    ) {
        response.error.message = error.cause as string
        response.error.data = error
    }

    const jsonResponse = jsonRpcResponse(id, response)
    return [500, jsonResponse]
}

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
        browser.tabs.sendMessage(0, resp)
    }
}
