// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { jwtAuth } from './jwtAuth.js'
import { pino } from 'pino'
import { sink } from 'pino-test'

describe('jwtAuth', () => {
    const verifyToken = vi.fn()
    const authService = { verifyToken }
    const logger = pino({ level: 'silent' }, sink())
    let next: NextFunction
    let status: ReturnType<typeof vi.fn>
    let json: ReturnType<typeof vi.fn>

    beforeEach(() => {
        verifyToken.mockReset()
        next = vi.fn() as NextFunction
        status = vi.fn().mockReturnThis()
        json = vi.fn()
    })

    function makeReq(
        partial: Partial<Request> & {
            headers?: { authorization?: string }
            query?: Record<string, unknown>
        }
    ): Request {
        return {
            headers: {},
            query: {},
            ...partial,
        } as Request
    }

    function makeRes(): Response {
        return { status, json } as unknown as Response
    }

    it('sets authContext and calls next when verification succeeds', async () => {
        const ctx = { userId: 'alice', accessToken: 'tok' }
        verifyToken.mockResolvedValue(ctx)

        const req = makeReq({
            headers: { authorization: 'Bearer abc' },
        })
        const res = makeRes()
        const middleware = jwtAuth(authService, logger)

        await middleware(req, res, next)

        expect(verifyToken).toHaveBeenCalledWith('Bearer abc')
        expect(req.authContext).toEqual(ctx)
        expect(next).toHaveBeenCalledOnce()
        expect(status).not.toHaveBeenCalled()
    })

    it('uses Bearer token from query when Authorization header is absent', async () => {
        const ctx = { userId: 'bob', accessToken: 'tok' }
        verifyToken.mockResolvedValue(ctx)

        const req = makeReq({
            query: { token: 'query-jwt' },
        })
        const res = makeRes()
        const middleware = jwtAuth(authService, logger)

        await middleware(req, res, next)

        expect(verifyToken).toHaveBeenCalledWith('Bearer query-jwt')
        expect(req.authContext).toEqual(ctx)
        expect(next).toHaveBeenCalledOnce()
    })

    it('passes undefined to verifyToken when no credentials are present', async () => {
        verifyToken.mockResolvedValue(undefined)

        const req = makeReq({})
        const res = makeRes()
        const middleware = jwtAuth(authService, logger)

        await middleware(req, res, next)

        expect(verifyToken).toHaveBeenCalledWith(undefined)
        expect(req.authContext).toBeUndefined()
        expect(next).toHaveBeenCalledOnce()
    })

    it('returns 401 JSON when verification throws', async () => {
        verifyToken.mockRejectedValue(new Error('bad sig'))

        const req = makeReq({
            headers: { authorization: 'Bearer x' },
        })
        const res = makeRes()
        const middleware = jwtAuth(authService, logger)

        await middleware(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(status).toHaveBeenCalledWith(401)
        expect(json).toHaveBeenCalledWith({
            error: 'Invalid or expired token: bad sig',
        })
    })

    it('stringifies non-Error rejection values in the response', async () => {
        verifyToken.mockRejectedValue('rejected')

        const req = makeReq({
            headers: { authorization: 'Bearer x' },
        })
        const res = makeRes()
        const middleware = jwtAuth(authService, logger)

        await middleware(req, res, next)

        expect(json).toHaveBeenCalledWith({
            error: 'Invalid or expired token: rejected',
        })
    })
})
