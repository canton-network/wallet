// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import type { AuthAware, AuthContext } from '@canton-network/core-wallet-auth'
import { pino } from 'pino'
import { sink } from 'pino-test'
import { sessionHandler } from './sessionHandler.js'
import { Store } from '@canton-network/core-wallet-store'

describe('sessionHandler', () => {
    const getSession = vi.fn()
    const withAuthContext = vi.fn(() => ({ getSession }))
    const store = { withAuthContext } as unknown as Store & AuthAware<Store>
    const logger = pino({ level: 'silent' }, sink())

    const allowedPaths = {
        '/api/v0/user': ['addSession', 'listNetworks', 'getUser'],
        '/api/v0/dapp': ['*'],
    }

    let next: NextFunction
    let status: ReturnType<typeof vi.fn>
    let json: ReturnType<typeof vi.fn>

    const authContext: AuthContext = {
        userId: 'user-1',
        accessToken: 'access-token',
    }

    beforeEach(() => {
        getSession.mockReset()
        withAuthContext.mockClear()
        withAuthContext.mockReturnValue({ getSession })
        next = vi.fn() as NextFunction
        status = vi.fn().mockReturnThis()
        json = vi.fn()
    })

    function makeReq(
        partial: Partial<Request> & {
            method?: string
            baseUrl?: string
            body?: { method?: string }
            authContext?: AuthContext
        }
    ): Request {
        return {
            method: 'POST',
            baseUrl: '/api/v0/user',
            body: { method: 'listWallets' },
            authContext,
            ...partial,
        } as Request
    }

    function makeRes(): Response {
        return { status, json } as unknown as Response
    }

    it('skips session check for non-POST requests', async () => {
        const req = makeReq({ method: 'GET' })
        const res = makeRes()
        const middleware = sessionHandler(store, allowedPaths, logger)

        await middleware(req, res, next)

        expect(withAuthContext).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledOnce()
        expect(status).not.toHaveBeenCalled()
    })

    it('allows unauthenticated POST when the RPC method is on the allow list', async () => {
        const req = makeReq({ body: { method: 'addSession' } })
        const res = makeRes()
        const middleware = sessionHandler(store, allowedPaths, logger)

        await middleware(req, res, next)

        expect(withAuthContext).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledOnce()
        expect(status).not.toHaveBeenCalled()
    })

    it('allows unauthenticated POST when the path uses a wildcard allow list', async () => {
        const req = makeReq({
            baseUrl: '/api/v0/dapp',
            body: { method: 'connect' },
        })
        const res = makeRes()
        const middleware = sessionHandler(store, allowedPaths, logger)

        await middleware(req, res, next)

        expect(withAuthContext).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledOnce()
    })

    it('calls next when an active session exists for a protected method', async () => {
        getSession.mockResolvedValue({
            id: 'session-1',
            network: 'network1',
            accessToken: 'session-token',
        })
        const req = makeReq({ body: { method: 'listWallets' } })
        const res = makeRes()
        const middleware = sessionHandler(store, allowedPaths, logger)

        await middleware(req, res, next)

        expect(withAuthContext).toHaveBeenCalledWith(authContext)
        expect(getSession).toHaveBeenCalled()
        expect(next).toHaveBeenCalledOnce()
        expect(status).not.toHaveBeenCalled()
    })

    it('returns 401 when no session exists for a protected method', async () => {
        getSession.mockResolvedValue(undefined)
        const req = makeReq({ body: { method: 'listWallets' } })
        const res = makeRes()
        const middleware = sessionHandler(store, allowedPaths, logger)

        await middleware(req, res, next)

        expect(withAuthContext).toHaveBeenCalledWith(authContext)
        expect(next).not.toHaveBeenCalled()
        expect(status).toHaveBeenCalledWith(401)
        expect(json).toHaveBeenCalledWith({
            error: 'No active session found',
        })
    })

    it('requires a session when the path is not in the allow list config', async () => {
        getSession.mockResolvedValue(undefined)
        const req = makeReq({
            baseUrl: '/api/v0/other',
            body: { method: 'addSession' },
        })
        const res = makeRes()
        const middleware = sessionHandler(store, allowedPaths, logger)

        await middleware(req, res, next)

        expect(withAuthContext).toHaveBeenCalledWith(authContext)
        expect(status).toHaveBeenCalledWith(401)
    })

    it('requires a session when the RPC method is not on the path allow list', async () => {
        getSession.mockResolvedValue(undefined)
        const req = makeReq({ body: { method: 'removeSession' } })
        const res = makeRes()
        const middleware = sessionHandler(store, allowedPaths, logger)

        await middleware(req, res, next)

        expect(withAuthContext).toHaveBeenCalledWith(authContext)
        expect(status).toHaveBeenCalledWith(401)
    })
})
