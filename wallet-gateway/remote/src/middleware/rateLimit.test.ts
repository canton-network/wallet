// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest'
import express, { type Request } from 'express'
import request from 'supertest'
import { pino } from 'pino'
import { sink } from 'pino-test'
import {
    IdpUnavailableError,
    type AuthService,
} from '@canton-network/core-wallet-auth'
import {
    authenticatedRateLimiter,
    ipRateLimitKeyGenerator,
    preAuthIpRateLimiter,
    rateLimitKeyGenerator,
} from './rateLimit.js'
import { jwtAuth } from './jwtAuth.js'

describe('ipRateLimitKeyGenerator', () => {
    test('uses request ip address', () => {
        const req = {
            ip: '198.51.100.42',
            socket: { remoteAddress: '10.0.0.1' },
        } as Request

        expect(ipRateLimitKeyGenerator(req)).toBe('ip:198.51.100.42')
    })

    test('leaves IPv4 request ip address unchanged', () => {
        const req = {
            ip: '198.51.100.42',
            socket: { remoteAddress: '10.0.0.1' },
        } as Request

        expect(ipRateLimitKeyGenerator(req)).toBe('ip:198.51.100.42')
    })

    test('normalizes IPv6 request ip address to a subnet key', () => {
        const req = {
            ip: '2001:db8:abcd:0012:1111:2222:3333:4444',
            socket: { remoteAddress: '10.0.0.1' },
        } as Request

        expect(ipRateLimitKeyGenerator(req)).toBe('ip:2001:db8:abcd::/56')
    })

    test('falls back to socket.remoteAddress when ip is unset', () => {
        const req = {
            socket: { remoteAddress: '10.0.0.2' },
        } as Request

        expect(ipRateLimitKeyGenerator(req)).toBe('ip:10.0.0.2')
    })

    test('uses unknown when neither ip nor remoteAddress is set', () => {
        const req = {
            socket: {},
        } as Request

        expect(ipRateLimitKeyGenerator(req)).toBe('ip:unknown')
    })
})

describe('rateLimitKeyGenerator', () => {
    test('uses authenticated user id when available', () => {
        const req = {
            authContext: { userId: 'alice' },
            ip: '203.0.113.10',
            socket: { remoteAddress: '10.0.0.1' },
        } as Request

        expect(rateLimitKeyGenerator(req)).toBe('user:alice')
    })

    test('falls back to request ip when user is not authenticated', () => {
        const req = {
            ip: '198.51.100.42',
            socket: { remoteAddress: '10.0.0.1' },
        } as Request

        expect(rateLimitKeyGenerator(req)).toBe('ip:198.51.100.42')
    })
})

describe('API rate limiting', () => {
    const limit = 2
    let verifications = 0
    // "Bearer user:<id>" verifies, "Bearer idp-down" cannot be verified,
    // "Bearer rejected" is rejected and any other token does not verify
    const authService: AuthService = {
        verifyToken: async (accessToken) => {
            verifications++
            if (accessToken === 'Bearer idp-down') {
                throw new IdpUnavailableError('IdP unavailable')
            }
            if (accessToken === 'Bearer rejected') {
                throw new Error('Invalid signature')
            }
            return accessToken?.startsWith('Bearer user:')
                ? { userId: accessToken.slice(12), accessToken }
                : undefined
        },
    }

    // Same middleware order as the API routes in init.ts, without apiKeyAuth
    function createApp() {
        verifications = 0
        const logger = pino(sink())
        const app = express()
        app.use(
            '/api',
            preAuthIpRateLimiter(limit),
            jwtAuth(authService, logger),
            authenticatedRateLimiter(limit)
        )
        app.post('/api', (_req, res) => {
            res.json({ ok: true })
        })
        return app
    }

    async function statuses(app: express.Express, authorization?: string) {
        const result: number[] = []
        for (let i = 0; i < limit + 1; i++) {
            const req = request(app).post('/api')
            const res = await (authorization
                ? req.set('Authorization', authorization)
                : req)
            result.push(res.status)
        }
        return result
    }

    test('limits requests without a token by ip', async () => {
        expect(await statuses(createApp())).toEqual([200, 200, 429])
    })

    test('limits requests with a token that does not verify by ip', async () => {
        const app = createApp()

        expect(await statuses(app, 'Bearer invalid')).toEqual([200, 200, 429])
        // Another invalid token from the same ip shares the budget
        expect(await statuses(app, 'Bearer other')).toEqual([429, 429, 429])
    })

    test('limits rejected tokens by ip', async () => {
        expect(await statuses(createApp(), 'Bearer rejected')).toEqual([
            401, 401, 429,
        ])
    })

    test('stops verifying tokens by ip while the identity provider is unavailable', async () => {
        const app = createApp()

        expect(await statuses(app, 'Bearer idp-down')).toEqual([503, 503, 429])
        expect(verifications).toBe(limit)
    })

    test('limits api key requests by ip before authentication', async () => {
        // Invalid API keys are rejected before the authenticated limiter
        expect(await statuses(createApp(), 'ApiKey invalid')).toEqual([
            200, 200, 429,
        ])
    })

    test('limits verified users per user only', async () => {
        const app = createApp()

        expect(await statuses(app, 'Bearer user:alice')).toEqual([
            200, 200, 429,
        ])
        // Requests of verified users do not use up the budget of their ip
        expect(await statuses(app, 'Bearer user:bob')).toEqual([200, 200, 429])
        expect(await statuses(app, 'Bearer user:carol')).toEqual([
            200, 200, 429,
        ])
    })
})
