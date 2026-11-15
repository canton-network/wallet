// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthTokenProvider, jwtExpired } from '@canton-network/core-wallet-auth'
import { hashAccessToken } from '@canton-network/core-wallet-store'

import {
    AuthErrorName,
    authMessenger,
    type ConnectionStatus,
    type ConnectRequest,
    EXTENSION_ORIGIN,
} from '@/shared/auth-protocol.ts'
import { logger } from '@/shared/logger.ts'

import type { UserControllerDeps } from './controllers/user/index.ts'
import { sessions } from './controllers/user/sessions.ts'
import {
    signInWithAuthorizationCode,
    type AuthorizationCodeParams,
} from './oauth.ts'
import { isTrustedSender } from './vault-service.ts'
import { type Vault, VaultLockedError } from './vault/index.ts'

const log = logger.getChild('auth')

export class UnsupportedAuthMethodError extends Error {
    constructor(message: string) {
        super(message)
        this.name = AuthErrorName.UnsupportedAuthMethod
    }
}

export class InvalidCredentialsError extends Error {
    constructor(message = 'The client secret is wrong.') {
        super(message)
        this.name = AuthErrorName.InvalidCredentials
    }
}

/** What the user entered to sign in to a `self_signed` network. */
export type ConnectCredentials = Omit<ConnectRequest, 'networkId'>

export interface AuthServiceDeps extends UserControllerDeps {
    vault: Vault
    /** Swapped out in tests. */
    signIn?: (params: AuthorizationCodeParams) => Promise<string>
}

/** The auth service's operations, without the messaging. */
export function createAuthService({
    vault,
    signIn = signInWithAuthorizationCode,
    ...deps
}: AuthServiceDeps) {
    const { authContext, getStore } = deps

    async function assertUnlocked(): Promise<void> {
        await vault.ready
        if (vault.status() !== 'unlocked') throw new VaultLockedError()
    }

    // Cancel any ongoing sign-in if the vault gets locked.
    let lockSignal = new AbortController()
    vault.onLock(() => {
        lockSignal.abort(
            new VaultLockedError('The vault was locked during sign-in.')
        )
        lockSignal = new AbortController()
    })

    let commitQueue: Promise<unknown> = Promise.resolve()

    /**
     * Runs `fn` after every earlier call has settled, one at a time.
     * This ensures that multiple concurrent "connect" attempts do not interfere with each other.
     */
    function serialized<T>(fn: () => Promise<T>): Promise<T> {
        const result = commitQueue.then(fn)
        commitQueue = result.catch(() => undefined)
        return result
    }

    return {
        async getStatus(): Promise<ConnectionStatus> {
            await assertUnlocked()
            const context = await authContext.load()
            if (!context || jwtExpired(context.accessToken)) {
                return 'disconnected'
            }
            const store = await getStore()
            const accessTokenHash = await hashAccessToken(context.accessToken)
            const connected = (await store.listSessions()).some(
                (session) =>
                    session.origin === EXTENSION_ORIGIN &&
                    session.accessTokenHash === accessTokenHash
            )
            return connected ? 'connected' : 'disconnected'
        },

        async connect(
            networkId: string,
            credentials: ConnectCredentials = {}
        ): Promise<void> {
            const signal = lockSignal.signal // "cancelled if the vault locks"
            await assertUnlocked()
            // Networks and IdPs aren't per user, so this works signed out.
            const store = await getStore()
            const network = await store.getNetwork(networkId)
            const { auth } = network

            let token: string
            if (auth.method === 'authorization_code') {
                const idp = await store.getIdp(network.identityProviderId)
                if (idp.type !== 'oauth') {
                    throw new UnsupportedAuthMethodError(
                        `Identity provider type ${idp.type} is not supported yet.`
                    )
                }
                log.info('Signing in to {networkId}', { networkId })
                token = await signIn({
                    configUrl: idp.configUrl,
                    clientId: auth.clientId,
                    scope: auth.scope,
                    audience: auth.audience,
                })
            } else if (auth.method === 'self_signed') {
                const idp = await store.getIdp(network.identityProviderId)
                if (idp.type !== 'self_signed') {
                    throw new UnsupportedAuthMethodError(
                        `Identity provider type ${idp.type} is not supported for self_signed networks.`
                    )
                }
                // A development-only check, like the remote gateway's.
                if (credentials.clientSecret !== auth.clientSecret) {
                    throw new InvalidCredentialsError()
                }
                log.info('Signing in to {networkId}', { networkId })
                token = await new AuthTokenProvider({
                    method: 'self_signed',
                    issuer: idp.issuer,
                    keyId: network.id,
                    credentials: {
                        clientId: credentials.clientId || auth.clientId,
                        clientSecret: auth.clientSecret,
                        scope: auth.scope,
                        audience: auth.audience,
                    },
                }).getAccessToken()
            } else {
                throw new UnsupportedAuthMethodError(
                    `Auth method ${auth.method} is not supported yet.`
                )
            }

            await serialized(async () => {
                signal.throwIfAborted() // check inside the lock, right before writing
                const previous = await authContext.load()
                await authContext.store(token)
                try {
                    await sessions(deps).addSession({
                        origin: EXTENSION_ORIGIN,
                        networkId,
                    })
                } catch (error) {
                    await (previous
                        ? authContext.store(previous.accessToken)
                        : authContext.clear())
                    throw error
                }
            })
            log.info('Connected to {networkId}', { networkId })
        },
    }
}

/**
 * Answers the auth messages of the extension pages. Must be called
 * synchronously during background start-up, so a message that wakes the
 * service worker is handled. Tokens are never logged.
 */
export function registerAuthService(deps: AuthServiceDeps): void {
    const service = createAuthService(deps)

    function assertTrusted(
        type: string,
        sender: Parameters<typeof isTrustedSender>[0]
    ): void {
        if (isTrustedSender(sender)) return
        log.warn('Refused {type} from an untrusted sender', { type })
        throw new Error(`${type} is only for the extension pages.`)
    }

    authMessenger.onMessage('auth.getStatus', async ({ type, sender }) => {
        assertTrusted(type, sender)
        return service.getStatus()
    })
    authMessenger.onMessage('auth.connect', async ({ type, sender, data }) => {
        assertTrusted(type, sender)
        const { networkId, ...credentials } = data
        await service.connect(networkId, credentials)
    })
}
