// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pino } from 'pino'
import { sink } from 'pino-test'
import { SigningProvider } from '@canton-network/core-signing-lib'
import type { LedgerClient } from '@canton-network/core-ledger-client'
import type { Store, Wallet } from '@canton-network/core-wallet-store'
import type { SigningDrivers } from '@canton-network/core-wallet-services'
import type { WalletAllocationService } from './wallet-allocation/wallet-allocation-service.js'
import { SelfIssuedAuthService } from './self-issued-auth-service'

const { probeGet } = vi.hoisted(() => ({
    probeGet: vi.fn(),
}))

vi.mock('@canton-network/core-ledger-client', async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import('@canton-network/core-ledger-client')
        >()
    return {
        ...actual,
        LedgerClient: class {
            get = probeGet
        },
    }
})

const publicKey = Buffer.alloc(32, 1).toString('base64')

const createWallet = (overrides: Partial<Wallet> = {}): Wallet => ({
    primary: true,
    partyId: 'alice::ns',
    status: 'initialized',
    hint: 'alice',
    signingProviderId: SigningProvider.WALLET_KERNEL,
    publicKey,
    namespace: 'ns',
    networkId: 'network-1',
    userId: 'alice',
    rights: [],
    ...overrides,
})

const network = {
    id: 'network-1',
    synchronizerId: 'global-domain::fingerprint',
    ledgerApi: { baseUrl: 'http://ledger.example' },
    auth: {
        method: 'self_issued' as const,
        audience: 'participant-aud',
        scope: 'daml_ledger_api',
    },
}

describe('SelfIssuedAuthService', () => {
    const logger = pino(sink())
    let store: {
        getWallet: ReturnType<typeof vi.fn>
        getWallets: ReturnType<typeof vi.fn>
        updateWallet: ReturnType<typeof vi.fn>
        getCurrentNetwork: ReturnType<typeof vi.fn>
        getOnboardingSession: ReturnType<typeof vi.fn>
        setSession: ReturnType<typeof vi.fn>
    }
    let signMessage: ReturnType<typeof vi.fn>
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
        signMessage = vi.fn().mockResolvedValue({
            signature: Buffer.from('sig-bytes').toString('base64'),
        })
        probeGet.mockResolvedValue({ userId: 'alice' })
        store = {
            getWallet: vi.fn(),
            getWallets: vi.fn().mockResolvedValue([]),
            updateWallet: vi.fn().mockResolvedValue(undefined),
            getCurrentNetwork: vi.fn().mockResolvedValue(network),
            getOnboardingSession: vi.fn().mockResolvedValue({
                id: 'onboarding-session',
                origin: 'https://app.example',
                network: 'network-1',
                userId: 'alice',
            }),
            setSession: vi.fn().mockResolvedValue(undefined),
        }
        walletAllocator = {
            createWallet: vi.fn(),
            allocateParty: vi.fn().mockResolvedValue(undefined),
        }
        ledgerClient = {
            get: vi.fn().mockResolvedValue({}),
            post: vi.fn().mockResolvedValue({ user: { id: 'alice' } }),
            patch: vi.fn().mockResolvedValue({ user: { id: 'alice' } }),
        }
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    function createService() {
        const driver = { controller: () => ({ signMessage }) }
        const drivers = {
            [SigningProvider.WALLET_KERNEL]: driver,
            [SigningProvider.FIREBLOCKS]: driver,
        } as unknown as SigningDrivers
        return new SelfIssuedAuthService(
            { userId: 'alice', sessionId: 'onboarding-session' },
            store as unknown as Store,
            logger,
            walletAllocator as unknown as WalletAllocationService,
            ledgerClient as unknown as LedgerClient,
            drivers
        )
    }

    describe('getOnboardingState', () => {
        it('returns whether the ledger user exists and the stored wallets', async () => {
            const wallet = createWallet()
            ledgerClient.get.mockResolvedValue({ user: { id: 'alice' } })
            store.getWallets.mockResolvedValue([wallet])

            await expect(createService().getOnboardingState()).resolves.toEqual(
                {
                    userExists: true,
                    wallets: [wallet],
                }
            )
        })

        it('treats USER_NOT_FOUND as a missing ledger user', async () => {
            ledgerClient.get.mockRejectedValue({
                code: 'USER_NOT_FOUND',
                cause: 'getting user failed for unknown user "bubu"',
                errorCategory: 11,
            })

            await expect(createService().getOnboardingState()).resolves.toEqual(
                {
                    userExists: false,
                    wallets: [],
                }
            )
        })

        it('propagates non–USER_NOT_FOUND ledger errors', async () => {
            const permissionDenied = {
                code: 'PERMISSION_DENIED',
                cause: 'not allowed',
                errorCategory: 7,
            }
            ledgerClient.get.mockRejectedValue(permissionDenied)

            await expect(createService().getOnboardingState()).rejects.toEqual(
                permissionDenied
            )
        })
    })

    describe('createWallet', () => {
        it('creates a ledger user and a wallet signing request', async () => {
            const pendingWallet = createWallet()
            walletAllocator.createWallet.mockResolvedValue(pendingWallet)

            const wallet = await createService().createWallet({
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
                {
                    userId: 'alice',
                    accessToken: '',
                    sessionId: 'onboarding-session',
                },
                'my-party',
                false,
                SigningProvider.WALLET_KERNEL
            )
            expect(wallet).toEqual(pendingWallet)
            expect(ledgerClient.patch).not.toHaveBeenCalled()
        })

        it('rejects an existing ledger user', async () => {
            ledgerClient.get.mockResolvedValue({ user: { id: 'alice' } })

            await expect(
                createService().createWallet({
                    partyHint: 'my-party',
                    signingProviderId: SigningProvider.WALLET_KERNEL,
                })
            ).rejects.toThrow(
                'Selecting an existing self-issued user is not implemented yet.'
            )
            expect(ledgerClient.post).not.toHaveBeenCalled()
            expect(walletAllocator.createWallet).not.toHaveBeenCalled()
        })

        it('rejects participant onboarding', async () => {
            await expect(
                createService().createWallet({
                    partyHint: 'my-party',
                    signingProviderId: SigningProvider.PARTICIPANT,
                })
            ).rejects.toThrow(
                'Signing provider participant is not supported for self-issued onboarding'
            )
            expect(walletAllocator.createWallet).not.toHaveBeenCalled()
        })

        it('rejects an empty party hint', async () => {
            await expect(
                createService().createWallet({
                    partyHint: '  ',
                    signingProviderId: SigningProvider.WALLET_KERNEL,
                })
            ).rejects.toThrow('partyHint is required')
        })
    })

    describe('allocateParty and connectSession', () => {
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
                .mockResolvedValueOnce(allocatedWallet)
                .mockResolvedValueOnce(authPartyWallet)

            const service = createService()
            await service.allocateParty({
                partyId: pendingWallet.partyId,
            })
            const wallet = (
                await service.connectSession({
                    partyId: pendingWallet.partyId,
                })
            ).wallet

            expect(walletAllocator.allocateParty).toHaveBeenCalledWith(
                {
                    userId: 'alice',
                    accessToken: '',
                    sessionId: 'onboarding-session',
                },
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
            expect(store.getOnboardingSession).toHaveBeenCalledWith(
                'onboarding-session'
            )
            expect(store.setSession).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'onboarding-session',
                    origin: 'https://app.example',
                    network: 'network-1',
                    accessToken: expect.any(String),
                })
            )
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

            const wallet = (
                await createService().connectSession({
                    partyId: allocatedWallet.partyId,
                })
            ).wallet

            expect(walletAllocator.allocateParty).not.toHaveBeenCalled()
            expect(ledgerClient.patch).toHaveBeenCalled()
            expect(store.updateWallet).toHaveBeenCalledWith({
                partyId: allocatedWallet.partyId,
                networkId: allocatedWallet.networkId,
                isAuthParty: true,
            })
            expect(wallet.isAuthParty).toBe(true)
            expect(probeGet).toHaveBeenCalledWith('/v2/authenticated-user')
            const signingInput = signMessage.mock.calls[0][0].message as string
            const payload = JSON.parse(
                Buffer.from(signingInput.split('.')[1], 'base64url').toString()
            )
            expect(payload).toMatchObject({
                aud: 'participant-aud',
                scope: 'daml_ledger_api',
                iss: allocatedWallet.partyId,
                sub: allocatedWallet.partyId,
                'daml.com': {
                    syn: network.synchronizerId,
                    usr: 'alice',
                },
            })
            expect(payload.exp).toBe(Math.floor(Date.now() / 1000) + 10 * 60)
            expect(store.setSession).toHaveBeenCalledOnce()
        })

        it('keeps the tokenless session when the participant rejects the token', async () => {
            const allocatedWallet = createWallet({ status: 'allocated' })
            store.getWallet
                .mockResolvedValueOnce(allocatedWallet)
                .mockResolvedValueOnce(
                    createWallet({ status: 'allocated', isAuthParty: true })
                )
            probeGet.mockRejectedValue(new Error('UNAUTHENTICATED'))

            await expect(
                createService().connectSession({
                    partyId: allocatedWallet.partyId,
                })
            ).rejects.toThrow(
                'Self-issued token was rejected by the participant'
            )
            expect(store.setSession).not.toHaveBeenCalled()
        })

        it('does not patch the ledger user when allocateParty leaves the wallet unallocated', async () => {
            store.getWallet.mockResolvedValue(createWallet())

            const wallet = await createService().allocateParty({
                partyId: 'alice::ns',
            })

            expect(walletAllocator.allocateParty).toHaveBeenCalled()
            expect(ledgerClient.patch).not.toHaveBeenCalled()
            expect(store.updateWallet).not.toHaveBeenCalled()
            expect(wallet.status).toBe('initialized')
            expect(signMessage).not.toHaveBeenCalled()
            expect(store.setSession).not.toHaveBeenCalled()
        })

        it('throws when the wallet is missing', async () => {
            store.getWallet.mockResolvedValue(null)

            await expect(
                createService().allocateParty({
                    partyId: 'missing::ns',
                })
            ).rejects.toThrow('Wallet not found for party missing::ns')
        })
    })
})
