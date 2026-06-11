// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from 'pino'
import { v4 } from 'uuid'
import {
    AuthAware,
    AuthContext,
    AuthTokenProvider,
    isClientCredentialsNetworkAuth,
    isClientCredentialsToken,
    jwtExpired,
} from '@canton-network/core-wallet-auth'
import { Network, Session, Store } from '@canton-network/core-wallet-store'

export type AccessTokenProviderFactory = (
    network: Network
) => Promise<AuthTokenProvider>

export interface AutomationRunContext {
    authContext: AuthContext
    scopedStore: Store
    network: Network
}

/**
 * Ensures a Gateway session exists before service-account prepareExecute.
 * Uses the request JWT when still valid; otherwise mints a fresh token.
 */
export async function ensureAutomationSessionForPrepare(
    store: Store,
    context: AuthContext,
    createAccessTokenProvider: AccessTokenProviderFactory,
    logger: Logger
): Promise<void> {
    const existing = await store.getSession()
    if (
        existing &&
        isClientCredentialsToken(existing.accessToken) &&
        !jwtExpired(existing.accessToken)
    ) {
        return
    }

    if (!isClientCredentialsToken(context.accessToken)) {
        return
    }

    const network = await resolveClientCredentialsNetwork(
        store,
        existing?.network
    )

    const accessToken = jwtExpired(context.accessToken)
        ? await mintAccessToken(network, createAccessTokenProvider)
        : context.accessToken

    await store.setSession({
        id: existing?.id ?? v4(),
        network: network.id,
        accessToken,
    })

    logger.info(
        { userId: context.userId, networkId: network.id },
        'Bootstrapped service account session for prepareExecute'
    )
}

/**
 * Resolves auth for background completion of pending external transactions.
 * Service-account networks can run without a pre-existing session by minting
 * an access token. Interactive networks still require a valid stored session.
 */
export async function resolveAutomationRunContext(
    bootstrapStore: Store & AuthAware<Store>,
    userId: string,
    networkId: string,
    createAccessTokenProvider: AccessTokenProviderFactory,
    logger: Logger
): Promise<AutomationRunContext | undefined> {
    const network = await bootstrapStore.getNetwork(networkId)
    if (!network) {
        logger.warn(
            { userId, networkId },
            'Skipping signing worker tick: network not found'
        )
        return undefined
    }

    const existingSession = await bootstrapStore.getSessionForUser(userId)
    const sessionMatchesNetwork =
        existingSession?.network === networkId &&
        !jwtExpired(existingSession.accessToken) &&
        (!isClientCredentialsNetworkAuth(network.auth) ||
            isClientCredentialsToken(existingSession.accessToken))

    if (sessionMatchesNetwork && existingSession) {
        const authContext: AuthContext = {
            userId,
            accessToken: existingSession.accessToken,
        }
        const scopedStore = bootstrapStore.withAuthContext(authContext)
        await scopedStore.setSession(existingSession)
        return { authContext, scopedStore, network }
    }

    if (!isClientCredentialsNetworkAuth(network.auth)) {
        logger.debug(
            { userId, networkId },
            'Skipping signing worker tick: no valid session for interactive network'
        )
        return undefined
    }

    const accessToken = await mintAccessToken(
        network,
        createAccessTokenProvider
    )
    const authContext: AuthContext = { userId, accessToken }
    const session: Session = {
        id: existingSession?.id ?? v4(),
        network: networkId,
        accessToken,
    }
    const scopedStore = bootstrapStore.withAuthContext(authContext)
    await scopedStore.setSession(session)

    logger.debug(
        { userId, networkId, createdSession: !existingSession },
        'Signing worker prepared service account session'
    )

    return { authContext, scopedStore, network }
}

async function resolveClientCredentialsNetwork(
    store: Store,
    sessionNetworkId: string | undefined
): Promise<Network> {
    const networks = await store.listNetworks()
    const m2mNetworks = networks.filter((network) =>
        isClientCredentialsNetworkAuth(network.auth)
    )

    if (m2mNetworks.length === 0) {
        throw new Error(
            'Service account token present but no client_credentials network is configured'
        )
    }

    if (sessionNetworkId) {
        const network = m2mNetworks.find((n) => n.id === sessionNetworkId)
        if (!network) {
            throw new Error(
                `Session network "${sessionNetworkId}" is not configured for client_credentials automation`
            )
        }
        return network
    }

    if (m2mNetworks.length === 1) {
        return m2mNetworks[0]
    }

    throw new Error(
        'Multiple client_credentials networks configured; call addSession with networkId before prepareExecute'
    )
}

async function mintAccessToken(
    network: Network,
    createAccessTokenProvider: AccessTokenProviderFactory
): Promise<string> {
    const provider = await createAccessTokenProvider(network)
    return provider.getAccessToken()
}
