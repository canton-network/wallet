// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { apiKeyAuth } from './apiKeyAuth.js'
import { pino } from 'pino'
import { sink } from 'pino-test'
import { Store } from '@canton-network/core-wallet-store/dist/Store.js'
import { AuthAware } from '../../../../core/wallet-auth/dist/auth-service.js'
import crypto from 'crypto'

type ApiKeyStore = Pick<Store, 'listApiKeys' | 'setSession'>

describe('apiKeyAuth', () => {
    const listApiKeys = vi.fn()
    const logger = pino({ level: 'silent' }, sink())
    const store: ApiKeyStore & AuthAware<ApiKeyStore> = {
        listApiKeys,
        setSession: vi.fn(),
        authContext: undefined,
        withAuthContext(context) {
            this.authContext = context
            return this
        },
    }
    let next: NextFunction
    let status: ReturnType<typeof vi.fn>
    let json: ReturnType<typeof vi.fn>

    beforeEach(() => {
        listApiKeys.mockReset()
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

    it('skips processing if using JWT auth', async () => {
        const req = makeReq({
            headers: { authorization: 'Bearer abc' },
        })
        const res = makeRes()
        const middleware = apiKeyAuth(store as Store & AuthAware<Store>, logger)
        await middleware(req, res, next)
        expect(listApiKeys).not.toHaveBeenCalled()
        expect(req.authContext).toBeUndefined()
        expect(next).toHaveBeenCalledOnce()
    })

    it('sets authContext and calls next when verification succeeds', async () => {
        const ctx = { userId: 'alice', accessToken: 'abc', isApiKey: true }
        listApiKeys.mockResolvedValue([
            {
                id: 'key1',
                digest: crypto.createHash('sha256').update('abc').digest('hex'),
                userId: 'alice',
            },
        ])

        const req = makeReq({
            headers: { authorization: 'ApiKey abc' },
        })
        const res = makeRes()

        const middleware = apiKeyAuth(store as Store & AuthAware<Store>, logger)
        await middleware(req, res, next)

        expect(listApiKeys).toHaveBeenCalled()
        expect(req.authContext).toEqual(ctx)
        expect(next).toHaveBeenCalledOnce()
        expect(status).not.toHaveBeenCalled()
    })

    it('returns 401 JSON when no matching API key is found', async () => {
        listApiKeys.mockResolvedValue([])

        const req = makeReq({
            headers: { authorization: 'ApiKey invalid' },
        })
        const res = makeRes()

        const middleware = apiKeyAuth(store as Store & AuthAware<Store>, logger)
        await middleware(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(status).toHaveBeenCalledWith(401)
        expect(json).toHaveBeenCalledWith({
            error: 'Invalid API Key provided',
        })
    })
})
