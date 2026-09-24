// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pino } from 'pino'
import { sink } from 'pino-test'
import { SigningProvider } from '@canton-network/core-signing-lib'
import type { LedgerClient } from '@canton-network/core-ledger-client'
import type { Store, Wallet } from '@canton-network/core-wallet-store'
import type { WalletAllocationService } from './wallet-allocation/wallet-allocation-service.js'
import { SelfIssuedTokenService } from './self-issued-token-service.js'

const createWallet = (overrides: Partial<Wallet> = {}): Wallet => ({
    primary: true,
    partyId: 'alice::ns',
    status: 'initialized',
    hint: 'alice',
    signingProviderId: SigningProvider.WALLET_KERNEL,
    publicKey: 'kernel-pk',
    namespace: 'ns',
    networkId: 'network-1',
    userId: 'alice',
    rights: [],
    ...overrides,
})

describe('SelfIssuedTokenService', () => {
    const logger = pino(sink())
    let store: {
        getWallet: ReturnType<typeof vi.fn>
        updateWallet: ReturnType<typeof vi.fn>
    }
    let walletAllocator: {
        createWallet: ReturnType<typeof vi.fn>
        allocateParty: ReturnType<typeof vi.fn>
    }
    let ledgerClient: {
        get: ReturnType<typeof vi.fn>
        post: ReturnType<typeof vi.fn>
        patch: ReturnType<typeof vi.fn>
    }

    beforeEach(() => {
        store = {
            getWallet: vi.fn(),
            updateWallet: vi.fn().mockResolvedValue(undefined),
        }
        walletAllocator = {
            createWallet: vi.fn(),
            allocateParty: vi.fn().mockResolvedValue(undefined),
        }
        ledgerClient = {
            get: vi.fn().mockRejectedValue(new Error('USER_NOT_FOUND')),
            post: vi.fn().mockResolvedValue({ user: { id: 'alice' } }),
            patch: vi.fn().mockResolvedValue({ user: { id: 'alice' } }),
        }
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    function createService() {
        return new SelfIssuedTokenService(
            store as unknown as Store,
            logger,
            walletAllocator as unknown as WalletAllocationService,
            ledgerClient as unknown as LedgerClient
        )
    }

    describe('initializeOnboarding', () => {
        it('creates a ledger user and a wallet signing request', async () => {
            const pendingWallet = createWallet()
            walletAllocator.createWallet.mockResolvedValue(pendingWallet)

            const wallet = await createService().initializeOnboarding({
                username: 'alice',
                networkId: 'network-1',
                partyHint: 'my-party',
                signingProviderId: SigningProvider.WALLET_KERNEL,
            })

            expect(ledgerClient.get).toHaveBeenCalledWith(
                '/v2/users/{user-id}',
                { path: { 'user-id': 'alice' } }
            )
            expect(ledgerClient.post).toHaveBeenCalledWith('/v2/users', {
                user: {
                    id: 'alice',
                    isDeactivated: false,
                    identityProviderId: '',
                },
                rights: [],
            })
            expect(walletAllocator.createWallet).toHaveBeenCalledWith(
                { userId: 'alice', accessToken: '' },
                'my-party',
                false,
                SigningProvider.WALLET_KERNEL
            )
            expect(wallet).toEqual(pendingWallet)
            expect(ledgerClient.patch).not.toHaveBeenCalled()
        })

        it('skips user creation when the ledger user already exists', async () => {
            ledgerClient.get.mockResolvedValue({ user: { id: 'alice' } })
            walletAllocator.createWallet.mockResolvedValue(createWallet())

            await createService().initializeOnboarding({
                username: 'alice',
                networkId: 'network-1',
                partyHint: 'my-party',
                signingProviderId: SigningProvider.WALLET_KERNEL,
            })

            expect(ledgerClient.post).not.toHaveBeenCalled()
        })

        it('rejects participant onboarding', async () => {
            await expect(
                createService().initializeOnboarding({
                    username: 'alice',
                    networkId: 'network-1',
                    partyHint: 'my-party',
                    signingProviderId: SigningProvider.PARTICIPANT,
                })
            ).rejects.toThrow(
                'Signing provider participant is not supported for self-issued onboarding'
            )
            expect(walletAllocator.createWallet).not.toHaveBeenCalled()
        })

        it('rejects an empty username', async () => {
            await expect(
                createService().initializeOnboarding({
                    username: '  ',
                    networkId: 'network-1',
                    partyHint: 'my-party',
                    signingProviderId: SigningProvider.WALLET_KERNEL,
                })
            ).rejects.toThrow('username is required')
        })

        it('rejects an empty party hint', async () => {
            await expect(
                createService().initializeOnboarding({
                    username: 'alice',
                    networkId: 'network-1',
                    partyHint: '  ',
                    signingProviderId: SigningProvider.WALLET_KERNEL,
                })
            ).rejects.toThrow('partyHint is required')
        })
    })

    describe('finalizeOnboarding', () => {
        it('polls the signing provider, allocates the party, and patches the ledger user', async () => {
            const pendingWallet = createWallet({
                signingProviderId: SigningProvider.FIREBLOCKS,
            })
            const allocatedWallet = createWallet({
                status: 'allocated',
                signingProviderId: SigningProvider.FIREBLOCKS,
            })
            const authPartyWallet = createWallet({
                status: 'allocated',
                signingProviderId: SigningProvider.FIREBLOCKS,
                isAuthParty: true,
            })
            store.getWallet
                .mockResolvedValueOnce(pendingWallet)
                .mockResolvedValueOnce(allocatedWallet)
                .mockResolvedValueOnce(authPartyWallet)

            const wallet = await createService().finalizeOnboarding({
                username: 'alice',
                networkId: 'network-1',
                partyId: pendingWallet.partyId,
            })

            expect(walletAllocator.allocateParty).toHaveBeenCalledWith(
                { userId: 'alice', accessToken: '' },
                pendingWallet,
                SigningProvider.FIREBLOCKS
            )
            expect(ledgerClient.patch).toHaveBeenCalledWith(
                '/v2/users/{user-id}',
                {
                    user: {
                        id: 'alice',
                        primaryParty: allocatedWallet.partyId,
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
                { path: { 'user-id': 'alice' } }
            )
            expect(store.updateWallet).toHaveBeenCalledWith({
                partyId: allocatedWallet.partyId,
                networkId: allocatedWallet.networkId,
                isAuthParty: true,
            })
            expect(wallet.status).toBe('allocated')
            expect(wallet.isAuthParty).toBe(true)
        })

        it('patches the ledger user when the wallet is already allocated', async () => {
            const allocatedWallet = createWallet({ status: 'allocated' })
            const authPartyWallet = createWallet({
                status: 'allocated',
                isAuthParty: true,
            })
            store.getWallet
                .mockResolvedValueOnce(allocatedWallet)
                .mockResolvedValueOnce(authPartyWallet)

            const wallet = await createService().finalizeOnboarding({
                username: 'alice',
                networkId: 'network-1',
                partyId: allocatedWallet.partyId,
            })

            expect(walletAllocator.allocateParty).not.toHaveBeenCalled()
            expect(ledgerClient.patch).toHaveBeenCalled()
            expect(store.updateWallet).toHaveBeenCalledWith({
                partyId: allocatedWallet.partyId,
                networkId: allocatedWallet.networkId,
                isAuthParty: true,
            })
            expect(wallet.isAuthParty).toBe(true)
        })

        it('does not patch the ledger user when allocateParty leaves the wallet unallocated', async () => {
            store.getWallet.mockResolvedValue(createWallet())

            const wallet = await createService().finalizeOnboarding({
                username: 'alice',
                networkId: 'network-1',
                partyId: 'alice::ns',
            })

            expect(walletAllocator.allocateParty).toHaveBeenCalled()
            expect(ledgerClient.patch).not.toHaveBeenCalled()
            expect(store.updateWallet).not.toHaveBeenCalled()
            expect(wallet.status).toBe('initialized')
        })

        it('throws when the wallet is missing', async () => {
            store.getWallet.mockResolvedValue(null)

            await expect(
                createService().finalizeOnboarding({
                    username: 'alice',
                    networkId: 'network-1',
                    partyId: 'missing::ns',
                })
            ).rejects.toThrow('Wallet not found for party missing::ns')
        })
    })
})
