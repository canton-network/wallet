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
} as const satisfies Record<Cip103ErrorCode, string>

export function isCip103ErrorCode(code: unknown): code is Cip103ErrorCode {
    return (
        typeof code === 'number' &&
        (Object.values(CIP103_ERROR_CODES) as number[]).includes(code)
    )
}
