// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('uuid', () => ({ v4: vi.fn(() => 'session-new') }))

import { pino } from 'pino'
import { sink } from 'pino-test'
import { AuthTokenProvider } from '@canton-network/core-wallet-auth'
import type { Network } from '@canton-network/core-wallet-store'
import {
    ensureAutomationSessionForPrepare,
    resolveAutomationRunContext,
} from './service-account-session.js'

const m2mNetwork: Network = {
    id: 'net-m2m',
    name: 'm2m',
    description: '',
    synchronizerId: 'sync::fp',
    identityProviderId: 'idp1',
    ledgerApi: { baseUrl: 'http://ledger' },
    auth: {
        method: 'client_credentials',
        clientId: 'svc',
        clientSecret: 'secret',
        audience: 'aud',
        scope: 'scope',
    },
}

const interactiveNetwork: Network = {
    ...m2mNetwork,
    id: 'net-interactive',
    auth: {
        method: 'authorization_code',
        clientId: 'app',
        audience: 'aud',
        scope: 'scope',
    },
}

const logger = pino({ level: 'silent' }, sink())

function m2mJwt(extra: Record<string, unknown> = {}): string {
    const encode = (value: unknown) =>
        Buffer.from(JSON.stringify(value)).toString('base64url')
    return `${encode({ alg: 'none' })}.${encode({
        sub: 'user-1',
        gty: 'client_credentials',
        exp: Math.floor(Date.now() / 1000) + 3600,
        ...extra,
    })}.`
}

describe('ensureAutomationSessionForPrepare', () => {
    afterEach(() => vi.clearAllMocks())

    it('bootstraps a session from the request token', async () => {
        const token = m2mJwt()
        const store = {
            getSession: vi.fn().mockResolvedValue(undefined),
            listNetworks: vi.fn().mockResolvedValue([m2mNetwork]),
            setSession: vi.fn(),
        }

        await ensureAutomationSessionForPrepare(
            store as never,
            { userId: 'user-1', accessToken: token },
            vi.fn(),
            logger
        )

        expect(store.setSession).toHaveBeenCalledWith({
            id: 'session-new',
            network: 'net-m2m',
            accessToken: token,
        })
    })

    it('reuses a valid client-credentials session', async () => {
        const store = {
            getSession: vi.fn().mockResolvedValue({
                id: 'session-1',
                network: 'net-m2m',
                accessToken: m2mJwt(),
            }),
            listNetworks: vi.fn(),
            setSession: vi.fn(),
        }

        await ensureAutomationSessionForPrepare(
            store as never,
            { userId: 'user-1', accessToken: m2mJwt() },
            vi.fn(),
            logger
        )

        expect(store.setSession).not.toHaveBeenCalled()
    })

    it('replaces a non-M2M stored session', async () => {
        const token = m2mJwt()
        const store = {
            getSession: vi.fn().mockResolvedValue({
                id: 'session-interactive',
                network: 'net-m2m',
                accessToken: 'interactive-token',
            }),
            listNetworks: vi.fn().mockResolvedValue([m2mNetwork]),
            setSession: vi.fn(),
        }

        await ensureAutomationSessionForPrepare(
            store as never,
            { userId: 'user-1', accessToken: token },
            vi.fn(),
            logger
        )

        expect(store.setSession).toHaveBeenCalledWith(
            expect.objectContaining({ accessToken: token })
        )
    })

    it('requires addSession when multiple M2M networks exist', async () => {
        const store = {
            getSession: vi.fn().mockResolvedValue(undefined),
            listNetworks: vi
                .fn()
                .mockResolvedValue([
                    m2mNetwork,
                    { ...m2mNetwork, id: 'net-m2m-2' },
                ]),
            setSession: vi.fn(),
        }

        await expect(
            ensureAutomationSessionForPrepare(
                store as never,
                { userId: 'user-1', accessToken: m2mJwt() },
                vi.fn(),
                logger
            )
        ).rejects.toThrow('addSession with networkId')
    })
})

describe('resolveAutomationRunContext', () => {
    afterEach(() => vi.clearAllMocks())

    it('reuses a valid client-credentials session', async () => {
        const session = {
            id: 'session-1',
            network: 'net-m2m',
            accessToken: m2mJwt(),
        }
        const scopedStore = { setSession: vi.fn() }
        const store = {
            getNetwork: vi.fn().mockResolvedValue(m2mNetwork),
            getSessionForUser: vi.fn().mockResolvedValue(session),
            withAuthContext: vi.fn().mockReturnValue(scopedStore),
        }
        const createAccessTokenProvider = vi.fn()

        const result = await resolveAutomationRunContext(
            store as never,
            'user-1',
            'net-m2m',
            createAccessTokenProvider,
            logger
        )

        expect(result?.authContext).toEqual({
            userId: 'user-1',
            accessToken: session.accessToken,
        })
        expect(createAccessTokenProvider).not.toHaveBeenCalled()
        expect(scopedStore.setSession).toHaveBeenCalledWith(session)
    })

    it('mints a token when no usable session exists', async () => {
        const scopedStore = { setSession: vi.fn() }
        const store = {
            getNetwork: vi.fn().mockResolvedValue(m2mNetwork),
            getSessionForUser: vi.fn().mockResolvedValue(undefined),
            withAuthContext: vi.fn().mockReturnValue(scopedStore),
        }
        const createAccessTokenProvider = vi.fn(async () =>
            AuthTokenProvider.fromToken(m2mJwt(), logger)
        )

        const result = await resolveAutomationRunContext(
            store as never,
            'user-1',
            'net-m2m',
            createAccessTokenProvider,
            logger
        )

        expect(result?.authContext.userId).toBe('user-1')
        expect(createAccessTokenProvider).toHaveBeenCalledWith(m2mNetwork)
        expect(scopedStore.setSession).toHaveBeenCalled()
    })

    it('mints when the stored session is not a client-credentials token', async () => {
        const scopedStore = { setSession: vi.fn() }
        const store = {
            getNetwork: vi.fn().mockResolvedValue(m2mNetwork),
            getSessionForUser: vi.fn().mockResolvedValue({
                id: 'session-1',
                network: 'net-m2m',
                accessToken: 'interactive-token',
            }),
            withAuthContext: vi.fn().mockReturnValue(scopedStore),
        }
        const createAccessTokenProvider = vi.fn(async () =>
            AuthTokenProvider.fromToken(m2mJwt(), logger)
        )

        await resolveAutomationRunContext(
            store as never,
            'user-1',
            'net-m2m',
            createAccessTokenProvider,
            logger
        )

        expect(createAccessTokenProvider).toHaveBeenCalled()
    })

    it('returns undefined for interactive networks without a session', async () => {
        const store = {
            getNetwork: vi.fn().mockResolvedValue(interactiveNetwork),
            getSessionForUser: vi.fn().mockResolvedValue(undefined),
            withAuthContext: vi.fn(),
        }

        const result = await resolveAutomationRunContext(
            store as never,
            'user-1',
            'net-interactive',
            vi.fn(),
            logger
        )

        expect(result).toBeUndefined()
    })
})
