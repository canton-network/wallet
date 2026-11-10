// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest'
import type { AuthService } from '@canton-network/core-wallet-auth'
import { jwtAuth } from './jwtAuth.js'
import { issueSseTicket } from './sseTicket.js'

function authService(): AuthService {
    return {
        verifyToken: async (header) => {
            if (header !== 'Bearer session-token') {
                throw new Error('rejected')
            }
            return { userId: 'user-1', accessToken: 'session-token' }
        },
    } as AuthService
}

function run(query: Record<string, string>, authorization?: string) {
    const req = {
        headers: authorization ? { authorization } : {},
        query,
        body: {},
    }
    let status = 0
    const res = {
        status(code: number) {
            status = code
            return this
        },
        json() {
            return this
        },
    }
    let passed = false
    const next = () => {
        passed = true
    }
    return jwtAuth(authService(), {
        warn() {},
        error() {},
        child() {
            return this
        },
    } as never)(req as never, res as never, next).then(() => ({
        passed,
        status,
        context: (req as { authContext?: { accessToken?: string } })
            .authContext,
    }))
}

describe('sse tickets', () => {
    it('accepts a ticket and rejects the session token in the query string', async () => {
        const ticket = issueSseTicket('session-token')
        vi.spyOn(Date, 'now').mockRestore()

        const fromTicket = await run({ ticket })
        expect(fromTicket.passed).toBe(true)
        expect(fromTicket.context?.accessToken).toBe('session-token')

        const fromQueryToken = await run({ token: 'session-token' })
        expect(fromQueryToken.passed).toBe(false)
        expect(fromQueryToken.status).toBe(401)
    })
})
