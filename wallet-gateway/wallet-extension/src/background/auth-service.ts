// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { jwtExpired } from '@canton-network/core-wallet-auth'
import { logger } from '@/shared/logger'
import {
    AuthErrorName,
    authMessenger,
    type ConnectionStatus,
    EXTENSION_ORIGIN,
} from '@/shared/auth-protocol'
import type { UserControllerDeps } from './controllers/user'
import { sessions } from './controllers/user/sessions'
import {
    signInWithAuthorizationCode,
    type AuthorizationCodeParams,
} from './oauth'
import { type VaultLockState, VaultLockedError } from './vault'
import { isTrustedSender } from './vault-service'

const log = logger.getChild('auth')

export class UnsupportedAuthMethodError extends Error {
    constructor(message: string) {
        super(message)
        this.name = AuthErrorName.UnsupportedAuthMethod
    }
}

export interface AuthServiceDeps extends UserControllerDeps {
    vault: VaultLockState
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

    return {
        async getStatus(): Promise<ConnectionStatus> {
            await assertUnlocked()
            const context = await authContext.load()
            if (!context || jwtExpired(context.accessToken)) {
                return 'disconnected'
            }
            const store = await getStore()
            const connected = (await store.listSessions()).some(
                (session) =>
                    session.origin === EXTENSION_ORIGIN &&
                    session.accessToken === context.accessToken
            )
            return connected ? 'connected' : 'disconnected'
        },

        async connect(networkId: string): Promise<void> {
            await assertUnlocked()
            // Networks and IdPs aren't per user, so this works signed out.
            const store = await getStore()
            const network = await store.getNetwork(networkId)
            if (network.auth.method !== 'authorization_code') {
                throw new UnsupportedAuthMethodError(
                    `Auth method ${network.auth.method} is not supported yet.`
                )
            }
            const idp = await store.getIdp(network.identityProviderId)
            if (idp.type !== 'oauth') {
                throw new UnsupportedAuthMethodError(
                    `Identity provider type ${idp.type} is not supported yet.`
                )
            }

            log.info('Signing in to {networkId}', { networkId })
            const token = await signIn({
                configUrl: idp.configUrl,
                clientId: network.auth.clientId,
                scope: network.auth.scope,
                audience: network.auth.audience,
            })

            // addSession reads the auth context, so store the token first,
            // and put the previous one back if the session can't be added.
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
        await service.connect(data.networkId)
    })
}
