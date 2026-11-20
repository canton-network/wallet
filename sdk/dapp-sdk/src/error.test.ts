// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    errorCodes as rpcErrorCodes,
    JsonRpcError as RpcJsonRpcError,
    providerErrors,
} from '@canton-network/core-rpc-errors'
import { describe, expect, expectTypeOf, it } from 'vitest'

import { errorCodes, JsonRpcError } from './error.ts'

describe('error', () => {
    it('re-exports the core-rpc-errors values', () => {
        expect(errorCodes).toBe(rpcErrorCodes)
        expect(JsonRpcError).toBe(RpcJsonRpcError)
        expect(providerErrors.userRejectedRequest()).toBeInstanceOf(
            JsonRpcError
        )
    })

    it('keeps the local types compatible with @metamask/rpc-errors', () => {
        expectTypeOf<RpcJsonRpcError<undefined>>().toExtend<
            JsonRpcError<undefined>
        >()
        expectTypeOf(errorCodes).toEqualTypeOf(rpcErrorCodes)
    })
})
