// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    errorCodes as rpcErrorCodes,
    JsonRpcError as RpcJsonRpcError,
} from '@canton-network/core-rpc-errors'

// errorCodes and JsonRpcError are typed here instead of re-exported, so the published declarations
// don't reference @metamask/utils, whose types fail strict consumers (skipLibCheck: false).

export const errorCodes = rpcErrorCodes

export interface SerializedJsonRpcError {
    code: number
    message: string
    data?: unknown
    stack?: string
}

/** The error the SDK rejects with, carrying a code from `errorCodes`. */
export interface JsonRpcError<Data = unknown> extends Error {
    cause?: unknown
    code: number
    data?: Data
    serialize(): SerializedJsonRpcError
}

export const JsonRpcError = RpcJsonRpcError as new <Data = unknown>(
    code: number,
    message: string,
    data?: Data
) => JsonRpcError<Data>

/** @deprecated No longer emitted; errors are `JsonRpcError`s with a code from `errorCodes`. */
export enum ErrorCode {
    ProviderNotFound,
    UserCancelled,
    Timeout,
    TransactionFailed,
    Other,
}
