// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { apiKeyAuth } from './apiKeyAuth.js'
import { pino } from 'pino'
import { sink } from 'pino-test'
import { Store } from '@canton-network/core-wallet-store'
import { AuthAware } from '@canton-network/core-wallet-auth'
import crypto from 'crypto'

type ApiKeyStore = Pick<
    Store,
    'getApiKey' | 'getNetwork' | 'getIdp' | 'setSession'
>

vi.mock('@canton-network/core-wallet-auth', async () => {
    const actual = await vi.importActual<
        typeof import('@canton-network/core-wallet-auth')
    >('@canton-network/core-wallet-auth')
    return {
        ...actual,
        AuthTokenProvider: {
            fromGatewayConfig: vi.fn().mockReturnValue({
                getAuthContext: vi.fn().mockResolvedValue({
                    userId: 'service_account',
                    accessToken: 'abc',
                }),
            }),
        },
    }
})

describe('apiKeyAuth', () => {
    const getApiKey = vi.fn()
    const logger = pino({ level: 'silent' }, sink())
    const store: ApiKeyStore & AuthAware<ApiKeyStore> = {
        getApiKey,
        getNetwork: vi.fn().mockResolvedValue({
            id: 'canton:local-oauth',
            identityProviderId: 'idp-mock-oauth',
            serviceAccountAuth: {
                method: 'client_credentials',
                scope: 'daml_ledger_api',
                audience: 'aud',
                clientId: 'service_account',
                clientSecret: 'service-account-secret',
            },
        }),
        getIdp: vi.fn().mockResolvedValue({
            id: 'idp-mock-oauth',
            type: 'oauth',
            issuer: 'http://127.0.0.1:8889',
            configUrl: 'http://127.0.0.1:8889/.well-known/openid-configuration',
        }),
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
        getApiKey.mockReset()
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
            baseUrl: '/api/v0/dapp',
            path: '/',
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
        const middleware = apiKeyAuth(
            store as Store & AuthAware<Store>,
            '/api/v0/dapp',
            logger
        )
        await middleware(req, res, next)
        expect(getApiKey).not.toHaveBeenCalled()
        expect(req.authContext).toBeUndefined()
        expect(next).toHaveBeenCalledOnce()
    })

    it('sets authContext and calls next when verification succeeds', async () => {
        const ctx = {
            userId: 'alice',
            ledgerUserId: 'service_account',
            accessToken: 'abc',
            isApiKey: true,
            email: undefined,
        }

        getApiKey.mockResolvedValue({
            id: 'key1',
            digest: crypto.createHash('sha256').update('abc').digest('hex'),
            userId: 'alice',
        })

        const req = makeReq({
            headers: { authorization: 'ApiKey abc' },
        })
        const res = makeRes()

        const middleware = apiKeyAuth(
            store as Store & AuthAware<Store>,
            '/api/v0/dapp',
            logger
        )
        await middleware(req, res, next)

        expect(getApiKey).toHaveBeenCalled()
        expect(req.authContext).toEqual(ctx)
        expect(next).toHaveBeenCalledOnce()
        expect(status).not.toHaveBeenCalled()
    })

    it('returns 401 JSON when no matching API key is found', async () => {
        getApiKey.mockResolvedValue(null)

        const req = makeReq({
            headers: { authorization: 'ApiKey invalid' },
        })
        const res = makeRes()

        const middleware = apiKeyAuth(
            store as Store & AuthAware<Store>,
            '/api/v0/dapp',
            logger
        )
        await middleware(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(status).toHaveBeenCalledWith(401)
        expect(json).toHaveBeenCalledWith({
            error: {
                code: -32600,
                message: 'API Key is invalid',
            },
            id: null,
            jsonrpc: '2.0',
        })
    })
})
