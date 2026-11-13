// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AuthContext } from '@canton-network/core-wallet-auth'
import type { SigningDriverInterface } from '@canton-network/core-signing-lib'
import { NotificationService } from '@canton-network/core-wallet-services'
import { StoreInternal } from '@canton-network/core-wallet-store-inmemory'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import type { AuthContextStore } from './auth-context'
import { createAuthService } from './auth-service'
import type { AuthorizationCodeParams } from './oauth'
import { AuthErrorName, EXTENSION_ORIGIN } from '@/shared/auth-protocol'
import { logger } from '@/shared/logger'
import { VaultErrorName, type VaultStatus } from '@/shared/vault-protocol'
import { loadAuthedStore, type WalletStore } from './store'
import { defaultConfig } from './store/default-config'

const networkId = 'canton:local-oauth'

/** An unsigned JWT; the extension only decodes tokens. */
function jwt(claims: Record<string, unknown>): string {
    const encode = (value: object) =>
        btoa(JSON.stringify(value))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '')
    return `${encode({ alg: 'none' })}.${encode(claims)}.sig`
}

const inAnHour = () => Math.floor(Date.now() / 1000) + 3600

/** An auth context store that keeps what it's given, like the real one. */
function memoryAuthContext(initial?: AuthContext) {
    let context = initial
    return {
        load: vi.fn<AuthContextStore['load']>(async () => context),
        store: vi.fn<AuthContextStore['store']>(async (token) => {
            context = {
                userId: JSON.parse(atob(token.split('.')[1]!)).sub,
                accessToken: token,
            }
        }),
        clear: vi.fn<AuthContextStore['clear']>(async () => {
            context = undefined
        }),
    } satisfies AuthContextStore
}

describe('createAuthService', () => {
    let vaultStatus: VaultStatus
    let lockVault: () => void
    let store: WalletStore
    let authContext: ReturnType<typeof memoryAuthContext>
    let signIn: Mock<(params: AuthorizationCodeParams) => Promise<string>>

    function service(config = defaultConfig()) {
        store = new StoreInternal(config, logger)
        return createAuthService({
            vault: {
                ready: Promise.resolve(),
                status: () => vaultStatus,
                onLock: vi.fn((listener: () => void) => {
                    // The real vault runs listeners and sets the status in closeNow().
                    lockVault = () => {
                        vaultStatus = 'locked'
                        listener()
                    }
                }),
                create: vi.fn(),
                lock: vi.fn(),
                unlock: vi.fn(),
                changePassword: vi.fn(),
                reset: vi.fn(),
                defineItem: vi.fn(),
            },
            signIn,
            getStore: () => loadAuthedStore(store, authContext),
            authContext,
            signingDriver: {} as SigningDriverInterface,
            notificationService: new NotificationService(),
        })
    }

    const token = jwt({ sub: 'user-1', exp: inAnHour() })

    beforeEach(() => {
        vaultStatus = 'unlocked'
        authContext = memoryAuthContext()
        signIn = vi.fn(async () => token)
    })

    it('is disconnected when nobody is signed in', async () => {
        await expect(service().getStatus()).resolves.toBe('disconnected')
    })

    it('connects with the network’s authorization code settings', async () => {
        const auth = service()
        await auth.connect(networkId)

        const network = defaultConfig().networks[0]!
        expect(network.auth.method).toBe('authorization_code')
        expect(signIn).toHaveBeenCalledWith({
            configUrl: 'http://127.0.0.1:8889/.well-known/openid-configuration',
            clientId: 'operator',
            scope: (network.auth as { scope: string }).scope,
            audience: (network.auth as { audience: string }).audience,
        })
        expect(authContext.store).toHaveBeenCalledWith(token)

        const sessions = await (
            await loadAuthedStore(store, authContext)
        ).listSessions()
        expect(sessions).toEqual([
            expect.objectContaining({
                origin: EXTENSION_ORIGIN,
                network: networkId,
                accessToken: token,
            }),
        ])
        await expect(auth.getStatus()).resolves.toBe('connected')
    })

    it('is disconnected once the token has expired', async () => {
        const expired = jwt({ sub: 'user-1', exp: 1 })
        signIn.mockResolvedValue(expired)
        const auth = service()
        await auth.connect(networkId)

        await expect(auth.getStatus()).resolves.toBe('disconnected')
    })

    it('keeps the auth context when sign-in fails', async () => {
        signIn.mockRejectedValue(new Error('closed'))
        const auth = service()

        await expect(auth.connect(networkId)).rejects.toThrow('closed')
        expect(authContext.store).not.toHaveBeenCalled()
    })

    it('rejects networks without the authorization code flow', async () => {
        const config = defaultConfig()
        const network = config.networks[0]!
        network.auth = network.adminAuth!
        const auth = service(config)

        await expect(auth.connect(networkId)).rejects.toMatchObject({
            name: AuthErrorName.UnsupportedAuthMethod,
        })
        expect(signIn).not.toHaveBeenCalled()
    })

    it('rejects while the vault is locked', async () => {
        vaultStatus = 'locked'
        const auth = service()

        await expect(auth.getStatus()).rejects.toMatchObject({
            name: VaultErrorName.Locked,
        })
        await expect(auth.connect(networkId)).rejects.toMatchObject({
            name: VaultErrorName.Locked,
        })
    })

    it('aborts the sign-in when the vault is locked and unlocked meanwhile', async () => {
        const auth = service()
        signIn.mockImplementation(async () => {
            lockVault()
            vaultStatus = 'unlocked' // the user unlocks, or resets and creates a new vault
            return token
        })

        await expect(auth.connect(networkId)).rejects.toMatchObject({
            name: VaultErrorName.Locked,
        })
        expect(authContext.store).not.toHaveBeenCalled()
        expect(
            await (await loadAuthedStore(store, authContext)).listSessions()
        ).toEqual([])
    })

    it('connects normally after an earlier lock', async () => {
        const auth = service()
        lockVault()
        vaultStatus = 'unlocked'

        await auth.connect(networkId)

        await expect(auth.getStatus()).resolves.toBe('connected')
    })
})
