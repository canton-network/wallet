// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Standard error codes the dApp API returns, adopted from EIP-1193 and EIP-1474.
 * See https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md
 */
export const CIP103_ERROR_CODES = {
    UserRejectedRequest: 4001,
    Unauthorized: 4100,
    UnsupportedMethod: 4200,
    Disconnected: 4900,
    ChainDisconnected: 4901,
    ParseError: -32700,
    InvalidRequest: -32600,
    MethodNotFound: -32601,
    InvalidParams: -32602,
    InternalError: -32603,
    InvalidInput: -32000,
    ResourceNotFound: -32001,
    ResourceUnavailable: -32002,
    TransactionRejected: -32003,
    MethodNotSupported: -32004,
    LimitExceeded: -32005,
} as const satisfies Record<string, number>

export type Cip103ErrorCode =
    (typeof CIP103_ERROR_CODES)[keyof typeof CIP103_ERROR_CODES]

export const CIP103_ERROR_MESSAGES = {
    [CIP103_ERROR_CODES.UserRejectedRequest]: 'User Rejected Request',
    [CIP103_ERROR_CODES.Unauthorized]: 'Unauthorized',
    [CIP103_ERROR_CODES.UnsupportedMethod]: 'Unsupported Method',
    [CIP103_ERROR_CODES.Disconnected]: 'Disconnected',
    [CIP103_ERROR_CODES.ChainDisconnected]: 'Chain Disconnected',
    [CIP103_ERROR_CODES.ParseError]: 'Parse Error',
    [CIP103_ERROR_CODES.InvalidRequest]: 'Invalid Request',
    [CIP103_ERROR_CODES.MethodNotFound]: 'Method Not Found',
    [CIP103_ERROR_CODES.InvalidParams]: 'Invalid Parameters',
    [CIP103_ERROR_CODES.InternalError]: 'Internal Error',
    [CIP103_ERROR_CODES.InvalidInput]: 'Invalid Input',
    [CIP103_ERROR_CODES.ResourceNotFound]: 'Resource Not Found',
    [CIP103_ERROR_CODES.ResourceUnavailable]: 'Resource Unavailable',
    [CIP103_ERROR_CODES.TransactionRejected]: 'Transaction Rejected',
    [CIP103_ERROR_CODES.MethodNotSupported]: 'Method Not Supported',
    [CIP103_ERROR_CODES.LimitExceeded]: 'Limit Exceeded',
} as const satisfies Record<Cip103ErrorCode, string>

export function isCip103ErrorCode(code: unknown): code is Cip103ErrorCode {
    return (
        typeof code === 'number' &&
        (Object.values(CIP103_ERROR_CODES) as number[]).includes(code)
    )
}

/** The error CIP-103 providers reject `request` with (EIP-1193 `ProviderRpcError`). */
export class ProviderRpcError extends Error {
    override readonly name = 'ProviderRpcError'
    readonly code: Cip103ErrorCode
    readonly data?: unknown

    constructor(
        code: Cip103ErrorCode,
        message: string,
        data?: unknown,
        options?: ErrorOptions
    ) {
        super(message, options)
        this.code = code
        this.data = data
    }

    /** Serializes to the JSON-RPC error object, since `message` is not enumerable. */
    toJSON(): { code: Cip103ErrorCode; message: string; data?: unknown } {
        return { code: this.code, message: this.message, data: this.data }
    }
}

function hasNumericCode(
    value: unknown
): value is { code: number; message?: unknown; data?: unknown } {
    return (
        typeof value === 'object' &&
        value !== null &&
        'code' in value &&
        typeof value.code === 'number'
    )
}

/** Normalizes JSON-RPC error objects, full JSON-RPC responses and arbitrary throws, keeping the original as `cause`. */
export function toProviderRpcError(error: unknown): ProviderRpcError {
    if (error instanceof ProviderRpcError) return error
    const rpcError =
        typeof error === 'object' &&
        error !== null &&
        !('code' in error) &&
        'error' in error
            ? error.error
            : error
    if (hasNumericCode(rpcError)) {
        const { message, data } = rpcError
        const code = isCip103ErrorCode(rpcError.code)
            ? rpcError.code
            : CIP103_ERROR_CODES.InternalError
        return new ProviderRpcError(
            code,
            typeof message === 'string' && message !== ''
                ? message
                : CIP103_ERROR_MESSAGES[code],
            data,
            { cause: error }
        )
    }
    return new ProviderRpcError(
        CIP103_ERROR_CODES.InternalError,
        error instanceof Error ? error.message : String(error),
        undefined,
        { cause: error }
    )
}
