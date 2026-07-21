// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest'
import type { NextFunction, Request, Response } from 'express'
import { securityHeaders } from './securityHeaders.js'

describe('securityHeaders', () => {
    it('sets the expected security response headers', () => {
        const setHeader = vi.fn()
        const next = vi.fn() as NextFunction
        const middleware = securityHeaders()
        const req = {} as Request
        const res = { setHeader } as unknown as Response

        middleware(req, res, next)

        expect(setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
        expect(setHeader).toHaveBeenCalledWith(
            'Content-Security-Policy',
            "frame-ancestors 'none';"
        )
        expect(setHeader).toHaveBeenCalledWith(
            'X-Content-Type-Options',
            'nosniff'
        )

        expect(next).toHaveBeenCalledOnce()
    })
})
