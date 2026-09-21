// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LedgerClient } from '@canton-network/core-ledger-client'
import {
    type AuthAware,
    AuthTokenProvider,
} from '@canton-network/core-wallet-auth'
import type { Store } from '@canton-network/core-wallet-store'
import type { Logger } from 'pino'
import type { SigningDrivers } from '../signing/signing-drivers.js'
import { PartyAllocationService } from './party-allocation-service.js'
import { SelfIssuedTokenService } from './self-issued-token-service.js'
import { WalletAllocationService } from './wallet-allocation/wallet-allocation-service.js'

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

    const network = await bootstrapStore.getNetwork(networkId)
    if ((network.auth as { method: string }).method !== 'self_issued') {
        throw new Error('Network does not use self_issued authentication')
    }
    const idp = await bootstrapStore.getIdp(network.identityProviderId)
    if (
        // eslint-disable-next-line no-constant-condition,no-constant-binary-expression
        false && // TODO temp
        (idp as { type: string }).type !== 'self_issued'
    ) {
        throw new Error(
            'Identity provider is not configured for self_issued authentication'
        )
    }
    if (!network.adminAuth) {
        throw new Error('No admin auth configured')
    }

    const scopedStore = bootstrapStore.withAuthContext({
        userId: trimmedUsername,
        accessToken: '',
    })

    const adminTokenProvider = AuthTokenProvider.fromGatewayConfig(
        idp,
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
        ledgerClient
    )
}
