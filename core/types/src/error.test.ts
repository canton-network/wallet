// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import {
    CIP103_ERROR_CODES,
    isCip103ErrorCode,
    ProviderRpcError,
    toProviderRpcError,
} from './error'

describe('core/errors', () => {
    it('recognizes standard codes and rejects everything else', () => {
        for (const code of Object.values(CIP103_ERROR_CODES))
            expect(isCip103ErrorCode(code)).toBe(true)
        expect(isCip103ErrorCode(9999)).toBe(false)
        expect(isCip103ErrorCode('4001')).toBe(false)
    })

    /** Pins the table in https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md */
    it('covers every code CIP-103 defines, and no others', () => {
        expect(new Set(Object.values(CIP103_ERROR_CODES))).toStrictEqual(
            new Set([
                4001, 4100, 4200, 4900, 4901, -32700, -32600, -32601, -32602,
                -32603, -32000, -32001, -32002, -32003, -32004, -32005,
            ])
        )
    })

    it.each([
        [
            'a JSON-RPC error object',
            { code: 4001, message: 'Rejected', data: 'x' },
            { code: 4001, message: 'Rejected', data: 'x' },
        ],
        [
            'a full JSON-RPC response',
            { jsonrpc: '2.0', id: 1, error: { code: 4100, message: 'No' } },
            { code: 4100, message: 'No' },
        ],
        [
            'an error without a message',
            { code: -32003, message: '' },
            { code: -32003, message: 'Transaction Rejected' },
        ],
        [
            'a code outside CIP-103',
            { error: { code: 500, message: 'Internal Server Error' } },
            {
                code: CIP103_ERROR_CODES.InternalError,
                message: 'Internal Server Error',
            },
        ],
        [
            'a plain Error',
            new Error('boom'),
            { code: CIP103_ERROR_CODES.InternalError, message: 'boom' },
        ],
        [
            'a non-numeric code',
            Object.assign(new Error('refused'), { code: 'ECONNREFUSED' }),
            { code: CIP103_ERROR_CODES.InternalError, message: 'refused' },
        ],
    ])('normalizes %s', (_, input, expected) => {
        const error = toProviderRpcError(input)
        expect(error).toBeInstanceOf(ProviderRpcError)
        expect(error).toBeInstanceOf(Error)
        expect(error).toMatchObject(expected)
        expect(error.cause).toBe(input)
    })

    it('passes provider errors through unchanged', () => {
        const error = new ProviderRpcError(4001, 'Rejected')
        expect(toProviderRpcError(error)).toBe(error)
    })

    it('serializes to a JSON-RPC error object', () => {
        expect(
            JSON.parse(
                JSON.stringify(new ProviderRpcError(4001, 'Rejected', 'x'))
            )
        ).toStrictEqual({ code: 4001, message: 'Rejected', data: 'x' })
        expect(
            JSON.parse(JSON.stringify(new ProviderRpcError(4100, 'No')))
        ).toStrictEqual({ code: 4100, message: 'No' })
    })
})
