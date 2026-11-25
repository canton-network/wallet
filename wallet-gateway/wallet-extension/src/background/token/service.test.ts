// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LedgerClient } from '@canton-network/core-ledger-client'
import { errorCodes } from '@canton-network/core-rpc-errors'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import type { Wallet } from '@canton-network/core-wallet-store'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import createPlain from '@/__tests__/fixtures/v3-create-plain.json'
import { EXTENSION_ORIGIN } from '@/shared/auth-protocol.ts'

import type { AuthContextStore } from '../auth-context.ts'
import type { TransactionSubmitter } from '../controllers/user/transactions.ts'
import type { RegistryStore } from '../store/registries.ts'
import { createTestWalletStore } from '../store/test-store.ts'
import type { TokenSdk, TokenSdkConfig } from './sdk.ts'
import { createTokenService } from './service.ts'

const networkId = 'canton:localnet'
const context: AuthContext = { userId: 'alice', accessToken: 'alice-token' }
const registryUrls = ['http://scan.localhost:4000']

const wallet: Wallet = {
    primary: true,
    status: 'allocated',
    partyId: 'alice::1220',
    hint: 'alice',
    publicKey: 'public-key',
    namespace: '1220',
    networkId,
    signingProviderId: 'wallet-kernel',
    rights: [],
    userId: context.userId,
}

const registryUrl = new URL('http://scan.localhost:4000')
const amulet = { admin: 'dso::1220', id: 'Amulet' }
const command = () => [{ ExerciseCommand: {} }, []]

function fakeSdk(transferVersions = ['v1', 'v2']) {
    const transfer = () => ({
        create: vi.fn(async () => command()),
        withdraw: vi.fn(async () => command()),
    })
    return {
        token: {
            assets: vi.fn(async () => [
                {
                    ...amulet,
                    displayName: 'Amulet',
                    symbol: 'CC',
                    registryUrl,
                    capabilities: { transferInstruction: transferVersions },
                },
            ]),
            v1: {
                utxos: { list: vi.fn(async () => [{ contractId: 'v1' }]) },
                transfer: transfer(),
            },
            v2: {
                utxos: { list: vi.fn(async () => [{ contractId: 'v2' }]) },
                transfer: transfer(),
            },
        },
    }
}

const transferParams = {
    sender: wallet.partyId,
    receiver: 'bob::1220',
    instrumentId: amulet,
    amount: '5',
    expiry: '2026-12-01T00:00:00.000Z',
    tokenStandardVersion: 'v2' as const,
}

describe('createTokenService', () => {
    let sdk: ReturnType<typeof fakeSdk>
    let createSdk: ReturnType<
        typeof vi.fn<(config: TokenSdkConfig) => Promise<TokenSdk>>
    >
    let registries: RegistryStore
    let authContext: Pick<AuthContextStore, 'load'>
    let sign: Mock<TransactionSubmitter['sign']>
    let execute: Mock<TransactionSubmitter['execute']>
    let prepare: Mock<LedgerClient['postWithRetry']>
    let store: ReturnType<typeof createTestWalletStore>

    function service() {
        store = createTestWalletStore(context)
        return createTokenService({
            authContext,
            getStore: async () => store,
            registries,
            createSdk,
            submitter: { sign, execute },
        })
    }

    async function signedIn() {
        const tokenService = service()
        await store.setSession({
            id: 'dapp-session',
            origin: 'https://dapp.example',
            network: networkId,
            accessToken: context.accessToken,
        })
        await store.setSession({
            id: 'session-1',
            origin: EXTENSION_ORIGIN,
            network: networkId,
            accessToken: context.accessToken,
        })
        await store.addWallet({ ...wallet })
        return tokenService
    }

    beforeEach(() => {
        sdk = fakeSdk()
        createSdk = vi.fn(async () => sdk as unknown as TokenSdk)
        registries = {
            forNetwork: async (id) => (id === networkId ? registryUrls : []),
        }
        authContext = { load: async () => context }
        vi.spyOn(LedgerClient.prototype, 'getSynchronizerId').mockResolvedValue(
            'global::1220'
        )
        // A prepared transaction whose hash matches, as the ledger sends it.
        prepare = vi
            .spyOn(LedgerClient.prototype, 'postWithRetry')
            .mockResolvedValue({
                preparedTransaction: createPlain.preparedTransaction,
                preparedTransactionHash: Buffer.from(
                    createPlain.expected.hash,
                    'hex'
                ).toString('base64'),
            })
        sign = vi.fn(
            async (signStore, _context, _session, { transactionId }) => {
                await signStore.setTransactionSigned(transactionId, new Date())
                return {
                    status: 'signed' as const,
                    partyId: wallet.partyId,
                    signature: 'signature',
                    signedBy: 'namespace',
                }
            }
        )
        execute = vi.fn(
            async (executeStore, _context, _session, { transactionId }) => {
                await executeStore.setTransactionStatus(
                    transactionId,
                    'executed'
                )
                return { updateId: 'update-1', completionOffset: 42 }
            }
        )
    })

    it('rejects a party that is not one of the user’s wallets', async () => {
        const tokenService = await signedIn()

        await expect(
            tokenService.token.v1.utxos.list({ partyId: 'mallory::1220' })
        ).rejects.toThrow('Party mallory::1220 does not belong to user')
        await expect(
            tokenService.token.v2.utxos.list({ partyId: 'mallory::1220' })
        ).rejects.toThrow('does not belong to user')
        expect(createSdk).not.toHaveBeenCalled()
    })

    it.each([
        ['missing', {}],
        ['null', { partyId: null }],
        ['not a string', { partyId: 42 }],
        ['empty', { partyId: '' }],
        ['no params', undefined],
    ])('rejects a %s partyId', async (_, params) => {
        const tokenService = await signedIn()

        await expect(
            tokenService.token.v1.utxos.list(params as never)
        ).rejects.toThrow('A partyId is required')
        await expect(
            tokenService.token.v2.utxos.list(params as never)
        ).rejects.toThrow('A partyId is required')
        expect(createSdk).not.toHaveBeenCalled()
    })

    it('lists the holdings of one of the user’s wallets', async () => {
        const tokenService = await signedIn()
        const params = { partyId: wallet.partyId, limit: 10 }

        await expect(tokenService.token.v1.utxos.list(params)).resolves.toEqual(
            [{ contractId: 'v1' }]
        )
        await expect(tokenService.token.v2.utxos.list(params)).resolves.toEqual(
            [{ contractId: 'v2' }]
        )
        expect(sdk.token.v1.utxos.list).toHaveBeenCalledWith(
            expect.objectContaining(params)
        )
        expect(sdk.token.v2.utxos.list).toHaveBeenCalledWith(
            expect.objectContaining(params)
        )
    })

    it('builds the SDK with the user whose wallets it checked', async () => {
        const tokenService = await signedIn()
        // Another user signs in after the first load, while the call runs.
        let loads = 0
        authContext.load = async () =>
            loads++ === 0
                ? context
                : { userId: 'bob', accessToken: 'bob-token' }

        await tokenService.token.v1.utxos.list({ partyId: wallet.partyId })

        expect(loads).toBe(1)
        expect(createSdk).toHaveBeenCalledWith(
            expect.objectContaining({ accessToken: context.accessToken })
        )
    })

    it('doesn’t pass options it doesn’t expose', async () => {
        const tokenService = await signedIn()

        await tokenService.token.v1.utxos.list({
            partyId: wallet.partyId,
            continueUntilCompletion: true,
        } as never)

        expect(sdk.token.v1.utxos.list).toHaveBeenCalledWith(
            expect.not.objectContaining({ continueUntilCompletion: true })
        )
    })

    it('rejects when nobody is signed in', async () => {
        authContext = { load: async () => undefined }
        const tokenService = service()

        await expect(tokenService.token.instruments()).rejects.toThrow(
            'Not signed in'
        )
        await expect(
            tokenService.token.v1.utxos.list({ partyId: wallet.partyId })
        ).rejects.toThrow('Not signed in')
        expect(createSdk).not.toHaveBeenCalled()
    })

    it('builds the SDK for the current network, its registries and the user’s token', async () => {
        const tokenService = await signedIn()

        await tokenService.token.v1.utxos.list({ partyId: wallet.partyId })

        expect(createSdk).toHaveBeenCalledWith({
            network: expect.objectContaining({ id: networkId }),
            accessToken: context.accessToken,
            registries: registryUrls,
        })
    })

    describe('transfer.create', () => {
        it('falls back to v1 when the registry has no v2 transfers', async () => {
            sdk = fakeSdk(['v1'])
            const tokenService = await signedIn()

            await tokenService.token.transfer.create(transferParams)

            expect(sdk.token.v1.transfer.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    sender: wallet.partyId,
                    recipient: 'bob::1220',
                    instrumentId: 'Amulet',
                    registryUrl,
                })
            )
            expect(sdk.token.v2.transfer.create).not.toHaveBeenCalled()
        })

        it('refuses a sender that isn’t the user’s before preparing', async () => {
            const tokenService = await signedIn()

            await expect(
                tokenService.token.transfer.create({
                    ...transferParams,
                    sender: 'mallory::1220',
                })
            ).rejects.toThrow('Party mallory::1220 does not belong to user')
            expect(createSdk).not.toHaveBeenCalled()
            expect(prepare).not.toHaveBeenCalled()
        })

        it('signs and executes the transfer in the extension’s session', async () => {
            const tokenService = await signedIn()

            await tokenService.token.transfer.create(transferParams)

            expect(prepare).toHaveBeenCalledWith(
                '/v2/interactive-submission/prepare',
                expect.objectContaining({ actAs: [wallet.partyId] })
            )
            const [, , sessionId, { transactionId, partyId }] =
                sign.mock.calls[0]!
            expect([sessionId, partyId]).toEqual(['session-1', wallet.partyId])
            expect(execute).toHaveBeenCalledWith(
                expect.anything(),
                context,
                'session-1',
                { transactionId, partyId }
            )
            await expect(store.getTransaction(transactionId)).resolves.toEqual(
                expect.objectContaining({
                    status: 'executed',
                    origin: EXTENSION_ORIGIN,
                })
            )
        })

        it('rejects with an Error when the registry rejects with nothing', async () => {
            sdk.token.assets.mockRejectedValue(undefined)
            const tokenService = await signedIn()

            await expect(
                tokenService.token.transfer.create(transferParams)
            ).rejects.toBeInstanceOf(Error)
        })

        it('tells a signed transfer whose outcome is unknown from a failed one', async () => {
            const tokenService = await signedIn()

            sign.mockRejectedValueOnce(new Error('signer unavailable'))
            await expect(
                tokenService.token.transfer.create(transferParams)
            ).rejects.toMatchObject({
                code: errorCodes.rpc.transactionRejected,
            })

            execute.mockRejectedValueOnce(new Error('connection lost'))
            await expect(
                tokenService.token.transfer.create(transferParams)
            ).rejects.toMatchObject({
                code: errorCodes.rpc.internal,
                message: expect.stringContaining('outcome'),
            })
        })
    })

    describe('transfer.withdraw', () => {
        it('sends a v1 and a v2 withdraw to their own SDK call', async () => {
            const tokenService = await signedIn()
            const withdraw = {
                partyId: wallet.partyId,
                contractId: 'instruction-1',
                instrumentId: amulet,
            }

            await tokenService.token.transfer.withdraw({
                ...withdraw,
                version: 'v1',
            })
            expect(sdk.token.v1.transfer.withdraw).toHaveBeenCalledWith({
                transferInstructionCid: 'instruction-1',
                registryUrl,
            })
            expect(sdk.token.v2.transfer.withdraw).not.toHaveBeenCalled()

            await tokenService.token.transfer.withdraw({
                ...withdraw,
                version: 'v2',
            })
            expect(sdk.token.v2.transfer.withdraw).toHaveBeenCalledWith(
                'instruction-1',
                [wallet.partyId],
                registryUrl
            )
            expect(sdk.token.v1.transfer.withdraw).toHaveBeenCalledTimes(1)
            expect(execute).toHaveBeenCalledTimes(2)
        })
    })
})
