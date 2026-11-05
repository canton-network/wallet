// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, type Mocked, vi } from 'vitest'
import { SigningProvider } from '@canton-network/core-signing-lib'
import type { LedgerClient } from '@canton-network/core-ledger-client'
import type { Logger } from 'pino'
import type {
    MessageRaw,
    Store,
    Wallet,
} from '@canton-network/core-wallet-store'
import {
    SELF_ISSUED_LOGIN_EXPIRED,
    SELF_ISSUED_LOGIN_UNAVAILABLE,
    SELF_ISSUED_TOKEN_REJECTED,
    SelfIssuedAuthService,
    type SelfIssuedWalletAllocationService,
    type SelfIssuedWalletSyncService,
} from './self-issued-auth-service.js'
import type { SignMessageService } from './sign-message-service.js'
import { decodeBase64, encodeBase64 } from './__tests__/test-utils.js'

const { probeGet, syncRights, syncAuthParty } = vi.hoisted(() => ({
    probeGet: vi.fn(),
    syncRights: vi.fn().mockResolvedValue([]),
    syncAuthParty: vi.fn(),
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

const publicKey = encodeBase64(new Uint8Array(32).fill(1))
const signature = encodeBase64('sig-bytes')

function signingInputExpiringIn(seconds: number): string {
    const encode = (value: unknown) =>
        encodeBase64(JSON.stringify(value), 'base64url')
    const exp = Math.floor(Date.now() / 1000) + seconds
    return `${encode({ alg: 'EdDSA', typ: 'JWT' })}.${encode({ exp })}`
}

const signingInput = signingInputExpiringIn(10 * 60)

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
    const logger = {
        info: vi.fn(),
        warn: vi.fn(),
    } as unknown as Logger
    let store: Mocked<
        Pick<
            Store,
            | 'getWallet'
            | 'getWallets'
            | 'updateWallet'
            | 'getCurrentNetwork'
            | 'upgradeSelfIssuedLoginSession'
            | 'setMessageRaw'
            | 'getMessageRaw'
            | 'setMessageRawStatus'
        >
    >
    let signMessageService: Mocked<
        Pick<SignMessageService, 'sign' | 'refreshMessage'>
    >
    let walletAllocator: Mocked<
        Pick<
            SelfIssuedWalletAllocationService,
            'createWallet' | 'allocateParty' | 'getKeys'
        >
    >
    let ledgerClient: Mocked<
        Pick<LedgerClient, 'get' | 'post' | 'patch' | 'waitForParty'>
    >

    beforeEach(() => {
        signMessageService = {
            sign: vi.fn().mockResolvedValue({
                status: 'signed',
                signature,
                publicKey,
            }),
            refreshMessage: vi.fn(),
        }
        probeGet.mockResolvedValue({ userId: 'alice' })
        syncRights.mockReset()
        syncRights.mockResolvedValue([])
        syncAuthParty.mockReset()
        store = {
            getWallet: vi.fn(),
            getWallets: vi.fn().mockResolvedValue([]),
            updateWallet: vi.fn().mockResolvedValue(undefined),
            getCurrentNetwork: vi.fn().mockResolvedValue(network),
            upgradeSelfIssuedLoginSession: vi
                .fn()
                .mockImplementation(
                    async (id: string, accessToken: string) => ({
                        id,
                        origin: 'https://app.example',
                        network: 'network-1',
                        userId: 'alice',
                        accessToken,
                    })
                ),
            setMessageRaw: vi.fn().mockResolvedValue(undefined),
            getMessageRaw: vi.fn(),
            setMessageRawStatus: vi.fn().mockResolvedValue(undefined),
        }
        walletAllocator = {
            createWallet: vi.fn(),
            allocateParty: vi.fn().mockResolvedValue(undefined),
            getKeys: vi.fn(),
        }
        ledgerClient = {
            get: vi.fn().mockResolvedValue({}),
            post: vi.fn().mockResolvedValue({ user: { id: 'alice' } }),
            patch: vi.fn().mockResolvedValue({ user: { id: 'alice' } }),
            waitForParty: vi.fn().mockResolvedValue(undefined),
        }
    })

    function createService() {
        return new SelfIssuedAuthService(
            { userId: 'alice', sessionId: 'onboarding-session' },
            store as unknown as Store,
            logger,
            walletAllocator as unknown as SelfIssuedWalletAllocationService,
            ledgerClient as unknown as LedgerClient,
            {
                syncRights,
                syncAuthParty,
            } as SelfIssuedWalletSyncService,
            signMessageService as unknown as SignMessageService
        )
    }

    function savedTokenMessage(): MessageRaw {
        return store.setMessageRaw.mock.calls[0][0] as MessageRaw
    }

    const selfIssuedTokenMessage = (
        overrides: Partial<MessageRaw> = {}
    ): MessageRaw => ({
        id: 'login-message',
        kind: 'self-issued-token',
        status: 'awaiting-signature',
        userId: 'alice',
        partyId: 'alice::ns',
        publicKey,
        message: signingInput,
        origin: null,
        createdAt: new Date(),
        externalTxId: 'provider-tx',
        ...overrides,
    })

    describe('getLoginMode', () => {
        it('returns create mode and does not discover a wallet when there is no ledger user', async () => {
            ledgerClient.get.mockRejectedValue({
                code: 'USER_NOT_FOUND',
                cause: 'getting user failed for unknown user "bob"',
                errorCategory: 11,
            })

            await expect(createService().getLoginMode()).resolves.toEqual({
                mode: 'create',
            })
            expect(syncAuthParty).not.toHaveBeenCalled()
        })

        it.each([
            ['no primary party', { id: 'alice' }],
            [
                'primary-party authentication turned off',
                { id: 'alice', primaryParty: 'alice::ns' },
            ],
            [
                'an external identity provider',
                {
                    id: 'alice',
                    primaryParty: 'alice::ns',
                    primaryPartyAuthentication: true,
                    identityProviderId: 'external-idp',
                },
            ],
        ])(
            'throws and does not discover a wallet when the user has %s',
            async (_, user) => {
                ledgerClient.get.mockResolvedValue({ user })

                await expect(createService().getLoginMode()).rejects.toThrow(
                    SELF_ISSUED_LOGIN_UNAVAILABLE
                )
                expect(syncAuthParty).not.toHaveBeenCalled()
            }
        )

        it('returns select mode with the wallet when the primary party is allocated and enabled', async () => {
            const authWallet = createWallet({
                status: 'allocated',
                isAuthParty: true,
            })
            ledgerClient.get.mockResolvedValue({
                user: {
                    id: 'alice',
                    primaryParty: authWallet.partyId,
                    primaryPartyAuthentication: true,
                },
            })
            syncAuthParty.mockResolvedValue(authWallet)

            await expect(createService().getLoginMode()).resolves.toEqual({
                mode: 'select',
                wallet: authWallet,
            })
            expect(syncAuthParty).toHaveBeenCalledWith(authWallet.partyId)
        })

        it.each([
            ['discovery finds no wallet', undefined],
            [
                'the wallet is still waiting for allocation',
                createWallet({ status: 'initialized' }),
            ],
            [
                'the wallet is disabled',
                createWallet({
                    status: 'allocated',
                    disabled: true,
                    isAuthParty: true,
                }),
            ],
        ])(
            'returns select mode without a wallet when %s',
            async (_, wallet) => {
                ledgerClient.get.mockResolvedValue({
                    user: {
                        id: 'alice',
                        primaryParty: 'alice::ns',
                        primaryPartyAuthentication: true,
                    },
                })
                syncAuthParty.mockResolvedValue(wallet)

                await expect(createService().getLoginMode()).resolves.toEqual({
                    mode: 'select',
                })
            }
        )

        it('propagates ledger errors other than a missing user', async () => {
            const permissionDenied = {
                code: 'PERMISSION_DENIED',
                cause: 'not allowed',
                errorCategory: 7,
            }
            ledgerClient.get.mockRejectedValue(permissionDenied)

            await expect(createService().getLoginMode()).rejects.toEqual(
                permissionDenied
            )
            expect(syncAuthParty).not.toHaveBeenCalled()
        })
    })

    describe('listSigningProviderKeys', () => {
        it('lists the keys of the login session user', async () => {
            const keys = {
                keys: [{ id: 'key-1', name: 'vault-1', publicKey }],
            }
            walletAllocator.getKeys.mockResolvedValue(keys)

            await expect(
                createService().listSigningProviderKeys(
                    SigningProvider.FIREBLOCKS
                )
            ).resolves.toEqual(keys)
            expect(walletAllocator.getKeys).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 'alice',
                    sessionId: 'onboarding-session',
                }),
                SigningProvider.FIREBLOCKS
            )
        })

        it('throws when the signing provider returns no keys', async () => {
            walletAllocator.getKeys.mockResolvedValue(undefined)

            await expect(
                createService().listSigningProviderKeys(
                    SigningProvider.FIREBLOCKS
                )
            ).rejects.toThrow('No keys for fireblocks found')
        })

        it('rejects providers that do not support selecting an existing key', async () => {
            await expect(
                createService().listSigningProviderKeys(SigningProvider.DFNS)
            ).rejects.toThrow(
                'Signing provider dfns does not support selecting an existing key'
            )
            expect(walletAllocator.getKeys).not.toHaveBeenCalled()
        })
    })

    describe('createWallet', () => {
        it('creates a primary wallet without creating a ledger user or granting rights', async () => {
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
            expect(ledgerClient.post).not.toHaveBeenCalled()
            expect(walletAllocator.createWallet).toHaveBeenCalledWith(
                {
                    userId: 'alice',
                    accessToken: '',
                    sessionId: 'onboarding-session',
                },
                'my-party',
                true,
                SigningProvider.WALLET_KERNEL,
                { grantRights: false }
            )
            expect(wallet).toEqual(pendingWallet)
            expect(ledgerClient.waitForParty).not.toHaveBeenCalled()
            expect(ledgerClient.patch).not.toHaveBeenCalled()
            expect(syncRights).not.toHaveBeenCalled()
        })

        it('passes the selected key to the wallet allocator', async () => {
            walletAllocator.createWallet.mockResolvedValue(createWallet())

            await createService().createWallet({
                partyHint: 'my-party',
                signingProviderId: SigningProvider.FIREBLOCKS,
                keyName: 'vault-1',
            })

            expect(walletAllocator.createWallet).toHaveBeenCalledWith(
                expect.objectContaining({ userId: 'alice' }),
                'my-party',
                true,
                SigningProvider.FIREBLOCKS,
                { grantRights: false, keyName: 'vault-1' }
            )
        })

        it('returns an allocated wallet without granting or syncing rights', async () => {
            const allocatedWallet = createWallet({ status: 'allocated' })
            walletAllocator.createWallet.mockResolvedValue(allocatedWallet)

            const wallet = await createService().createWallet({
                partyHint: 'my-party',
                signingProviderId: SigningProvider.WALLET_KERNEL,
            })

            expect(syncRights).not.toHaveBeenCalled()
            expect(wallet).toEqual(allocatedWallet)
        })

        it('rejects when primary party authentication is already configured', async () => {
            ledgerClient.get.mockResolvedValue({
                user: {
                    id: 'alice',
                    primaryParty: 'alice::ns',
                    primaryPartyAuthentication: true,
                },
            })

            await expect(
                createService().createWallet({
                    partyHint: 'my-party',
                    signingProviderId: SigningProvider.WALLET_KERNEL,
                })
            ).rejects.toThrow(
                'Primary party authentication is already configured for this user.'
            )
            expect(ledgerClient.post).not.toHaveBeenCalled()
            expect(walletAllocator.createWallet).not.toHaveBeenCalled()
        })

        it.each([
            ['no self-issued authentication fields', {}],
            [
                'only primary party authentication',
                { primaryPartyAuthentication: true },
            ],
            ['only a primary party', { primaryParty: 'alice::ns' }],
        ])(
            'rejects createWallet when the ledger user has %s',
            async (_, userFields) => {
                ledgerClient.get.mockResolvedValue({
                    user: { id: 'alice', ...userFields },
                })

                await expect(
                    createService().createWallet({
                        partyHint: 'my-party',
                        signingProviderId: SigningProvider.WALLET_KERNEL,
                    })
                ).rejects.toThrow(SELF_ISSUED_LOGIN_UNAVAILABLE)
                expect(walletAllocator.createWallet).not.toHaveBeenCalled()
            }
        )

        it('rejects a provider that cannot sign messages', async () => {
            await expect(
                createService().createWallet({
                    partyHint: 'my-party',
                    signingProviderId: SigningProvider.BITGO,
                })
            ).rejects.toThrow(
                'Signing provider bitgo does not support signing self-issued access tokens'
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

    describe('allocateParty', () => {
        it('allocates a pending wallet without granting or syncing rights and returns the refreshed wallet', async () => {
            const pendingWallet = createWallet({
                signingProviderId: SigningProvider.FIREBLOCKS,
            })
            const allocatedWallet = createWallet({
                status: 'allocated',
                signingProviderId: SigningProvider.FIREBLOCKS,
            })
            store.getWallet
                .mockResolvedValueOnce(pendingWallet)
                .mockResolvedValueOnce(allocatedWallet)

            const wallet = await createService().allocateParty(
                pendingWallet.partyId
            )

            expect(walletAllocator.allocateParty).toHaveBeenCalledWith(
                {
                    userId: 'alice',
                    accessToken: '',
                    sessionId: 'onboarding-session',
                },
                pendingWallet,
                SigningProvider.FIREBLOCKS,
                { grantRights: false }
            )
            expect(syncRights).not.toHaveBeenCalled()
            expect(wallet).toEqual(allocatedWallet)
        })

        it('returns an already allocated wallet without allocating or syncing rights', async () => {
            const allocatedWallet = createWallet({ status: 'allocated' })
            store.getWallet.mockResolvedValueOnce(allocatedWallet)

            const wallet = await createService().allocateParty(
                allocatedWallet.partyId
            )

            expect(walletAllocator.allocateParty).not.toHaveBeenCalled()
            expect(syncRights).not.toHaveBeenCalled()
            expect(wallet).toEqual(allocatedWallet)
        })

        it('returns the wallet unchanged while signing is still pending', async () => {
            const pendingWallet = createWallet()
            store.getWallet.mockResolvedValue(pendingWallet)

            const wallet = await createService().allocateParty(
                pendingWallet.partyId
            )

            expect(walletAllocator.allocateParty).toHaveBeenCalledWith(
                expect.objectContaining({ userId: 'alice' }),
                pendingWallet,
                pendingWallet.signingProviderId,
                { grantRights: false }
            )
            expect(syncRights).not.toHaveBeenCalled()
            expect(wallet).toEqual(pendingWallet)
        })

        it('throws when the wallet is missing', async () => {
            store.getWallet.mockResolvedValue(null)

            await expect(
                createService().allocateParty('missing::ns')
            ).rejects.toThrow('Wallet not found for party missing::ns')
        })
    })

    describe('signAccessToken', () => {
        it('saves a self-issued-token message and submits it for signing', async () => {
            store.getWallet.mockResolvedValue(
                createWallet({ status: 'allocated' })
            )

            const result = await createService().signAccessToken('alice::ns')

            const message = savedTokenMessage()
            expect(result).toEqual({ messageId: message.id, status: 'signed' })
            expect(message).toMatchObject({
                kind: 'self-issued-token',
                status: 'pending',
                userId: 'alice',
                partyId: 'alice::ns',
                publicKey,
                origin: null,
            })
            expect(signMessageService.sign).toHaveBeenCalledWith(
                {
                    userId: 'alice',
                    accessToken: '',
                    sessionId: 'onboarding-session',
                },
                message.id,
                'self-issued-token'
            )
            const payload = JSON.parse(
                new TextDecoder().decode(
                    decodeBase64(message.message.split('.')[1], 'base64url')
                )
            )
            expect(payload).toMatchObject({
                aud: 'participant-aud',
                scope: 'daml_ledger_api',
                iss: 'alice::ns',
                sub: 'alice::ns',
                'daml.com': {
                    syn: network.synchronizerId,
                    usr: 'alice',
                },
            })
            expect(ledgerClient.patch).not.toHaveBeenCalled()
            expect(store.upgradeSelfIssuedLoginSession).not.toHaveBeenCalled()
        })

        it('returns awaiting-signature while the provider awaits approval', async () => {
            store.getWallet.mockResolvedValue(
                createWallet({ status: 'allocated' })
            )
            signMessageService.sign.mockResolvedValue({
                status: 'awaiting-signature',
                publicKey,
                externalTxId: 'provider-tx',
            })

            const result = await createService().signAccessToken('alice::ns')

            expect(result).toEqual({
                messageId: savedTokenMessage().id,
                status: 'awaiting-signature',
            })
        })

        it('returns failed with the failure reason when signing fails', async () => {
            store.getWallet.mockResolvedValue(
                createWallet({ status: 'allocated' })
            )
            signMessageService.sign.mockResolvedValue({
                status: 'failed',
                publicKey,
                failureReason: 'Signing provider returned status: rejected',
            })

            const result = await createService().signAccessToken('alice::ns')

            expect(result).toEqual({
                messageId: savedTokenMessage().id,
                status: 'failed',
                failureReason: 'Signing provider returned status: rejected',
            })
        })

        it('rejects a wallet that is not allocated', async () => {
            store.getWallet.mockResolvedValue(createWallet())

            await expect(
                createService().signAccessToken('alice::ns')
            ).rejects.toThrow('Wallet for party alice::ns is not allocated')
            expect(store.setMessageRaw).not.toHaveBeenCalled()
        })

        it.each([
            [
                'not marked as the auth party',
                createWallet({ status: 'allocated', isAuthParty: false }),
            ],
            [
                'a different party',
                createWallet({
                    status: 'allocated',
                    partyId: 'other::ns',
                    isAuthParty: true,
                }),
            ],
        ])(
            'rejects a wallet that is %s when the user is already authenticated',
            async (_, wallet) => {
                ledgerClient.get.mockResolvedValue({
                    user: {
                        id: 'alice',
                        primaryParty: 'alice::ns',
                        primaryPartyAuthentication: true,
                    },
                })
                store.getWallet.mockResolvedValue(wallet)

                await expect(
                    createService().signAccessToken(wallet.partyId)
                ).rejects.toThrow(
                    `Party ${wallet.partyId} is not the authentication party for this user`
                )
                expect(store.setMessageRaw).not.toHaveBeenCalled()
                expect(signMessageService.sign).not.toHaveBeenCalled()
            }
        )

        it('rejects signing when the ledger user exists without self-issued authentication', async () => {
            ledgerClient.get.mockResolvedValue({ user: { id: 'alice' } })
            store.getWallet.mockResolvedValue(
                createWallet({ status: 'allocated' })
            )

            await expect(
                createService().signAccessToken('alice::ns')
            ).rejects.toThrow(SELF_ISSUED_LOGIN_UNAVAILABLE)
            expect(store.setMessageRaw).not.toHaveBeenCalled()
            expect(signMessageService.sign).not.toHaveBeenCalled()
        })
    })

    describe('getAccessTokenSignatureStatus', () => {
        it('returns signed once the provider has signed the token', async () => {
            store.getMessageRaw.mockResolvedValue(selfIssuedTokenMessage())
            store.getWallet.mockResolvedValue(
                createWallet({ status: 'allocated' })
            )
            signMessageService.refreshMessage.mockResolvedValue({
                status: 'signed',
                externalTxId: 'provider-tx',
                signature,
            })

            const result =
                await createService().getAccessTokenSignatureStatus(
                    'login-message'
                )

            expect(signMessageService.refreshMessage).toHaveBeenCalledWith(
                {
                    userId: 'alice',
                    accessToken: '',
                    sessionId: 'onboarding-session',
                },
                'login-message',
                'self-issued-token'
            )
            expect(result).toEqual({
                messageId: 'login-message',
                status: 'signed',
            })
            expect(ledgerClient.patch).not.toHaveBeenCalled()
            expect(store.upgradeSelfIssuedLoginSession).not.toHaveBeenCalled()
        })

        it('returns awaiting-signature while the provider awaits approval', async () => {
            store.getMessageRaw.mockResolvedValue(selfIssuedTokenMessage())
            store.getWallet.mockResolvedValue(
                createWallet({ status: 'allocated' })
            )
            signMessageService.refreshMessage.mockResolvedValue({
                status: 'awaiting-signature',
                externalTxId: 'provider-tx',
            })

            await expect(
                createService().getAccessTokenSignatureStatus('login-message')
            ).resolves.toEqual({
                messageId: 'login-message',
                status: 'awaiting-signature',
            })
        })

        it('returns failed with the failure reason when the provider rejected the token', async () => {
            store.getMessageRaw.mockResolvedValue(selfIssuedTokenMessage())
            store.getWallet.mockResolvedValue(
                createWallet({ status: 'allocated' })
            )
            signMessageService.refreshMessage.mockResolvedValue({
                status: 'failed',
                failureReason: 'Signing provider returned status: rejected',
            })

            await expect(
                createService().getAccessTokenSignatureStatus('login-message')
            ).resolves.toEqual({
                messageId: 'login-message',
                status: 'failed',
                failureReason: 'Signing provider returned status: rejected',
            })
        })

        it('fails an expired request awaiting approval without asking the provider', async () => {
            store.getMessageRaw.mockResolvedValue(
                selfIssuedTokenMessage({ message: signingInputExpiringIn(-1) })
            )
            store.getWallet.mockResolvedValue(
                createWallet({ status: 'allocated' })
            )

            await expect(
                createService().getAccessTokenSignatureStatus('login-message')
            ).resolves.toEqual({
                messageId: 'login-message',
                status: 'failed',
                failureReason: SELF_ISSUED_LOGIN_EXPIRED,
            })
            expect(store.setMessageRawStatus).toHaveBeenCalledWith(
                'login-message',
                'failed',
                { failureReason: SELF_ISSUED_LOGIN_EXPIRED }
            )
            expect(signMessageService.refreshMessage).not.toHaveBeenCalled()
        })

        it('throws when the message was never submitted for signing', async () => {
            store.getMessageRaw.mockResolvedValue(
                selfIssuedTokenMessage({ status: 'pending' })
            )
            store.getWallet.mockResolvedValue(
                createWallet({ status: 'allocated' })
            )
            signMessageService.refreshMessage.mockResolvedValue({
                status: 'pending',
            })

            await expect(
                createService().getAccessTokenSignatureStatus('login-message')
            ).rejects.toThrow(
                'Self-issued login request login-message was not submitted for signing'
            )
        })

        it('rejects a regular message', async () => {
            store.getMessageRaw.mockResolvedValue(
                selfIssuedTokenMessage({ kind: 'regular' })
            )

            await expect(
                createService().getAccessTokenSignatureStatus('login-message')
            ).rejects.toThrow(
                'Self-issued login request not found with id: login-message'
            )
            expect(signMessageService.refreshMessage).not.toHaveBeenCalled()
        })

        it('rejects a missing message', async () => {
            store.getMessageRaw.mockResolvedValue(undefined)

            await expect(
                createService().getAccessTokenSignatureStatus('login-message')
            ).rejects.toThrow(
                'Self-issued login request not found with id: login-message'
            )
        })

        it("refuses to complete when the wallet public key doesn't match message public key", async () => {
            store.getMessageRaw.mockResolvedValue(selfIssuedTokenMessage())
            store.getWallet.mockResolvedValue(
                createWallet({
                    status: 'allocated',
                    publicKey: encodeBase64(new Uint8Array(32).fill(2)),
                })
            )

            await expect(
                createService().getAccessTokenSignatureStatus('login-message')
            ).rejects.toThrow(
                "Wallet public key alice::ns doesn't match public key used for signing access token. Refusing to complete login."
            )
            expect(signMessageService.refreshMessage).not.toHaveBeenCalled()
        })
    })

    describe('connectWithSignedAccessToken', () => {
        const accessToken = `${signingInput}.${encodeBase64(decodeBase64(signature), 'base64url')}`

        it('waits for the party, creates the ledger user with its auth party and rights in one request, and upgrades the tokenless session', async () => {
            const allocatedWallet = createWallet({ status: 'allocated' })
            const authPartyWallet = createWallet({
                status: 'allocated',
                isAuthParty: true,
            })
            store.getMessageRaw.mockResolvedValue(
                selfIssuedTokenMessage({ status: 'signed', signature })
            )
            store.getWallet
                .mockResolvedValueOnce(allocatedWallet)
                .mockResolvedValueOnce(authPartyWallet)

            const result =
                await createService().connectWithSignedAccessToken(
                    'login-message'
                )

            expect(ledgerClient.waitForParty).toHaveBeenCalledWith(
                allocatedWallet.partyId
            )
            expect(ledgerClient.post).toHaveBeenCalledOnce()
            expect(ledgerClient.post).toHaveBeenCalledWith('/v2/users', {
                user: {
                    id: 'alice',
                    isDeactivated: false,
                    identityProviderId: '',
                    primaryParty: allocatedWallet.partyId,
                    primaryPartyAuthentication: true,
                },
                rights: [
                    {
                        kind: {
                            CanActAs: {
                                value: { party: allocatedWallet.partyId },
                            },
                        },
                    },
                ],
            })
            expect(
                ledgerClient.waitForParty.mock.invocationCallOrder[0]
            ).toBeLessThan(ledgerClient.post.mock.invocationCallOrder[0])
            expect(ledgerClient.patch).not.toHaveBeenCalled()
            expect(store.updateWallet).toHaveBeenCalledWith({
                partyId: allocatedWallet.partyId,
                networkId: allocatedWallet.networkId,
                isAuthParty: true,
            })
            expect(syncRights).toHaveBeenCalledOnce()
            expect(probeGet).toHaveBeenCalledWith('/v2/authenticated-user')
            expect(store.upgradeSelfIssuedLoginSession).toHaveBeenCalledWith(
                'onboarding-session',
                accessToken
            )
            expect(result).toMatchObject({
                status: 'connected',
                wallet: authPartyWallet,
                accessToken,
                session: { id: 'onboarding-session' },
            })
            expect(signMessageService.refreshMessage).not.toHaveBeenCalled()
        })

        it('logs in an existing auth party without changing the ledger user', async () => {
            const authPartyWallet = createWallet({
                status: 'allocated',
                isAuthParty: true,
            })
            ledgerClient.get.mockResolvedValue({
                user: {
                    id: 'alice',
                    primaryParty: authPartyWallet.partyId,
                    primaryPartyAuthentication: true,
                },
            })
            store.getMessageRaw.mockResolvedValue(
                selfIssuedTokenMessage({ status: 'signed', signature })
            )
            store.getWallet.mockResolvedValue(authPartyWallet)

            const result =
                await createService().connectWithSignedAccessToken(
                    'login-message'
                )

            expect(result).toMatchObject({
                status: 'connected',
                wallet: authPartyWallet,
            })
            expect(ledgerClient.patch).not.toHaveBeenCalled()
            expect(ledgerClient.post).not.toHaveBeenCalled()
            expect(ledgerClient.waitForParty).not.toHaveBeenCalled()
            expect(store.updateWallet).not.toHaveBeenCalled()
            expect(store.upgradeSelfIssuedLoginSession).toHaveBeenCalledOnce()
        })

        it('rejects login when the ledger user exists without self-issued authentication', async () => {
            ledgerClient.get.mockResolvedValue({ user: { id: 'alice' } })
            store.getMessageRaw.mockResolvedValue(
                selfIssuedTokenMessage({ status: 'signed', signature })
            )
            store.getWallet.mockResolvedValue(
                createWallet({ status: 'allocated' })
            )

            await expect(
                createService().connectWithSignedAccessToken('login-message')
            ).rejects.toThrow(SELF_ISSUED_LOGIN_UNAVAILABLE)
            expect(ledgerClient.post).not.toHaveBeenCalled()
            expect(ledgerClient.waitForParty).not.toHaveBeenCalled()
            expect(ledgerClient.patch).not.toHaveBeenCalled()
            expect(store.updateWallet).not.toHaveBeenCalled()
            expect(probeGet).not.toHaveBeenCalled()
            expect(store.upgradeSelfIssuedLoginSession).not.toHaveBeenCalled()
        })

        it('does not create the ledger user when the party never appears on the participant', async () => {
            const allocatedWallet = createWallet({ status: 'allocated' })
            store.getMessageRaw.mockResolvedValue(
                selfIssuedTokenMessage({ status: 'signed', signature })
            )
            store.getWallet.mockResolvedValue(allocatedWallet)
            ledgerClient.waitForParty.mockRejectedValue(
                new Error(
                    'timed out waiting for new party to appear after 30 tries'
                )
            )

            await expect(
                createService().connectWithSignedAccessToken('login-message')
            ).rejects.toThrow(
                'timed out waiting for new party to appear after 30 tries'
            )
            expect(ledgerClient.post).not.toHaveBeenCalled()
            expect(ledgerClient.patch).not.toHaveBeenCalled()
            expect(store.updateWallet).not.toHaveBeenCalled()
            expect(syncRights).not.toHaveBeenCalled()
            expect(probeGet).not.toHaveBeenCalled()
            expect(store.upgradeSelfIssuedLoginSession).not.toHaveBeenCalled()
        })

        it('does not mark the wallet as the auth party when creating the ledger user fails', async () => {
            store.getMessageRaw.mockResolvedValue(
                selfIssuedTokenMessage({ status: 'signed', signature })
            )
            store.getWallet.mockResolvedValue(
                createWallet({ status: 'allocated' })
            )
            ledgerClient.post.mockRejectedValue(
                new Error('USER_ALREADY_EXISTS')
            )

            await expect(
                createService().connectWithSignedAccessToken('login-message')
            ).rejects.toThrow('USER_ALREADY_EXISTS')
            expect(store.updateWallet).not.toHaveBeenCalled()
            expect(syncRights).not.toHaveBeenCalled()
            expect(probeGet).not.toHaveBeenCalled()
            expect(store.upgradeSelfIssuedLoginSession).not.toHaveBeenCalled()
        })

        it('rejects a token that is not signed yet', async () => {
            store.getMessageRaw.mockResolvedValue(selfIssuedTokenMessage())
            store.getWallet.mockResolvedValue(
                createWallet({ status: 'allocated' })
            )

            await expect(
                createService().connectWithSignedAccessToken('login-message')
            ).rejects.toThrow(
                'Self-issued login request login-message is not signed'
            )
            expect(ledgerClient.patch).not.toHaveBeenCalled()
            expect(store.upgradeSelfIssuedLoginSession).not.toHaveBeenCalled()
        })

        it('rejects a regular message', async () => {
            store.getMessageRaw.mockResolvedValue(
                selfIssuedTokenMessage({
                    kind: 'regular',
                    status: 'signed',
                    signature,
                })
            )

            await expect(
                createService().connectWithSignedAccessToken('login-message')
            ).rejects.toThrow(
                'Self-issued login request not found with id: login-message'
            )
            expect(store.upgradeSelfIssuedLoginSession).not.toHaveBeenCalled()
        })

        it('fails an expired token without changing the ledger user', async () => {
            store.getMessageRaw.mockResolvedValue(
                selfIssuedTokenMessage({
                    status: 'signed',
                    signature,
                    message: signingInputExpiringIn(-1),
                })
            )
            store.getWallet.mockResolvedValue(
                createWallet({ status: 'allocated' })
            )

            await expect(
                createService().connectWithSignedAccessToken('login-message')
            ).resolves.toEqual({
                status: 'failed',
                failureReason: SELF_ISSUED_LOGIN_EXPIRED,
            })
            expect(store.setMessageRawStatus).toHaveBeenCalledWith(
                'login-message',
                'failed',
                { failureReason: SELF_ISSUED_LOGIN_EXPIRED }
            )
            expect(ledgerClient.patch).not.toHaveBeenCalled()
            expect(probeGet).not.toHaveBeenCalled()
            expect(store.upgradeSelfIssuedLoginSession).not.toHaveBeenCalled()
        })

        describe('when the participant probe fails', () => {
            beforeEach(() => {
                store.getMessageRaw.mockResolvedValue(
                    selfIssuedTokenMessage({ status: 'signed', signature })
                )
                store.getWallet
                    .mockResolvedValueOnce(
                        createWallet({ status: 'allocated' })
                    )
                    .mockResolvedValueOnce(
                        createWallet({ status: 'allocated', isAuthParty: true })
                    )
            })

            it('fails the login when the participant rejects the token', async () => {
                probeGet.mockRejectedValue({ code: 'UNAUTHENTICATED' })

                await expect(
                    createService().connectWithSignedAccessToken(
                        'login-message'
                    )
                ).resolves.toEqual({
                    status: 'failed',
                    failureReason: SELF_ISSUED_TOKEN_REJECTED,
                })
                expect(store.setMessageRawStatus).toHaveBeenCalledWith(
                    'login-message',
                    'failed',
                    { failureReason: SELF_ISSUED_TOKEN_REJECTED }
                )
                expect(
                    store.upgradeSelfIssuedLoginSession
                ).not.toHaveBeenCalled()
            })

            it('fails the login when the participant cannot be reached', async () => {
                probeGet.mockRejectedValue(new TypeError('fetch failed'))

                await expect(
                    createService().connectWithSignedAccessToken(
                        'login-message'
                    )
                ).resolves.toEqual({
                    status: 'failed',
                    failureReason: SELF_ISSUED_TOKEN_REJECTED,
                })
                expect(store.setMessageRawStatus).toHaveBeenCalledWith(
                    'login-message',
                    'failed',
                    { failureReason: SELF_ISSUED_TOKEN_REJECTED }
                )
                expect(
                    store.upgradeSelfIssuedLoginSession
                ).not.toHaveBeenCalled()
            })
        })
    })
})
