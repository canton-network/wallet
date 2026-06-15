// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { SDKError } from './SDKError'
import { SDKErrorHandler } from './handler'
import { SDKLogger } from '../logger/logger'

describe('SDKError', () => {
    it('sets message from context and is the instance of Error', () => {
        const err = new SDKError({
            message: 'Something failed',
            type: 'Forbidden',
            originalError: { code: 403 },
        })
        expect(err.message).toBe('Something failed')
        expect(err).toBeInstanceOf(Error)
        expect(err.context).toStrictEqual({
            message: 'Something failed',
            originalError: {
                code: 403,
            },
            type: 'Forbidden',
        })

        const json = err.toJSON()
        expect(json.message).toBe('Something failed')
        expect(json.type).toBe('Forbidden')
    })
})

describe('SDKErrorHandler', () => {
    let logger: SDKLogger
    let handler: SDKErrorHandler

    beforeEach(() => {
        logger = { error: vi.fn() } as unknown as SDKLogger
        handler = new SDKErrorHandler(logger)
    })

    it('throws an SDKError type', () => {
        expect(() =>
            handler.throw({
                message: 'Unauthenticated',
                type: 'Unauthenticated',
            })
        ).toThrow(SDKError)
    })

    it('does not throw when gracefully: true', () => {
        expect(() =>
            handler.throw(
                { message: 'Unauthenticated', type: 'Unauthenticated' },
                { gracefully: true }
            )
        ).not.toThrow()
        expect(logger.error).toHaveBeenCalledOnce()
    })
})
