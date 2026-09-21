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
    networkId: string
    partyHint: string
    signingProviderId: SigningProvider
}

export type FinalizeOnboardingParams = {
    username: string
    networkId: string
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
        const partyHint = params.partyHint.trim()
        if (!partyHint) {
            throw new Error('partyHint is required')
        }
        if (params.signingProviderId === SigningProvider.PARTICIPANT) {
            throw new Error(
                'Signing provider participant is not supported for self-issued onboarding'
            )
        }

        try {
            const existing = await this.ledgerClient.get(
                '/v2/users/{user-id}',
                {
                    path: { 'user-id': username },
                }
            )
            if (!existing.user) {
                await this.ledgerClient.post('/v2/users', {
                    user: {
                        id: username,
                        isDeactivated: false,
                        identityProviderId: '',
                    },
                    rights: [],
                })
            }
        } catch {
            // TODO check in runtime happens when user already exists vs other error
            await this.ledgerClient.post('/v2/users', {
                user: {
                    id: username,
                    isDeactivated: false,
                    identityProviderId: '',
                },
                rights: [],
            })
        }

        const wallet = await this.walletAllocator.createWallet(
            this.authContext(username),
            partyHint,
            false,
            params.signingProviderId,
            undefined,
            params.networkId
        )

        this.logger.info(
            {
                username,
                partyHint,
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

        let wallet = await this.store.getWallet(
            params.partyId,
            params.networkId
        )
        if (!wallet) {
            throw new Error(`Wallet not found for party ${params.partyId}`)
        }

        if (wallet.status !== 'allocated') {
            await this.walletAllocator.allocateParty(
                this.authContext(username),
                wallet,
                wallet.signingProviderId as SigningProvider
            )

            wallet = await this.store.getWallet(
                params.partyId,
                params.networkId
            )
            if (!wallet) {
                throw new Error(`Wallet not found for party ${params.partyId}`)
            }
        }

        if (wallet.status === 'allocated') {
            await this.ledgerClient.patch(
                '/v2/users/{user-id}',
                {
                    user: {
                        id: username,
                        primaryParty: wallet.partyId,
                        primaryPartyAuthentication: true,
                    },
                    updateMask: {
                        paths: [
                            'primary_party',
                            'primary_party_authentication',
                        ],
                        unknownFields: { fields: {} },
                    },
                },
                { path: { 'user-id': username } }
            )
            await this.store.updateWallet({
                partyId: wallet.partyId,
                networkId: wallet.networkId,
                isAuthParty: true,
            })
            const authPartyWallet = await this.store.getWallet(
                wallet.partyId,
                params.networkId
            )
            if (!authPartyWallet) {
                throw new Error(`Wallet not found for party ${wallet.partyId}`)
            }
            wallet = authPartyWallet
        }

        this.logger.info(
            {
                username,
                partyId: wallet.partyId,
                status: wallet.status,
                signingProviderId: wallet.signingProviderId,
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
}
