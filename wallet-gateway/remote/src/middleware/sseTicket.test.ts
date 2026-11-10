// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AuthService } from '@canton-network/core-wallet-auth'
import { jwtAuth } from './jwtAuth.js'
import { issueSseTicket, resolveSseTicket } from './sseTicket.js'

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

function run(
    query: Record<string, string>,
    extra: { authorization?: string; method?: string; path?: string } = {}
) {
    const req = {
        headers: extra.authorization
            ? { authorization: extra.authorization }
            : {},
        query,
        body: {},
        method: extra.method ?? 'GET',
        path: extra.path ?? '/events',
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
    afterEach(() => {
        vi.useRealTimers()
    })

    it('accepts a ticket on the event stream and still accepts a legacy query token', async () => {
        const ticket = issueSseTicket('session-token')

        const fromTicket = await run({ ticket })
        expect(fromTicket.passed).toBe(true)
        expect(fromTicket.context?.accessToken).toBe('session-token')

        const fromQueryToken = await run({ token: 'session-token' })
        expect(fromQueryToken.passed).toBe(true)
        expect(fromQueryToken.context?.accessToken).toBe('session-token')
    })

    it('does not accept a ticket on any other route', async () => {
        const ticket = issueSseTicket('session-token')

        const minted = await run(
            { ticket },
            { method: 'POST', path: '/events/ticket' }
        )
        expect(minted.passed).toBe(false)
        expect(minted.status).toBe(401)

        const status = await run({ ticket }, { method: 'POST', path: '/' })
        expect(status.passed).toBe(false)
        expect(status.status).toBe(401)
    })

    it('drops a ticket when the minute is up, whether or not it was used', () => {
        vi.useFakeTimers()
        const used = issueSseTicket('session-token')
        expect(resolveSseTicket(used)).toBe('session-token')

        const unused = issueSseTicket('session-token')
        vi.advanceTimersByTime(60_000)

        expect(resolveSseTicket(used)).toBeUndefined()
        expect(resolveSseTicket(unused)).toBeUndefined()
    })
})
