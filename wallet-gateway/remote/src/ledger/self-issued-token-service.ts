// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LedgerClient } from '@canton-network/core-ledger-client'
import {
    AuthTokenProvider,
    type AuthContext,
    appendJwsBase64Signature,
    getKeyId,
    prepareJwsForSigning,
} from '@canton-network/core-wallet-auth'
import type { Store, Wallet } from '@canton-network/core-wallet-store'
import { isRpcError, SigningProvider } from '@canton-network/core-signing-lib'
import type { SigningDrivers } from '@canton-network/core-wallet-services'
import type { Logger } from 'pino'
import type { WalletAllocationService } from './wallet-allocation/wallet-allocation-service.js'

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60

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
        private readonly ledgerClient: LedgerClient,
        private readonly drivers: SigningDrivers
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
            } else {
                // TODO(#2458)
                throw new Error(
                    'User already exists, logging as existing user is not implemented yet.'
                )
            }
        } catch {
            // TODO check in runtime happens when user already exists vs other error
            // especially for cases where this succeeds but further step fails, to not get locked with user without party
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
            params.signingProviderId
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
    ): Promise<{ wallet: Wallet; accessToken?: string }> {
        const username = this.requireUsername(params.username)

        let wallet = await this.store.getWallet(params.partyId)
        if (!wallet) {
            throw new Error(`Wallet not found for party ${params.partyId}`)
        }

        let accessToken: string | undefined

        if (wallet.status !== 'allocated') {
            await this.walletAllocator.allocateParty(
                this.authContext(username),
                wallet,
                wallet.signingProviderId as SigningProvider
            )

            wallet = await this.store.getWallet(params.partyId)
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
            const authPartyWallet = await this.store.getWallet(wallet.partyId)
            if (!authPartyWallet) {
                throw new Error(`Wallet not found for party ${wallet.partyId}`)
            }
            wallet = authPartyWallet
            accessToken = await this.mintAccessToken(username, wallet)
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

        return accessToken ? { wallet, accessToken } : { wallet }
    }

    private requireUsername(username: string): string {
        const trimmed = username.trim()
        if (!trimmed) {
            throw new Error('username is required')
        }
        return trimmed
    }

    private async mintAccessToken(
        username: string,
        wallet: Wallet
    ): Promise<string> {
        const network = await this.store.getCurrentNetwork()
        if (network.auth.method !== 'self_issued') {
            throw new Error('Network does not use self_issued authentication')
        }
        if (!network.synchronizerId) {
            throw new Error('Current network has no synchronizerId')
        }

        const signingProviderId = wallet.signingProviderId as SigningProvider
        const driver = this.drivers[signingProviderId]?.controller(username)
        if (!driver) {
            throw new Error(
                `Signing driver ${signingProviderId} is not available`
            )
        }

        const now = Math.floor(Date.now() / 1000)
        const kid = await getKeyId(wallet.publicKey)
        const signingInput = prepareJwsForSigning(
            { alg: 'EdDSA', typ: 'JWT', kid },
            {
                aud: network.auth.audience,
                scope: network.auth.scope,
                exp: now + ACCESS_TOKEN_TTL_SECONDS,
                iss: wallet.partyId,
                sub: wallet.partyId,
                'daml.com': {
                    syn: network.synchronizerId,
                    usr: username,
                },
            }
        )

        const result = await driver.signMessage({
            message: signingInput,
            keyIdentifier: { publicKey: wallet.publicKey },
        })
        if (isRpcError(result) || !result.signature) {
            throw new Error(
                isRpcError(result)
                    ? result.error_description
                    : 'signMessage failed'
            )
        }

        const token = appendJwsBase64Signature(signingInput, result.signature)
        const probe = new LedgerClient({
            baseUrl: new URL(network.ledgerApi.baseUrl),
            logger: this.logger,
            accessTokenProvider: AuthTokenProvider.fromToken(
                token,
                this.logger
            ),
        })
        try {
            await probe.get('/v2/authenticated-user')
        } catch (error) {
            throw new Error(
                'Self-issued token was rejected by the participant',
                { cause: error }
            )
        }

        const onboardingSession = (await this.store.listSessions()).find(
            (session) => !session.accessToken
        )
        if (!onboardingSession) {
            throw new Error('Onboarding session not found')
        }
        await this.store.setSession({
            id: onboardingSession.id,
            origin: onboardingSession.origin,
            network: network.id,
            accessToken: token,
        })
        return token
    }

    private authContext(username: string): AuthContext {
        return {
            userId: username,
            accessToken: '',
        }
    }
}
