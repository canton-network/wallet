// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('uuid', () => ({
    v4: vi.fn(() => 'session-new'),
}))
import { pino } from 'pino'
import { sink } from 'pino-test'
import { AuthTokenProvider } from '@canton-network/core-wallet-auth'
import type { Network } from '@canton-network/core-wallet-store'
import {
    ensureAutomationSessionForPrepare,
    resolveAutomationRunContext,
} from './service-account-session.js'

const clientCredentialsNetwork: Network = {
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
    ...clientCredentialsNetwork,
    id: 'net-interactive',
    auth: {
        method: 'authorization_code',
        clientId: 'app',
        audience: 'aud',
        scope: 'scope',
    },
}

function validJwt(extra: Record<string, unknown> = {}): string {
    const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString(
        'base64url'
    )
    const payload = Buffer.from(
        JSON.stringify({
            sub: 'user-1',
            gty: 'client_credentials',
            exp: Math.floor(Date.now() / 1000) + 3600,
            ...extra,
        })
    ).toString('base64url')
    return `${header}.${payload}.`
}

const logger = pino({ level: 'silent' }, sink())

describe('ensureAutomationSessionForPrepare', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('creates a session from the request token on a single M2M network', async () => {
        const token = validJwt()
        const store = {
            getSession: vi.fn().mockResolvedValue(undefined),
            listNetworks: vi.fn().mockResolvedValue([clientCredentialsNetwork]),
            setSession: vi.fn().mockResolvedValue(undefined),
        }

        await ensureAutomationSessionForPrepare(
            store as never,
            { userId: 'user-1', accessToken: token },
            vi.fn(),
            logger
        )

        expect(store.setSession).toHaveBeenCalledWith(
            expect.objectContaining({
                network: 'net-m2m',
                accessToken: token,
            })
        )
    })

    it('does not reuse an interactive session for M2M bootstrap', async () => {
        const token = validJwt()
        const store = {
            getSession: vi.fn().mockResolvedValue({
                id: 'session-interactive',
                network: 'net-m2m',
                accessToken: 'interactive-token',
            }),
            listNetworks: vi.fn().mockResolvedValue([clientCredentialsNetwork]),
            setSession: vi.fn().mockResolvedValue(undefined),
        }

        await ensureAutomationSessionForPrepare(
            store as never,
            { userId: 'user-1', accessToken: token },
            vi.fn(),
            logger
        )

        expect(store.setSession).toHaveBeenCalledWith(
            expect.objectContaining({
                accessToken: token,
            })
        )
    })

    it('requires addSession when multiple M2M networks exist', async () => {
        const store = {
            getSession: vi.fn().mockResolvedValue(undefined),
            listNetworks: vi
                .fn()
                .mockResolvedValue([
                    clientCredentialsNetwork,
                    { ...clientCredentialsNetwork, id: 'net-m2m-2' },
                ]),
            setSession: vi.fn(),
        }

        await expect(
            ensureAutomationSessionForPrepare(
                store as never,
                { userId: 'user-1', accessToken: validJwt() },
                vi.fn(),
                logger
            )
        ).rejects.toThrow('addSession with networkId')
    })
})

describe('resolveAutomationRunContext', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('ignores interactive sessions when resolving M2M run context', async () => {
        const store = {
            getNetwork: vi.fn().mockResolvedValue(clientCredentialsNetwork),
            getSessionForUser: vi.fn().mockResolvedValue(undefined),
            withAuthContext: vi.fn().mockReturnValue({
                setSession: vi.fn().mockResolvedValue(undefined),
            }),
        }
        const createAccessTokenProvider = vi.fn(async () =>
            AuthTokenProvider.fromToken(validJwt(), logger)
        )

        await resolveAutomationRunContext(
            store as never,
            'user-1',
            'net-m2m',
            createAccessTokenProvider,
            logger
        )

        expect(store.getSessionForUser).toHaveBeenCalledWith('user-1')
    })

    it('mints a token when no session exists on an M2M network', async () => {
        const scopedStore = {
            setSession: vi.fn().mockResolvedValue(undefined),
        }
        const store = {
            getNetwork: vi.fn().mockResolvedValue(clientCredentialsNetwork),
            getSessionForUser: vi.fn().mockResolvedValue(undefined),
            withAuthContext: vi.fn().mockReturnValue(scopedStore),
        }
        const createAccessTokenProvider = vi.fn(async () =>
            AuthTokenProvider.fromToken(validJwt(), logger)
        )

        const result = await resolveAutomationRunContext(
            store as never,
            'user-1',
            'net-m2m',
            createAccessTokenProvider,
            logger
        )

        expect(result?.authContext.userId).toBe('user-1')
        expect(createAccessTokenProvider).toHaveBeenCalledWith(
            clientCredentialsNetwork
        )
        expect(scopedStore.setSession).toHaveBeenCalled()
    })

    it('skips interactive networks without a valid session', async () => {
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
