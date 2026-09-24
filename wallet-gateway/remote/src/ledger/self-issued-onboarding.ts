// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LedgerClient } from '@canton-network/core-ledger-client'
import {
    type AuthAware,
    AuthTokenProvider,
    resolveAuthIdentityProviderId,
} from '@canton-network/core-wallet-auth'
import type { Store } from '@canton-network/core-wallet-store'
import type { Logger } from 'pino'
import { PartyAllocationService } from './party-allocation-service.js'
import { SelfIssuedTokenService } from './self-issued-token-service.js'
import { WalletAllocationService } from './wallet-allocation/wallet-allocation-service.js'
import { SigningDrivers } from '@canton-network/core-wallet-services'

// TODO move it somewhere better
export async function createSelfIssuedOnboardingService(
    bootstrapStore: Store & AuthAware<Store>,
    networkId: string,
    username: string,
    drivers: SigningDrivers,
    logger: Logger
): Promise<SelfIssuedTokenService> {
    const trimmedUsername = username.trim()
    if (!trimmedUsername) {
        throw new Error('username is required')
    }

    const scopedStore = bootstrapStore.withAuthContext({
        userId: trimmedUsername,
        accessToken: '',
    })
    const network = await scopedStore.getCurrentNetwork()
    if (network.id !== networkId) {
        throw new Error('Onboarding session network does not match networkId')
    }
    if (network.auth.method !== 'self_issued') {
        throw new Error('Network does not use self_issued authentication')
    }
    const idp = await bootstrapStore.getIdp(network.identityProviderId)
    if (idp.type !== 'self_issued') {
        throw new Error(
            'Identity provider is not configured for self_issued authentication'
        )
    }
    if (!network.adminAuth) {
        throw new Error('No admin auth configured')
    }

    const adminIdp = await bootstrapStore.getIdp(
        resolveAuthIdentityProviderId(
            network.adminAuth,
            network.identityProviderId
        )
    )
    // TODO should I actually get adminAuth.idp inside token provider?
    const adminTokenProvider = AuthTokenProvider.fromGatewayConfig(
        adminIdp,
        network.adminAuth,
        logger
    )
    const partyAllocator = new PartyAllocationService({
        synchronizerId: network.synchronizerId,
        accessTokenProvider: adminTokenProvider,
        httpLedgerUrl: network.ledgerApi.baseUrl,
        logger,
    })
    const walletAllocationService = new WalletAllocationService(
        scopedStore,
        logger,
        partyAllocator,
        drivers
    )
    const ledgerClient = new LedgerClient({
        baseUrl: new URL(network.ledgerApi.baseUrl),
        logger,
        accessTokenProvider: adminTokenProvider,
    })

    return new SelfIssuedTokenService(
        scopedStore,
        logger,
        walletAllocationService,
        ledgerClient,
        drivers
    )
}
