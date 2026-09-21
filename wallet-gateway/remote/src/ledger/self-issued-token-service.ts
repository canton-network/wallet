// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { LedgerClient } from '@canton-network/core-ledger-client'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import type { Store, Wallet } from '@canton-network/core-wallet-store'
import { SigningProvider } from '@canton-network/core-signing-lib'
import type { Logger } from 'pino'
import type { WalletAllocationService } from './wallet-allocation/wallet-allocation-service.js'

export type InitializeOnboardingParams = {
    username: string
    signingProviderId: SigningProvider
}

export type FinalizeOnboardingParams = {
    username: string
    partyId: string
}

export class SelfIssuedTokenService {
    constructor(
        private readonly store: Store,
        private readonly logger: Logger,
        private readonly walletAllocator: WalletAllocationService,
        private readonly ledgerClient: LedgerClient
    ) {}

    async initializeOnboarding(
        params: InitializeOnboardingParams
    ): Promise<Wallet> {
        const username = this.requireUsername(params.username)
        if (params.signingProviderId === SigningProvider.PARTICIPANT) {
            throw new Error(
                'Signing provider participant is not supported for self-issued onboarding'
            )
        }

        await this.createLedgerUser(username)

        const wallet = await this.walletAllocator.createWallet(
            this.authContext(username),
            username,
            false,
            params.signingProviderId
        )

        this.logger.info(
            {
                username,
                partyId: wallet.partyId,
                status: wallet.status,
                signingProviderId: params.signingProviderId,
            },
            'Initialized self-issued wallet onboarding'
        )

        return wallet
    }

    async finalizeOnboarding(
        params: FinalizeOnboardingParams
    ): Promise<Wallet> {
        const username = this.requireUsername(params.username)

        const existingWallet = await this.store.getWallet(params.partyId)
        if (!existingWallet) {
            throw new Error(`Wallet not found for party ${params.partyId}`)
        }

        await this.walletAllocator.allocateParty(
            this.authContext(username),
            existingWallet,
            existingWallet.signingProviderId as SigningProvider
        )

        let wallet = await this.store.getWallet(params.partyId)
        if (!wallet) {
            throw new Error(`Wallet not found for party ${params.partyId}`)
        }

        if (wallet.status === 'allocated') {
            await this.patchLedgerUserPrimaryParty(username, wallet.partyId)
            await this.store.updateWallet({
                partyId: wallet.partyId,
                networkId: wallet.networkId,
                isAuthParty: true,
            })
            const authPartyWallet = await this.store.getWallet(params.partyId)
            if (!authPartyWallet) {
                throw new Error(`Wallet not found for party ${params.partyId}`)
            }
            wallet = authPartyWallet
        }

        this.logger.info(
            {
                username,
                partyId: wallet.partyId,
                status: wallet.status,
                signingProviderId: existingWallet.signingProviderId,
                isAuthParty: wallet.isAuthParty,
            },
            'Finalized self-issued wallet onboarding'
        )

        return wallet
    }

    private requireUsername(username: string): string {
        const trimmed = username.trim()
        if (!trimmed) {
            throw new Error('username is required')
        }
        return trimmed
    }

    private authContext(username: string): AuthContext {
        return {
            userId: username,
            accessToken: '',
        }
    }

    private async createLedgerUser(username: string): Promise<void> {
        try {
            const existing = await this.ledgerClient.get(
                '/v2/users/{user-id}',
                {
                    path: { 'user-id': username },
                }
            )
            if (existing.user) {
                return
            }
        } catch {
            // TODO check in runtime happens when user already exists vs other error
        }

        await this.ledgerClient.post('/v2/users', {
            user: {
                id: username,
                isDeactivated: false,
                identityProviderId: '',
            },
            rights: [],
        })
    }

    private async patchLedgerUserPrimaryParty(
        username: string,
        partyId: string
    ): Promise<void> {
        await this.ledgerClient.patch(
            '/v2/users/{user-id}',
            {
                user: {
                    id: username,
                    primaryParty: partyId,
                    primaryPartyAuthentication: true,
                },
                updateMask: {
                    paths: ['primary_party', 'primary_party_authentication'],
                    unknownFields: { fields: {} },
                },
            },
            { path: { 'user-id': username } }
        )
    }
}
